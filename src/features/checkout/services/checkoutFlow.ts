import { supabase } from '@/services/supabaseClient';
import { getStripe } from '@/services/stripeService';
import type { CartItem } from '@/types/shop.types';

export interface CheckoutResult {
  success: boolean;
  error?: string;
}

interface CreateSessionResponse {
  sessionId: string;
  url: string;
}

interface LineItemPayload {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}

export async function handleCheckout(
  items: CartItem[],
  totalAmount: number,
): Promise<CheckoutResult> {
  if (items.length === 0) {
    return { success: false, error: 'Le panier est vide.' };
  }

  // 1. Resolve current user (null = guest order)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Create order row with status "pending"
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
    return { success: false, error: orderError?.message ?? 'Impossible de créer la commande.' };
  }

  // 3. Insert order items — color comes from the product itself
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      items.map((item) => ({
        order_id:          order.id,
        product_id:        item.product.id,
        quantity:          item.quantity,
        size:              item.size,
        color:             item.product.color,
        custom_text:       null,
        custom_image_url:  null,
        price_at_purchase: item.unitPrice,
      })),
    );

  if (itemsError !== null) {
    return { success: false, error: itemsError.message };
  }

  // 4. Call Edge Function to create Stripe Checkout session (server-side)
  const lineItems: LineItemPayload[] = items.map((item) => ({
    name:        `${item.product.name} — Taille ${item.size}`,
    description: item.product.description ?? undefined,
    price:       item.unitPrice,
    quantity:    item.quantity,
    image:       item.product.image_url ?? undefined,
  }));

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
    return { success: false, error: fnError?.message ?? 'Erreur lors de la création de la session Stripe.' };
  }

  // 5. Redirect to Stripe Checkout
  if (sessionData.url) {
    window.location.assign(sessionData.url);
    return { success: true };
  }

  // Fallback via stripe.js SDK
  const stripe = await getStripe();
  if (stripe === null) {
    return { success: false, error: 'Impossible de charger le SDK Stripe.' };
  }

  const { error: redirectError } = await stripe.redirectToCheckout({ sessionId: sessionData.sessionId });
  if (redirectError !== undefined) {
    return { success: false, error: redirectError.message };
  }

  return { success: true };
}
