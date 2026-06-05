import { loadStripe, type Stripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env['VITE_STRIPE_PUBLISHABLE_KEY'];

if (!publishableKey || typeof publishableKey !== 'string') {
  throw new Error(
    '[stripeService] VITE_STRIPE_PUBLISHABLE_KEY is missing. ' +
    'Copy .env.example → .env.local and fill in the value.',
  );
}

// Singleton promise — Stripe SDK is loaded once and shared across the app.
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
