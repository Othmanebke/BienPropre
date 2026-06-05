import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CartItem, TShirtSize } from '@/types/shop.types';

// ------------------------------------
// State shape
// ------------------------------------
interface CartState {
  items: CartItem[];
  readonly totalPrice: number;
  readonly totalItems: number;
  isOpen: boolean;
}

// ------------------------------------
// Actions shape
// ------------------------------------
interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateSize: (cartItemId: string, size: TShirtSize) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// ------------------------------------
// Helpers
// ------------------------------------
function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function computeTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// ------------------------------------
// Store
// ------------------------------------
export const useCartStore = create<CartState & CartActions>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,

        get totalPrice() {
          return computeTotal(get().items);
        },

        get totalItems() {
          return computeTotalItems(get().items);
        },

        addItem: (item: CartItem) => {
          const existing = get().items.find(
            (i) =>
              i.product.id === item.product.id &&
              i.size === item.size &&
              i.color === item.color &&
              i.customText === item.customText &&
              i.customImageUrl === item.customImageUrl,
          );

          if (existing) {
            set(
              (state) => ({
                items: state.items.map((i) =>
                  i.cartItemId === existing.cartItemId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i,
                ),
              }),
              false,
              'addItem/merge',
            );
          } else {
            set(
              (state) => ({ items: [...state.items, item] }),
              false,
              'addItem/new',
            );
          }
        },

        removeItem: (cartItemId) =>
          set(
            (state) => ({
              items: state.items.filter((i) => i.cartItemId !== cartItemId),
            }),
            false,
            'removeItem',
          ),

        updateQuantity: (cartItemId, quantity) => {
          if (quantity < 1) {
            get().removeItem(cartItemId);
            return;
          }
          set(
            (state) => ({
              items: state.items.map((i) =>
                i.cartItemId === cartItemId ? { ...i, quantity } : i,
              ),
            }),
            false,
            'updateQuantity',
          );
        },

        updateSize: (cartItemId, size) =>
          set(
            (state) => ({
              items: state.items.map((i) =>
                i.cartItemId === cartItemId ? { ...i, size } : i,
              ),
            }),
            false,
            'updateSize',
          ),

        clearCart: () => set({ items: [] }, false, 'clearCart'),

        openCart: () => set({ isOpen: true }, false, 'openCart'),

        closeCart: () => set({ isOpen: false }, false, 'closeCart'),
      }),
      {
        name: 'bienpropre-cart',
        // Only persist the items array, not isOpen
        partialize: (state) => ({ items: state.items }),
      },
    ),
    { name: 'CartStore' },
  ),
);
