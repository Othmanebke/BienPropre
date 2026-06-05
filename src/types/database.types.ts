export type OrderStatus = 'pending' | 'paid' | 'failed' | 'shipped';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };

      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_price: number;
          is_customizable: boolean;
          image_url: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          base_price: number;
          is_customizable?: boolean;
          image_url?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          base_price?: number;
          is_customizable?: boolean;
          image_url?: string | null;
          color?: string;
        };
      };

      orders: {
        Row: {
          id: string;
          user_id: string | null;
          stripe_session_id: string | null;
          status: OrderStatus;
          total_amount: number;
          shipping_address: ShippingAddress | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          stripe_session_id?: string | null;
          status?: OrderStatus;
          total_amount: number;
          shipping_address?: ShippingAddress | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_session_id?: string | null;
          status?: OrderStatus;
          total_amount?: number;
          shipping_address?: ShippingAddress | null;
          updated_at?: string;
        };
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          size: string;
          color: string;
          custom_text: string | null;
          custom_image_url: string | null;
          price_at_purchase: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          size: string;
          color: string;
          custom_text?: string | null;
          custom_image_url?: string | null;
          price_at_purchase: number;
        };
        Update: {
          quantity?: number;
          size?: string;
          color?: string;
          custom_text?: string | null;
          custom_image_url?: string | null;
          price_at_purchase?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
    };
  };
}

export interface ShippingAddress {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
}
