import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import type { Product } from '@/types/shop.types';
import { PageLoader } from '@/components/ui/PageLoader';
import { CustomizerStudio } from '@/features/customizer/components/CustomizerStudio';

export default function CustomizerPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct]   = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error !== null || data === null) {
          setNotFound(true);
        } else {
          setProduct(data);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading)              return <PageLoader />;
  if (notFound || !product) return <Navigate to="/404" replace />;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/products"
          className="flex items-center gap-1 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Catalogue
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Studio de personnalisation
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Choisissez la couleur, la taille, et ajoutez votre texte ou image.
        Le t-shirt se met à jour en temps réel.
      </p>

      <CustomizerStudio product={product} />
    </main>
  );
}
