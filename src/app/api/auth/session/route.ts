import { NextRequest, NextResponse } from 'next/server';
import { firebaseAuth, firebaseDb } from '@/lib/firebase-admin';

// How long (in seconds) the session cookies live.
// BUG-006 — Raised from 1 hour to 7 days. The raw Firebase ID token's actual
// expiry is still enforced by jwtVerify in middleware.ts; this longer maxAge
// simply prevents the cookie from disappearing before onIdTokenChanged can
// refresh it, stopping users from being incorrectly bounced to /login.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days


const COOKIE_BASE = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax' as const,
  maxAge: SESSION_TTL_SECONDS,
} as const;

const isProduction = process.env.NODE_ENV === 'production';

/**
 * POST /api/auth/session
 * Body: { idToken: string }
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
    if (!firebaseAuth || !firebaseDb) {
      return NextResponse.json({ error: 'Auth service unavailable.' }, { status: 503 });
    }

    const body = await req.json();
    const idToken: string | undefined = body?.idToken;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken is required.' }, { status: 400 });
    }

    // Verify token with firebase-admin (Node.js runtime — not Edge).
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Resolve onboarding status from Firestore.
    let onboarded = false;
    try {
      const userSnap = await firebaseDb.doc(`users/${uid}`).get();
      if (userSnap.exists) {
        const workplaceId = userSnap.data()?.workplaceId as string | undefined;
        if (workplaceId) {
          const wpSnap = await firebaseDb.doc(`workplaces/${workplaceId}`).get();
          onboarded = !!wpSnap.data()?.onboardedAt;
        }
      }
    } catch (err) {
      // Non-fatal: default to not-onboarded. The user will be redirected to
      // /onboarding where they can re-submit and re-trigger this endpoint.
      console.error('[session] Firestore onboarding check failed:', err);
    }

    const res = NextResponse.json({ ok: true, onboarded });
    const opts = { ...COOKIE_BASE, secure: isProduction };
    res.cookies.set('__session', idToken, opts);
    res.cookies.set('__onboarded', onboarded ? '1' : '0', opts);
    return res;
  } catch (err: any) {
    console.error('[session] POST error:', err);
    // Token verification failed (expired, tampered, wrong project, etc.)
    const res = NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
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
