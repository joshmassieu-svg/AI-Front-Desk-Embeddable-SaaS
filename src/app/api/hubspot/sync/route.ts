import { NextRequest, NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { firebaseAuth, firebaseDb } from '@/lib/firebase-admin';
import { syncHubSpotContact, HubSpotContactInput } from '@/lib/hubspot';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tanptal';
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

interface Claims {
  uid: string;
  email?: string;
  name?: string;
  provider?: string;
}

async function verify(idToken: string): Promise<Claims | null> {
  if (firebaseAuth) {
    try {
      const d = await firebaseAuth.verifyIdToken(idToken);
      return { uid: d.uid, email: d.email, name: d.name as string | undefined, provider: d.firebase?.sign_in_provider };
    } catch {
      /* fall through to JWKS */
    }
  }
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      audience: PROJECT_ID,
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    });
    return {
      uid: payload.sub as string,
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      provider: (payload.firebase as any)?.sign_in_provider,
    };
  } catch {
    return null;
  }
}

function splitName(full?: string): { firstname?: string; lastname?: string } {
  if (!full) return {};
  const parts = full.trim().split(/\s+/);
  return { firstname: parts[0], lastname: parts.length > 1 ? parts.slice(1).join(' ') : undefined };
}

/**
 * POST /api/hubspot/sync
 * Body: { idToken: string, event: 'signup' | 'onboarded' }
 *
 * The email/name always come from the VERIFIED token, never from the request
 * body, so nobody can push fake contacts into the CRM.
 * Always responds 200 for CRM problems so the app flow is never interrupted.
 */
export async function POST(req: NextRequest) {
  try {
    const { idToken, event } = await req.json();
    if (!idToken || (event !== 'signup' && event !== 'onboarded')) {
      return NextResponse.json({ error: 'idToken and valid event required' }, { status: 400 });
    }

    const claims = await verify(idToken);
    if (!claims || !claims.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const contact: HubSpotContactInput = {
      email: claims.email,
      ...splitName(claims.name),
    };

    if (event === 'signup') {
      contact.flowdexx_signup_method = claims.provider === 'google.com' ? 'google' : 'email';
      contact.flowdexx_signup_date = new Date().toISOString();
      contact.flowdexx_onboarded = 'no';
      contact.flowdexx_plan = 'free';
    }

    if (event === 'onboarded' && firebaseDb) {
      try {
        const snap = await firebaseDb.collection('workplaces').where('userId', '==', claims.uid).limit(5).get();
        const wp = snap.docs.map((d) => d.data()).find((d) => d.onboardedAt) || snap.docs[0]?.data();
        if (wp) {
          contact.company = wp.name;
          contact.website = wp.domain;
          contact.flowdexx_website_name = wp.name;
          contact.flowdexx_website_domain = wp.domain;
          contact.flowdexx_onboarded = wp.onboardedAt ? 'yes' : 'no';
          contact.flowdexx_onboarded_date = wp.onboardedAt;
          contact.flowdexx_plan = wp.plan || 'free';
          contact.flowdexx_billing_cycle = wp.planBillingCycle;
          contact.flowdexx_subscription_status = wp.subscriptionStatus;
        }
      } catch (err) {
        console.warn('[hubspot/sync] could not read workplace:', err);
      }
    }

    const ok = await syncHubSpotContact(contact);
    return NextResponse.json({ ok });
  } catch (err) {
    console.error('[hubspot/sync] error:', err);
    return NextResponse.json({ ok: false });
  }
}
