import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { firebaseDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

// Vercel requires this to read the raw body for Stripe signature verification
export const config = {
  api: { bodyParser: false },
};

/**
 * Maps Stripe price ID back to your plan slug.
 * We check all 6 env vars to find the matching slug.
 */
function planIdFromPriceId(priceId: string): string | null {
  const plans = ['starter', 'growth', 'pro'] as const;
  const cycles = ['monthly', 'annual'] as const;

  for (const plan of plans) {
    for (const cycle of cycles) {
      const key = `STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`;
      if (process.env[key] === priceId) return plan;
    }
  }
  return null;
}

function billingCycleFromPriceId(priceId: string): 'monthly' | 'annual' | null {
  const plans = ['starter', 'growth', 'pro'] as const;
  const cycles = ['monthly', 'annual'] as const;

  for (const plan of plans) {
    for (const cycle of cycles) {
      const key = `STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`;
      if (process.env[key] === priceId) return cycle;
    }
  }
  return null;
}

async function updateWorkplaceFromSubscription(
  workplaceId: string,
  subscription: Stripe.Subscription,
  customerId: string
) {
  if (!firebaseDb || !workplaceId) return;

  const priceId = subscription.items.data[0]?.price?.id ?? '';
  const planId = planIdFromPriceId(priceId) ?? (subscription.metadata?.planId || 'free');
  const billingCycle = billingCycleFromPriceId(priceId) ?? (subscription.metadata?.billingCycle || 'monthly');
  const status = subscription.status; // 'active' | 'past_due' | 'canceled' | 'trialing' etc.

  await firebaseDb.doc(`workplaces/${workplaceId}`).update({
    plan: status === 'active' || status === 'trialing' ? planId : 'free',
    planBillingCycle: billingCycle,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: status,
    updatedAt: new Date().toISOString(),
  });

  console.log(`[stripe/webhook] Updated workplace ${workplaceId}: plan=${planId}, status=${status}`);
}

/**
 * POST /api/stripe/webhook
 * Stripe sends events here. Must be registered in the Stripe dashboard
 * (or via CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook).
 *
 * Required env var: STRIPE_WEBHOOK_SECRET
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('[stripe/webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (!firebaseDb) {
    console.error('[stripe/webhook] Firestore Admin not initialized');
    return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  }

  try {
    switch (event.type) {
      // ----------------------------------------------------------------
      // Checkout completed — first payment or subscription created
      // ----------------------------------------------------------------
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const workplaceId = session.metadata?.workplaceId;
        const customerId = session.customer as string;

        if (!workplaceId || !customerId) break;

        // Fetch the full subscription object
        if (session.subscription) {
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await updateWorkplaceFromSubscription(workplaceId, sub, customerId);
        }
        break;
      }

      // ----------------------------------------------------------------
      // Subscription updated (plan change, renewal, payment method swap)
      // ----------------------------------------------------------------
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const workplaceId = sub.metadata?.workplaceId;
        const customerId = sub.customer as string;
        if (workplaceId) {
          await updateWorkplaceFromSubscription(workplaceId, sub, customerId);
        }
        break;
      }

      // ----------------------------------------------------------------
      // Subscription cancelled / expired
      // ----------------------------------------------------------------
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const workplaceId = sub.metadata?.workplaceId;
        if (!workplaceId) break;

        await firebaseDb.doc(`workplaces/${workplaceId}`).update({
          plan: 'free',
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
          updatedAt: new Date().toISOString(),
        });

        console.log(`[stripe/webhook] Subscription canceled for workspace ${workplaceId}`);
        break;
      }

      // ----------------------------------------------------------------
      // Payment failed — mark as past_due but keep plan accessible
      // ----------------------------------------------------------------
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // In the 2026 API the subscription ID lives on invoice.parent for
        // subscription invoices. Fall back through both shapes for safety.
        const invoiceAny = invoice as any;
        const subId: string | null =
          invoiceAny?.parent?.subscription_details?.subscription ??
          invoiceAny?.subscription ??
          null;
        if (!subId) break;

        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(subId);
        const workplaceId = sub.metadata?.workplaceId;
        if (!workplaceId) break;

        await firebaseDb.doc(`workplaces/${workplaceId}`).update({
          subscriptionStatus: 'past_due',
          updatedAt: new Date().toISOString(),
        });

        console.log(`[stripe/webhook] Payment failed for workspace ${workplaceId}`);
        break;
      }

      default:
        // Unhandled event type — just acknowledge
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[stripe/webhook] Handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
