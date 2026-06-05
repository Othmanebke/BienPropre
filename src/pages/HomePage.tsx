import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Star,
    title: 'Designs exclusifs',
    description: 'Chaque t-shirt est un design unique, créé par nos artistes.',
  },
  {
    icon: Truck,
    title: 'Livraison rapide',
    description: 'Imprimé et expédié sous 48 h. Livraison en 2–4 jours ouvrés.',
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
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0ea5e940,_transparent_60%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300">
            Impression à la demande · Livraison offerte dès 50 €
          </span>

          <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Des t-shirts{' '}
            <span className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
              exclusifs
            </span>
            , livrés chez vous.
          </h1>

          <p className="max-w-xl text-lg text-gray-400">
            Des designs soignés, imprimés à la demande sur des t-shirts premium.
            Choisissez votre taille et recevez votre commande en quelques jours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/products">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Voir la collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <ul className="grid gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
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

      {/* ── CTA bottom ── */}
      <section className="bg-brand-600 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Prêt à commander ?</h2>
        <p className="mt-2 text-brand-100">
          Découvrez tous nos designs disponibles.
        </p>
        <Link to="/products" className="mt-6 inline-block">
          <Button variant="secondary" size="lg">
            Voir la collection
          </Button>
        </Link>
      </section>
    </main>
  );
}
