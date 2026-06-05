import type { Database } from './database.types';

// ------------------------------------
// Domain aliases (convenience re-exports from DB rows)
// ------------------------------------
export type Product   = Database['public']['Tables']['products']['Row'];
export type Order     = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Profile   = Database['public']['Tables']['profiles']['Row'];

// ------------------------------------
// T-shirt configuration (customizer state)
// ------------------------------------
export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export const T_SHIRT_SIZES: readonly TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export interface TextLayer {
  text: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
}

export interface ImageLayer {
  previewUrl: string;
  storagePath: string;
  publicUrl: string;
  scale: number;
  x: number;
  y: number;
}

export interface CustomizerState {
  selectedColor: string;
  selectedSize: TShirtSize;
  textLayer: TextLayer | null;
  imageLayer: ImageLayer | null;
  quantity: number;
}

// ------------------------------------
// Cart
// ------------------------------------
export interface CartItem {
  /** Unique id for this cart line (generated client-side, e.g. nanoid) */
  cartItemId: string;
  product: Product;
  quantity: number;
  size: TShirtSize;
  color: string;
  customText: string | null;
  customImageUrl: string | null;
  /** Unit price including any customization surcharge */
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

// ------------------------------------
// Available t-shirt colour swatches
// ------------------------------------
export interface ColorSwatch {
  label: string;
  hex: string;
}

export const COLOR_SWATCHES: readonly ColorSwatch[] = [
  { label: 'Blanc',      hex: '#FFFFFF' },
  { label: 'Noir',       hex: '#1A1A1A' },
  { label: 'Gris clair', hex: '#D1D5DB' },
  { label: 'Marine',     hex: '#1E3A5F' },
  { label: 'Rouge',      hex: '#DC2626' },
  { label: 'Vert sauge', hex: '#6B7C6B' },
  { label: 'Jaune',      hex: '#FCD34D' },
  { label: 'Rose',       hex: '#F9A8D4' },
] as const;
