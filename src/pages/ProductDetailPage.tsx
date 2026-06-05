import { useEffect, useState, useCallback } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { useCartStore } from '@/store/useCartStore';
import type { Product, TShirtSize } from '@/types/shop.types';
import { T_SHIRT_SIZES } from '@/types/shop.types';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct]   = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedSize, setSelectedSize] = useState<TShirtSize | null>(null);
  const [quantity, setQuantity]         = useState(1);
  const [added, setAdded]               = useState(false);
  const [sizeError, setSizeError]       = useState(false);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setProduct(data);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (!selectedSize) { setSizeError(true); return; }

    setSizeError(false);
    addItem({
      cartItemId: crypto.randomUUID(),
      product,
      quantity,
      size: selectedSize,
      unitPrice: product.base_price,
    });

    // Flash confirmation then open cart
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 900);
  }, [product, selectedSize, quantity, addItem, openCart]);

  if (loading)              return <PageLoader />;
  if (notFound || !product) return <Navigate to="/404" replace />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/products" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Collection
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

        {/* ── Image ── */}
        <div className="w-full lg:w-1/2">
          <div className="overflow-hidden rounded-2xl bg-gray-50">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex aspect-square w-full items-center justify-center"
                style={{ backgroundColor: product.color }}
              >
                <span className="rounded-full bg-black/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
                  Photo à venir
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Infos + actions ── */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-3xl font-bold text-brand-600">
              {product.base_price.toFixed(2)}&nbsp;€
            </p>
            {product.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Colour dot */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Couleur</span>
            <span
              className="inline-block h-6 w-6 rounded-full border-2 border-gray-200 shadow-sm"
              style={{ backgroundColor: product.color }}
              title={product.color}
            />
          </div>

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Taille</span>
              {sizeError && (
                <span className="text-xs text-red-500">Veuillez choisir une taille</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {T_SHIRT_SIZES.map((size: TShirtSize) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selectedSize === size}
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  className={[
                    'min-w-[3rem] rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-150',
                    selectedSize === size
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                      : sizeError
                      ? 'border-red-300 bg-red-50 text-red-600 hover:border-red-400'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-brand-400',
                  ].join(' ')}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Quantité</span>
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-40"
                aria-label="Diminuer"
              >
                −
              </button>
              <span className="w-8 text-center text-base font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
                aria-label="Augmenter"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            leftIcon={
              added
                ? <Check className="w-5 h-5" />
                : <ShoppingCart className="w-5 h-5" />
            }
          >
            {added ? 'Ajouté !' : `Ajouter au panier — ${(product.base_price * quantity).toFixed(2)} €`}
          </Button>

          {/* Reassurances */}
          <ul className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            {[
              '✓ Impression haute qualité',
              '✓ Coton 100 % bio',
              '✓ Livraison offerte dès 50 €',
              '✓ Retours sous 30 jours',
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
