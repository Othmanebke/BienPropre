import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import type { Product } from '@/types/shop.types';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else     setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <PageLoader />;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">La collection</h1>
        <p className="mt-2 text-gray-500">
          {products.length} design{products.length !== 1 ? 's' : ''} disponible
          {products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {/* Placeholder quand pas encore de produits en DB */}
      {products.length === 0 && !error && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <ShoppingBag className="w-14 h-14 text-gray-200" />
          <p className="text-gray-400">
            La collection arrive bientôt — revenez nous voir !
          </p>
        </div>
      )}

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Product image */}
            <Link to={`/products/${product.id}`} className="block overflow-hidden bg-gray-50">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                /* Colour swatch placeholder tant qu'il n'y a pas de photo */
                <div
                  className="flex h-64 w-full items-center justify-center"
                  style={{ backgroundColor: product.color }}
                >
                  <span className="rounded-full bg-black/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                    Photo à venir
                  </span>
                </div>
              )}
            </Link>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-gray-900 leading-snug">{product.name}</h2>
                <span className="shrink-0 text-lg font-bold text-gray-900">
                  {product.base_price.toFixed(2)}&nbsp;€
                </span>
              </div>

              {product.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
              )}

              <Link to={`/products/${product.id}`} className="mt-auto">
                <Button className="w-full" size="sm">
                  Choisir ma taille
                </Button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
