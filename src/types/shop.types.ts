import type { Database } from './database.types';

// ------------------------------------
// Domain aliases
// ------------------------------------
export type Product   = Database['public']['Tables']['products']['Row'];
export type Order     = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Profile   = Database['public']['Tables']['profiles']['Row'];

// ------------------------------------
// T-shirt sizes
// ------------------------------------
export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export const T_SHIRT_SIZES: readonly TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

// ------------------------------------
// Cart — catalogue fixe, pas de personnalisation client
// ------------------------------------
export interface CartItem {
  /** Unique id for this cart line (generated client-side) */
  cartItemId: string;
  product: Product;
  quantity: number;
  size: TShirtSize;
  /** Unit price locked at the time of adding to cart */
  unitPrice: number;
}

// ------------------------------------
// Checkout
// ------------------------------------
export interface CreateOrderPayload {
  userId: string | null;
  items: CartItem[];
  totalAmount: number;
}

export interface StripeLineItem {
  price_data: {
    currency: 'eur';
    unit_amount: number;
    product_data: {
      name: string;
      description: string;
      images: string[];
    };
  };
  quantity: number;
}
