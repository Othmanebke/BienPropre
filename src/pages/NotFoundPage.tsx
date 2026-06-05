import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-7xl font-extrabold text-brand-100">404</p>
      <h1 className="text-3xl font-bold text-gray-900">Page introuvable</h1>
      <p className="max-w-sm text-gray-500">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/">
        <Button size="lg">Retour à l'accueil</Button>
      </Link>
    </main>
  );
}
