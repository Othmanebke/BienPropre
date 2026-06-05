// Supabase Edge Function — create-checkout-session
// Runtime: Deno (Supabase Edge Runtime)
//
// Creates a Stripe Checkout session server-side (secret key never exposed
// to the browser), stores the resulting session ID, and returns the
// session URL so the client can redirect immediately.
//
// Deploy:
//   supabase functions deploy create-checkout-session
//
// Required secrets (set via `supabase secrets set KEY=value`):
//   STRIPE_SECRET_KEY          — Stripe secret key (sk_live_… / sk_test_…)
//   SUPABASE_URL               — automatically injected by Supabase
//   SUPABASE_SERVICE_ROLE_KEY  — automatically injected by Supabase

import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno&deno-std=0.132.0&no-check=true';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

// ─── CORS headers (required for browser fetch / supabase.functions.invoke) ──
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Stripe client ────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion:  '2024-06-20',
  httpClient:  Stripe.createFetchHttpClient(),
});

// ─── Supabase admin client (bypasses RLS to update the order row) ─
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')              ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// ─── Request body shape ───────────────────────────────────────────
interface LineItemInput {
  name:        string;
  description?: string;
  price:       number;   // in euros (e.g. 22.99)
  quantity:    number;
  image?:      string;
}

interface RequestBody {
  orderId:    string;
  items:      LineItemInput[];
  successUrl: string;
  cancelUrl:  string;
}

// ─── Handler ─────────────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {
  // Pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS, status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status:  405,
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { orderId, items, successUrl, cancelUrl } = body;

    // ── Validate input ───────────────────────────────────────────────
    if (!orderId || !Array.isArray(items) || items.length === 0) {
      return jsonError('Paramètres invalides : orderId et items sont requis.', 400);
    }

    // ── Build Stripe line items ───────────────────────────────────────
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
        name: item.name,
      };
      if (item.description) productData.description = item.description;
      if (item.image)        productData.images      = [item.image];

      return {
        price_data: {
          currency:     'eur',
          product_data: productData,
          // Stripe works in the smallest currency unit (cents)
          unit_amount:  Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // ── Create Stripe Checkout session ───────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items:           lineItems,
      mode:                 'payment',
      success_url:          successUrl,
      cancel_url:           cancelUrl,
      // The order ID travels through Stripe → webhook → DB update
      metadata: {
        order_id: orderId,
      },
      // Collect shipping address; restrict to supported countries
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'DE', 'ES', 'IT', 'NL'],
      },
      // Allow Stripe to auto-calculate tax (requires Tax settings in Stripe dashboard)
      automatic_tax: { enabled: false },
    });

    // ── Pre-store the session ID so the webhook can find the order ────
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId);

    // ── Return session info to the client ────────────────────────────
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        status:  200,
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[create-checkout-session] Error:', message);
    return jsonError(message, 500);
  }
});

// ─── Helpers ─────────────────────────────────────────────────────
function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    status,
  });
}
