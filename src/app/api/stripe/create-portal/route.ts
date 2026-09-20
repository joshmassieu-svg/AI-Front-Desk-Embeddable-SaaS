import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
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
 * POST /api/stripe/create-portal
 *
 * Creates a Stripe Billing Portal session and returns { url }.
 * The user is redirected there so they can manage their card, cancel, etc.
 *
 * Requires STRIPE_SECRET_KEY + a configured Billing Portal in the Stripe dashboard.
 */
export async function POST(req: NextRequest) {
  try {
    const uid = await getUserIdFromRequest(req);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const wpSnap = await firebaseDb.doc(`workplaces/${workplaceId}`).get();
    const stripeCustomerId: string | undefined = wpSnap.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe to a plan first.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.flowdexx.com';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error('[stripe/create-portal] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
