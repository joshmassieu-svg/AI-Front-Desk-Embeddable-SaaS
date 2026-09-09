'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Bot,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';

// ─── Inner form (needs useSearchParams → must be inside Suspense) ────────────
function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { login, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // BUG-009 — populate resetMessage from ?reset=sent query param (set by
  // forgot-password page after a successful email dispatch).
  useEffect(() => {
    if (searchParams?.get('reset') === 'sent') {
      setResetMessage(
        'Password reset link sent! Check your inbox and follow the link to reset your password.'
      );
    }
  }, [searchParams]);

  // BUG-001 / BUG-002 — single redirect path; guard with isSubmitting flags so
  // an in-flight login doesn't race with the onIdTokenChanged callback.
  useEffect(() => {
    if (!loading && user && !isSubmitting && !isGoogleSubmitting) {
      router.push('/dashboard/overview');
    }
  }, [user, loading, router, isSubmitting, isGoogleSubmitting]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setResetMessage(null);

    try {
      setIsGoogleSubmitting(true);
      await loginWithGoogle();
      // BUG-001 — do NOT call router.push here; the useEffect above handles
      // the redirect once `user` is set, avoiding a double navigation.
    } catch (err: any) {
      console.error('Google login error:', err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore duplicate request
      } else {
        setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      // BUG-001 — do NOT call router.push here; the useEffect above handles
      // the redirect once `user` is set, avoiding a double navigation.
    } catch (err: any) {
      console.error('Login error:', err);

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError(
          'Invalid email or password. Please check your credentials and try again.'
        );
      } else if (err.code === 'auth/too-many-requests') {
        setError(
          'Too many unsuccessful login attempts. Please try again later.'
        );
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#ec4899] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-3 sm:p-4 lg:p-5">
      <div className="min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)] w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.06)] flex flex-col lg:flex-row">

        {/* =========================================================
            LEFT — BRAND / ANIMATED MESH
        ========================================================== */}
        <section className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] overflow-hidden bg-[#f5f5ef]">

          {/* Base */}
          <div className="absolute inset-0 bg-[#f5f5ef]" />

          {/* Organic mesh — classes now come from globals.css (BUG-016) */}
          <div
            className="mesh-a absolute -left-[18%] -top-[15%] h-[75%] w-[75%] rounded-full blur-[90px]"
            style={{
              background:
                'radial-gradient(circle, rgba(205,225,188,0.95) 0%, rgba(205,225,188,0.55) 38%, transparent 72%)',
            }}
          />

          <div
            className="mesh-b absolute left-[18%] -top-[8%] h-[70%] w-[70%] rounded-full blur-[100px]"
            style={{
              background:
                'radial-gradient(circle, rgba(248,215,221,0.9) 0%, rgba(248,215,221,0.5) 42%, transparent 75%)',
            }}
          />

          <div
            className="mesh-c absolute -right-[22%] top-[18%] h-[78%] w-[78%] rounded-full blur-[105px]"
            style={{
              background:
                'radial-gradient(circle, rgba(211,195,244,0.92) 0%, rgba(211,195,244,0.5) 40%, transparent 74%)',
            }}
          />

          <div
            className="mesh-d absolute -bottom-[25%] -left-[5%] h-[78%] w-[78%] rounded-full blur-[105px]"
            style={{
              background:
                'radial-gradient(circle, rgba(249,202,207,0.9) 0%, rgba(249,202,207,0.5) 40%, transparent 75%)',
            }}
          />

          {/* Warm center */}
          <div
            className="mesh-glow absolute left-[25%] top-[35%] h-[55%] w-[55%] rounded-full blur-[120px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,229,194,0.65) 0%, rgba(255,229,194,0.2) 48%, transparent 75%)',
            }}
          />

          {/* Soft white diffusion */}
          <div className="absolute inset-0 bg-white/10" />

          {/* Fine mesh texture */}
          <div
            className="absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.9) 0 1px, transparent 1.5px),
                radial-gradient(circle at 70% 65%, rgba(255,255,255,0.8) 0 1px, transparent 1.5px)
              `,
              backgroundSize: '24px 24px, 30px 30px',
            }}
          />

          {/* Brand content */}
          <div className="relative z-10 flex min-h-full w-full flex-col justify-between p-12 xl:p-16">

            {/* Brand — BUG-010: unified logo (Bot icon + gradient) */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-3 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-amber-300 shadow-md transition-transform duration-300 group-hover:scale-105">
                  <Bot className="h-6 w-6 text-slate-900" />
                </div>

                <span className="text-[17px] font-bold tracking-tight text-slate-950">
                  Flowdexx{' '}
                  <span className="font-medium text-pink-500">
                    AI
                  </span>
                </span>
              </Link>
            </div>

            {/* Main copy */}
            <div className="max-w-[570px] pb-8 xl:pb-12">

              <h2 className="max-w-[550px] text-[42px] font-bold leading-[1.04] tracking-[-0.05em] text-slate-950 xl:text-[54px]">
                A better way to
                <br />
                grow your business
                <span className="relative inline-block">
                  .
                  <span className="absolute -bottom-1 -left-1 h-[7px] w-8 rotate-[-3deg] rounded-full bg-[#c8d8bb]" />
                </span>
              </h2>

              <p className="mt-6 max-w-[480px] text-[16px] leading-7 text-slate-600">
                Bring your business, customers, and everyday work together
                in one simple place.
              </p>
            </div>

            {/* Bottom visual element */}
            <div className="relative mt-auto flex items-end justify-between">

              <div className="rounded-2xl border border-white/70 bg-white/45 px-5 py-4 shadow-[0_15px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl">
                <p className="text-sm font-semibold text-slate-900">
                  Built for modern teams
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Simple tools. Clear workflows.
                </p>
              </div>

              <div className="hidden xl:flex h-20 w-20 items-center justify-center rounded-full border border-white/60 bg-white/20 backdrop-blur-md">
                <ArrowUpRight className="h-6 w-6 text-slate-700" />
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT — AUTHENTICATION
        ========================================================== */}
        <section className="flex min-h-[calc(100vh-1.5rem)] flex-1 items-center justify-center bg-white px-5 py-10 sm:px-10 lg:min-h-0 lg:px-12 xl:px-20">

          <div className="w-full max-w-[440px]">

            {/* Mobile brand — BUG-010: unified logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-amber-300 shadow-md">
                  <Bot className="h-6 w-6 text-slate-900" />
                </div>

                <span className="text-[17px] font-bold tracking-tight text-slate-950">
                  Flowdexx{' '}
                  <span className="font-medium text-pink-500">
                    AI
                  </span>
                </span>
              </Link>
            </div>

            {/* Header */}
            <div className="text-center">
              <h1 className="text-[29px] font-bold tracking-[-0.035em] text-slate-950">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to your account
              </p>
            </div>

            {/* Tab switcher — BUG-007: clears error on switch; BUG-015: ARIA roles */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="mt-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1"
            >

              <button
                type="button"
                role="tab"
                aria-current="page"
                aria-selected="true"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm"
              >
                Log in
              </button>

              <Link
                href="/signup"
                role="tab"
                aria-selected="false"
                onClick={() => { setError(null); setResetMessage(null); }}
                className="flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Sign up
              </Link>

            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reset message — BUG-008: CheckCircle2 instead of AlertCircle */}
            {resetMessage && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-600">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                <span>{resetMessage}</span>
              </div>
            )}

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGoogleSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#ec4899]" />
              ) : (
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}

              <span>Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#ec4899] focus:ring-4 focus:ring-[#ec4899]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-slate-500 transition hover:text-[#ec4899] hover:underline"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#ec4899] focus:ring-4 focus:ring-[#ec4899]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>

                </div>
              </div>

              {/* BUG-013 — Terms notice removed from login page (users agreed at signup) */}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ec4899] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(236,72,153,0.2)] transition hover:bg-[#db2777] hover:shadow-[0_12px_35px_rgba(236,72,153,0.26)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Log in'
                )}
              </button>

            </form>

            {/* Footer */}
            <p className="mt-7 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-slate-900 underline underline-offset-2 transition hover:text-[#ec4899]"
              >
                Sign up
              </Link>
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Page export — wraps in Suspense for useSearchParams (App Router req.) ───
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#ec4899] animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}