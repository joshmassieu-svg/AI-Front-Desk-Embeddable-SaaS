import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPriceId } from '@/lib/stripe';
import { firebaseDb } from '@/lib/firebase-admin';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tanptal';
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const sessionCookie = req.cookies.get('__session')?.value;
  if (!sessionCookie) return null;
  try {
    const { payload } = await jwtVerify(sessionCookie, FIREBASE_JWKS, {
      audience: PROJECT_ID,
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    });
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

/**
 * POST /api/stripe/create-checkout
 * Body: { planId: 'starter' | 'growth' | 'pro', billingCycle: 'monthly' | 'annual' }
 *
 * Creates a Stripe Checkout Session and returns { url } to redirect the user.
 * The workplaceId is stored in session metadata so the webhook can update Firestore.
 */
export async function POST(req: NextRequest) {
  try {
    const uid = await getUserIdFromRequest(req);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, billingCycle } = body as {
      planId: 'starter' | 'growth' | 'pro';
      billingCycle: 'monthly' | 'annual';
    };

    if (!planId || !billingCycle) {
      return NextResponse.json({ error: 'planId and billingCycle are required' }, { status: 400 });
    }

    // Resolve workplaceId from Firestore
    if (!firebaseDb) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const userSnap = await firebaseDb.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const workplaceId: string = userSnap.data()?.workplaceId;
    if (!workplaceId) {
      return NextResponse.json({ error: 'No workspace found for user' }, { status: 404 });
    }

    // Look up existing Stripe customer ID if any
    const wpSnap = await firebaseDb.doc(`workplaces/${workplaceId}`).get();
    const existingCustomerId: string | undefined = wpSnap.data()?.stripeCustomerId;

    const stripe = getStripe();
    const priceId = getPriceId(planId, billingCycle);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.flowdexx.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(existingCustomerId ? { customer: existingCustomerId } : {}),
      customer_email: existingCustomerId ? undefined : (userSnap.data()?.email as string | undefined),
      metadata: {
        workplaceId,
        uid,
        planId,
        billingCycle,
      },
      subscription_data: {
        metadata: { workplaceId, uid, planId, billingCycle },
      },
      success_url: `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=1`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe/create-checkout] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
