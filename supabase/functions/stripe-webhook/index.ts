// Supabase Edge Function — stripe-webhook
// Runtime: Deno (Supabase Edge Runtime)
//
// Listens for Stripe webhook events and keeps the `orders` table in sync.
//
// Events handled:
//   checkout.session.completed  → status: 'paid'   + shipping_address
//   checkout.session.expired    → status: 'failed'
//   payment_intent.payment_failed → status: 'failed' (belt-and-suspenders)
//
// Deploy:
//   supabase functions deploy stripe-webhook
//
// Required secrets:
//   STRIPE_SECRET_KEY          — Stripe secret key
//   STRIPE_WEBHOOK_SECRET      — Signing secret from Stripe webhook endpoint
//                                (whsec_…), obtained via Stripe Dashboard or CLI
//   SUPABASE_URL               — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY  — auto-injected
//
// Register the webhook URL in Stripe Dashboard:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook

import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno&deno-std=0.132.0&no-check=true';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';
import type { Database } from '../../_shared/database.types.ts';

// ─── Clients ─────────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

// Service-role client: bypasses RLS so we can update any order row.
const supabaseAdmin = createClient<Database>(
  Deno.env.get('SUPABASE_URL')              ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

// ─── Handler ─────────────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // ── 1. Read raw body (required for signature verification) ─────────
  const rawBody  = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('[stripe-webhook] Missing stripe-signature header.');
    return new Response('Missing stripe-signature header.', { status: 400 });
  }

  // ── 2. Verify Stripe signature ─────────────────────────────────────
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      WEBHOOK_SECRET,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[stripe-webhook] Signature verification failed:', msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type} (${event.id})`);

  // ── 3. Dispatch on event type ─────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        await handleSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        // Acknowledge events we don't handle to prevent Stripe retries.
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[stripe-webhook] Handler error for ${event.type}:`, msg);
    // Return 500 so Stripe retries the delivery.
    return new Response(`Internal error: ${msg}`, { status: 500 });
  }

  // ── 4. Acknowledge receipt to Stripe ─────────────────────────────
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status:  200,
  });
});

// ─── Event handlers ───────────────────────────────────────────────

async function handleSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.['order_id'];

  if (!orderId) {
    console.warn('[stripe-webhook] checkout.session.completed — no order_id in metadata.');
    return;
  }

  // Build shipping address from Stripe's response (may be null for digital goods)
  const shipping = session.shipping_details;
  const addr     = shipping?.address;

  const shippingAddress = addr
    ? {
        full_name:   shipping?.name    ?? '',
        line1:       addr.line1        ?? '',
        line2:       addr.line2        ?? undefined,
        city:        addr.city         ?? '',
        postal_code: addr.postal_code  ?? '',
        country:     addr.country      ?? '',
      }
    : null;

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status:            'paid',
      stripe_session_id: session.id,
      ...(shippingAddress !== null ? { shipping_address: shippingAddress } : {}),
    })
    .eq('id', orderId);

  if (error) {
    throw new Error(`DB update failed for order ${orderId}: ${error.message}`);
  }

  console.log(`[stripe-webhook] Order ${orderId} marked as paid.`);
}

async function handleSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.['order_id'];
  if (!orderId) return;

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'failed' })
    .eq('id', orderId)
    .eq('status', 'pending');  // Only update if still pending (idempotency guard)

  if (error) {
    throw new Error(`DB update (expired) failed for order ${orderId}: ${error.message}`);
  }

  console.log(`[stripe-webhook] Order ${orderId} marked as failed (session expired).`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  // Look up the order by matching the Stripe session that holds this payment intent.
  // The stripe_session_id was pre-stored in create-checkout-session.
  const { data: orders, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('stripe_session_id', paymentIntent.id)
    .limit(1);

  if (fetchError) {
    throw new Error(`Could not look up order for payment intent: ${fetchError.message}`);
  }

  const order = orders?.[0];
  if (!order || order.status !== 'pending') return;

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'failed' })
    .eq('id', order.id);

  if (error) {
    throw new Error(`DB update (payment failed) failed for order ${order.id}: ${error.message}`);
  }

  console.log(`[stripe-webhook] Order ${order.id} marked as failed (payment_intent failed).`);
}
