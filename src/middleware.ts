import { NextRequest, NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// ---------------------------------------------------------------------------
// Firebase public key set (RS256). Cached by `jose` after first fetch.
// ---------------------------------------------------------------------------
const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tanptal';

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
);

/**
 * Verify a Firebase ID token using Firebase's public JWKS.
 * Returns the uid on success, null on any failure (expired, tampered, etc.).
 */
async function verifyFirebaseToken(token: string): Promise<string | null> {
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

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1. Auth check ──────────────────────────────────────────────────────
  const sessionToken = req.cookies.get('__session')?.value;

  if (!sessionToken) {
    // No cookie at all → not logged in
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const uid = await verifyFirebaseToken(sessionToken);
  if (!uid) {
    // Token invalid or expired — clear stale cookies and send to login
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('__session');
    res.cookies.delete('__onboarded');
    return res;
  }

  // ── 2. Onboarding check ────────────────────────────────────────────────
  // The __onboarded cookie is set (and kept fresh) by /api/auth/session.
  // It is stamped "1" only after completeOnboardingInFirestore() succeeds.
  const onboarded = req.cookies.get('__onboarded')?.value === '1';

  if (!onboarded) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // ── 3. All good — serve the page ───────────────────────────────────────
  return NextResponse.next();
}

// Run on every /dashboard/* request only.
export const config = {
  matcher: ['/dashboard/:path*'],
};
