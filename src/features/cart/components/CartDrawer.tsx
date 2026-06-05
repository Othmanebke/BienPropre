import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={[
          'fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label="Panier"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Mon panier
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({items.reduce((n, i) => n + i.quantity, 0)} article
                {items.reduce((n, i) => n + i.quantity, 0) > 1 ? 's' : ''})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
              <p className="text-sm text-gray-400">Votre panier est vide.</p>
              <Button variant="secondary" size="sm" onClick={closeCart}>
                Voir la collection
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.cartItemId}
                  className="flex gap-3 rounded-xl border border-gray-100 p-3"
                >
                  {/* Product image or colour swatch */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{ backgroundColor: item.product.color }}
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">Taille : {item.size}</p>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-1">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          aria-label="Diminuer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          aria-label="Augmenter"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {(item.unitPrice * item.quantity).toFixed(2)}&nbsp;€
                        </span>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">
                {totalPrice.toFixed(2)}&nbsp;€
              </span>
            </div>
            <Link to="/checkout" onClick={closeCart}>
              <Button className="w-full" size="lg">
                Commander
              </Button>
            </Link>
            <p className="text-center text-xs text-gray-400">Paiement sécurisé via Stripe</p>
          </div>
        )}
      </aside>
    </>
  );
}
