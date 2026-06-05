// Minimal type subset shared by Edge Functions.
// Keep in sync with src/types/database.types.ts.

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'shipped';

export interface ShippingAddress {
  full_name:    string;
  line1:        string;
  line2?:       string;
  city:         string;
  postal_code:  string;
  country:      string;
  phone?:       string;
}

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id:                string;
          user_id:           string | null;
          stripe_session_id: string | null;
          status:            OrderStatus;
          total_amount:      number;
          shipping_address:  ShippingAddress | null;
          created_at:        string;
          updated_at:        string;
        };
        Insert: {
          id?:               string;
          user_id?:          string | null;
          stripe_session_id?: string | null;
          status?:           OrderStatus;
          total_amount:      number;
          shipping_address?: ShippingAddress | null;
        };
        Update: {
          stripe_session_id?: string | null;
          status?:            OrderStatus;
          total_amount?:      number;
          shipping_address?:  ShippingAddress | null;
        };
      };
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
    };
  };
}
