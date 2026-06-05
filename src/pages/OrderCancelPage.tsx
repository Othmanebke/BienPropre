import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OrderCancelPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <XCircle className="w-16 h-16 text-red-400" />
      <h1 className="text-3xl font-bold text-gray-900">Paiement annulé</h1>
      <p className="max-w-sm text-gray-500">
        Votre commande n'a pas été finalisée. Votre panier est intact.
      </p>
      <Link to="/checkout">
        <Button size="lg" variant="secondary">
          Réessayer
        </Button>
      </Link>
    </main>
  );
}
