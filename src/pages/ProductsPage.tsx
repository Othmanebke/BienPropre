import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Paintbrush } from 'lucide-react';
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
        if (err) {
          setError(err.message);
        } else {
          setProducts(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <PageLoader />;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Catalogue</h1>
      <p className="mt-2 text-gray-500">
        Choisissez votre base, puis personnalisez-la à votre image.
      </p>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
      )}

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li
            key={product.id}
            className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center bg-gray-50 p-8 h-52">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="h-28 w-28 rounded-xl bg-gray-200" />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
              <h2 className="font-semibold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500 flex-1">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  {product.base_price.toFixed(2)} €
                </span>
                {product.is_customizable && (
                  <Link to={`/customize/${product.id}`}>
                    <Button
                      size="sm"
                      leftIcon={<Paintbrush className="w-4 h-4" />}
                    >
                      Personnaliser
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
