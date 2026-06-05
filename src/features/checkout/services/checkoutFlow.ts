import { supabase } from '@/services/supabaseClient';
import { getStripe } from '@/services/stripeService';
import type { CartItem } from '@/types/shop.types';

// ─── Public result type ───────────────────────────────────────────
export interface CheckoutResult {
  success: boolean;
  error?: string;
}

// ─── Edge Function response shape ────────────────────────────────
interface CreateSessionResponse {
  sessionId: string;
  url: string;
}

// ─── Payload sent to the Edge Function ───────────────────────────
interface LineItemPayload {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}

// ─── Main flow ────────────────────────────────────────────────────
/**
 * Full checkout orchestration:
 *  1. Read current Supabase session (user may be null for guest orders).
 *  2. Persist the order + order_items in the database with status "pending".
 *  3. Invoke the "create-checkout-session" Edge Function to create a
 *     Stripe Checkout session (runs server-side with the secret key).
 *  4. Redirect the browser to the Stripe-hosted checkout page.
 *
 * On success the function initiates a navigation and never returns a
 * resolved value — the caller should disable its button and wait.
 * On failure it returns { success: false, error: "..." }.
 */
export async function handleCheckout(
  items: CartItem[],
  totalAmount: number,
): Promise<CheckoutResult> {
  if (items.length === 0) {
    return { success: false, error: 'Le panier est vide.' };
  }

  // ── Step 1 : resolve current user (guest = null) ─────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Step 2a : create parent order row ─────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id:      user?.id ?? null,
      status:       'pending',
      total_amount: totalAmount,
    })
    .select('id')
    .single();

  if (orderError !== null || order === null) {
    return {
      success: false,
      error: orderError?.message ?? 'Impossible de créer la commande.',
    };
  }

  // ── Step 2b : create order_items rows ─────────────────────────────
  const orderItemsPayload = items.map((item) => ({
    order_id:          order.id,
    product_id:        item.product.id,
    quantity:          item.quantity,
    size:              item.size,
    color:             item.color,
    custom_text:       item.customText       ?? null,
    custom_image_url:  item.customImageUrl   ?? null,
    price_at_purchase: item.unitPrice,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload);

  if (itemsError !== null) {
    return { success: false, error: itemsError.message };
  }

  // ── Step 3 : call Edge Function ────────────────────────────────────
  const lineItems: LineItemPayload[] = items.map((item) => {
    const descParts: string[] = [];
    if (item.customText)     descParts.push(`Texte : « ${item.customText} »`);
    if (item.customImageUrl) descParts.push('Design personnalisé inclus');
    descParts.push(`Taille ${item.size} · Couleur ${item.color}`);

    return {
      name:        item.product.name,
      description: descParts.join(' · '),
      price:       item.unitPrice,
      quantity:    item.quantity,
      image:       item.product.image_url ?? undefined,
    };
  });

  const { data: sessionData, error: fnError } = await supabase.functions.invoke<CreateSessionResponse>(
    'create-checkout-session',
    {
      body: {
        orderId:    order.id,
        items:      lineItems,
        successUrl: `${window.location.origin}/order/success`,
        cancelUrl:  `${window.location.origin}/order/cancel`,
      },
    },
  );

  if (fnError !== null || sessionData === null) {
    return {
      success: false,
      error: fnError?.message ?? 'Erreur lors de la création de la session Stripe.',
    };
  }

  // ── Step 4 : redirect to Stripe ───────────────────────────────────
  // Primary path: use the full Checkout URL returned by Stripe.
  if (sessionData.url) {
    window.location.assign(sessionData.url);
    return { success: true };
  }

  // Fallback: stripe.redirectToCheckout (deprecated but still supported).
  const stripe = await getStripe();
  if (stripe === null) {
    return { success: false, error: 'Impossible de charger le SDK Stripe.' };
  }

  const { error: redirectError } = await stripe.redirectToCheckout({
    sessionId: sessionData.sessionId,
  });

  if (redirectError !== undefined) {
    return { success: false, error: redirectError.message };
  }

  return { success: true };
}
