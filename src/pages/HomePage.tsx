import { Link } from 'react-router-dom';
import { ArrowRight, Paintbrush, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Paintbrush,
    title: 'Studio de création',
    description: 'Ajoutez texte et visuels sur votre t-shirt en temps réel.',
  },
  {
    icon: Truck,
    title: 'Livraison rapide',
    description: 'Expédition sous 48 h, livraison en 2–4 jours ouvrés.',
  },
  {
    icon: ShieldCheck,
    title: 'Paiement sécurisé',
    description: 'Transactions chiffrées via Stripe. Aucune donnée bancaire stockée.',
  },
] as const;

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-white py-20 px-4 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Votre t-shirt,{' '}
          <span className="text-brand-600">votre création.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600">
          Personnalisez un t-shirt premium en quelques clics. Texte, image, couleur — tout
          est possible.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/products">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Créer le mien
            </Button>
          </Link>
          <Link to="/products">
            <Button size="lg" variant="secondary">
              Voir le catalogue
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <ul className="grid gap-8 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 p-6 text-center shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <Icon className="w-6 h-6 text-brand-600" />
              </span>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
