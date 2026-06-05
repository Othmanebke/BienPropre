import { useState, useCallback, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldCheck, User, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';
import { useCartStore } from '@/store/useCartStore';
import { handleCheckout } from '@/features/checkout/services/checkoutFlow';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore();

  const [user, setUser]               = useState<SupabaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Track auth state in real-time
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Core checkout trigger ─────────────────────────────────────────
  const runCheckout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await handleCheckout(items, totalPrice);

    // Only runs if the redirect failed — on success the browser navigates away
    if (!result.success) {
      setError(result.error ?? 'Une erreur inattendue est survenue.');
      setIsLoading(false);
    }
  }, [items, totalPrice]);

  // ── Pay button handler ────────────────────────────────────────────
  const handlePayClick = useCallback(() => {
    if (user !== null) {
      void runCheckout();
    } else {
      setShowAuthModal(true);
    }
  }, [user, runCheckout]);

  // Guard: redirect if cart is empty
  if (items.length === 0) return <Navigate to="/products" replace />;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/products"
          className="flex items-center gap-1 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuer mes achats
        </Link>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Récapitulatif de commande
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ═══════════════════════════════════════════════════════
            LEFT — Items list
        ═══════════════════════════════════════════════════════ */}
        <div className="flex-1">
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {items.map((item) => (
              <li key={item.cartItemId} className="flex gap-4 p-4">
                {/* Colour swatch */}
                <div
                  className="h-14 w-14 shrink-0 rounded-xl border border-gray-100"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />

                {/* Details */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Taille&nbsp;{item.size}&nbsp;·&nbsp;×{item.quantity}
                  </p>
                  {item.customText !== null && item.customText !== '' && (
                    <p className="text-xs italic text-gray-400 truncate">
                      « {item.customText} »
                    </p>
                  )}
                  {item.customImageUrl !== null && (
                    <p className="text-xs text-gray-400">Design personnalisé inclus</p>
                  )}
                </div>

                {/* Line price */}
                <p className="self-center whitespace-nowrap font-semibold text-gray-900">
                  {(item.unitPrice * item.quantity).toFixed(2)}&nbsp;€
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* ═══════════════════════════════════════════════════════
            RIGHT — Order summary + CTA
        ═══════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-lg">Résumé</h2>

            {/* Price breakdown */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  Sous-total ({items.reduce((n, i) => n + i.quantity, 0)}&nbsp;article
                  {items.reduce((n, i) => n + i.quantity, 0) > 1 ? 's' : ''})
                </span>
                <span>{totalPrice.toFixed(2)}&nbsp;€</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="font-medium text-green-600">Offerte</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)}&nbsp;€</span>
              </div>
            </div>

            {/* Auth status banner */}
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
              {user !== null ? (
                <>
                  <User className="w-4 h-4 shrink-0 text-brand-600" />
                  <span className="truncate text-xs text-gray-600">{user.email}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 shrink-0 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Non connecté —{' '}
                    <button
                      type="button"
                      className="text-brand-600 hover:underline"
                      onClick={() => setShowAuthModal(true)}
                    >
                      Se connecter
                    </button>
                    {' '}ou commander en invité
                  </span>
                </>
              )}
            </div>

            {/* Error banner */}
            {error !== null && (
              <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* CTA */}
            <Button
              size="lg"
              className="w-full"
              isLoading={isLoading}
              onClick={handlePayClick}
              leftIcon={
                isLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <ShieldCheck className="w-5 h-5" />
              }
            >
              {isLoading ? 'Redirection…' : 'Payer maintenant'}
            </Button>

            <p className="text-center text-xs text-gray-400">
              Vous serez redirigé vers Stripe.
              Aucune donnée bancaire n&apos;est stockée sur nos serveurs.
            </p>
          </div>
        </div>
      </div>

      {/* ── Auth modal ── */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          void runCheckout();
        }}
        onGuestContinue={() => {
          setShowAuthModal(false);
          void runCheckout();
        }}
      />
    </main>
  );
}
