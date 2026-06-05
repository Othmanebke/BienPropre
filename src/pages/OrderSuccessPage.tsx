import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useEffect } from 'react';

export default function OrderSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <CheckCircle2 className="w-16 h-16 text-green-500" />
      <h1 className="text-3xl font-bold text-gray-900">Commande confirmée !</h1>
      <p className="max-w-sm text-gray-500">
        Merci pour votre achat. Vous recevrez un e-mail de confirmation sous peu.
      </p>
      <Link to="/products">
        <Button size="lg">Continuer mes achats</Button>
      </Link>
    </main>
  );
}
