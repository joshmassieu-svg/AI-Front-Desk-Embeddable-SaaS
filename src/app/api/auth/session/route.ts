import { NextRequest, NextResponse } from 'next/server';
import { firebaseAuth, firebaseDb } from '@/lib/firebase-admin';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// How long (in seconds) the session cookies live.
// Firebase ID tokens expire after 1 hour — keep in sync.
const SESSION_TTL_SECONDS = 60 * 60; // 1 hour

const COOKIE_BASE = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax' as const,
  maxAge: SESSION_TTL_SECONDS,
} as const;

const isProduction = process.env.NODE_ENV === 'production';

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tanptal';

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
);

/**
 * Verify a Firebase ID token using public JWKS if Admin SDK is unavailable.
 */
async function verifyWithJWKS(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      audience: PROJECT_ID,
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    });
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

/**
 * POST /api/auth/session
 * Body: { idToken: string, forceOnboarded?: boolean }
 *
 * Verifies the Firebase ID token server-side, checks whether the user has
 * completed onboarding (workplace.onboardedAt exists in Firestore), then
 * sets two HttpOnly cookies that the Edge middleware reads on every
 * /dashboard/* request:
 *   __session   — raw Firebase ID token (used to verify auth)
 *   __onboarded — "1" | "0"           (used for onboarding redirect)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idToken: string | undefined = body?.idToken;
    const forceOnboarded: boolean = !!body?.forceOnboarded;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken is required.' }, { status: 400 });
    }

    let uid: string | null = null;

    if (firebaseAuth) {
      try {
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        uid = decoded.uid;
      } catch {
        uid = await verifyWithJWKS(idToken);
      }
    } else {
      uid = await verifyWithJWKS(idToken);
    }

    if (!uid) {
      const res = NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
      res.cookies.delete('__session');
      res.cookies.delete('__onboarded');
      return res;
    }

    // Resolve onboarding status
    let onboarded = forceOnboarded;

    if (!onboarded && firebaseDb) {
      try {
        const userSnap = await firebaseDb.doc(`users/${uid}`).get();
        if (userSnap.exists) {
          const workplaceId = userSnap.data()?.workplaceId as string | undefined;
          if (workplaceId) {
            const wpSnap = await firebaseDb.doc(`workplaces/${workplaceId}`).get();
            onboarded = !!wpSnap.data()?.onboardedAt;
          }
        }

        // Fallback: if user doc was not yet created or missing workplaceId, check workplaces by userId
        if (!onboarded) {
          const wpQuery = await firebaseDb.collection('workplaces').where('userId', '==', uid).limit(5).get();
          if (!wpQuery.empty) {
            onboarded = wpQuery.docs.some((d) => !!d.data()?.onboardedAt);
          }
        }
      } catch (err) {
        console.error('[session] Firestore onboarding check failed:', err);
      }
    }

    // If Admin SDK wasn't initialized or forceOnboarded was requested, ensure user isn't locked out
    if (forceOnboarded) {
      onboarded = true;
    }

    const res = NextResponse.json({ ok: true, onboarded });
    const opts = { ...COOKIE_BASE, secure: isProduction };
    res.cookies.set('__session', idToken, opts);
    res.cookies.set('__onboarded', onboarded ? '1' : '0', opts);
    return res;
  } catch (err: any) {
    console.error('[session] POST error:', err);
    const res = NextResponse.json({ error: 'Session processing error.' }, { status: 500 });
    res.cookies.delete('__session');
    res.cookies.delete('__onboarded');
    return res;
  }
}

/**
 * DELETE /api/auth/session
 * Clears session cookies. Called on logout.
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('__session');
  res.cookies.delete('__onboarded');
  return res;
}
