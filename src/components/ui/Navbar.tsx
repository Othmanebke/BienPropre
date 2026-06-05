import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, Shirt } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export function Navbar() {
  const { items, openCart } = useCartStore();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
          <Shirt className="w-6 h-6 text-brand-600" />
          BienPropre
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive
                ? 'text-brand-600 font-medium text-sm'
                : 'text-gray-600 hover:text-gray-900 text-sm transition-colors'
            }
          >
            Catalogue
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/account"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Mon compte"
          >
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={openCart}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label={`Panier — ${itemCount} article${itemCount !== 1 ? 's' : ''}`}
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
