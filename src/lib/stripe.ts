import Stripe from 'stripe';

/**
 * Singleton Stripe client for server-side API routes.
 * Uses the STRIPE_SECRET_KEY env var — never exposed to the browser.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      '[stripe] STRIPE_SECRET_KEY is not set. Add it to your environment variables.'
    );
  }

  _stripe = new Stripe(key, {
    apiVersion: '2026-08-26.dahlia',
    typescript: true,
  });

  return _stripe;
}

/**
 * Maps (planId, billingCycle) -> Stripe Price ID from env vars.
 * All 6 Price IDs must be configured in your environment.
 */
export function getPriceId(
  planId: 'starter' | 'growth' | 'pro',
  billingCycle: 'monthly' | 'annual'
): string {
  const key = `STRIPE_PRICE_${planId.toUpperCase()}_${billingCycle.toUpperCase()}`;
  const priceId = process.env[key];
  if (!priceId) {
    throw new Error(
      `[stripe] Missing env var: ${key}. Create the Price in your Stripe dashboard and add the Price ID to your environment.`
    );
  }
  return priceId;
}
