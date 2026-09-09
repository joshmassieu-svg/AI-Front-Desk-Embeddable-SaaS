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
  Sparkles,
} from 'lucide-react';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { login, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams?.get('reset') === 'success';

  useEffect(() => {
    // Only auto-redirect if already authenticated and not in an active submit transaction
    if (!loading && user && !isSubmitting && !isGoogleSubmitting) {
      router.push('/dashboard/overview');
    }
  }, [user, loading, router, isSubmitting, isGoogleSubmitting]);

  const handleGoogleSignIn = async () => {
    setError(null);

    try {
      setIsGoogleSubmitting(true);
      await loginWithGoogle();
      router.push('/dashboard/overview');
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

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      router.push('/dashboard/overview');
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
        <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-3 sm:p-4 lg:p-5">
      <div className="min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)] w-full overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-[0_20px_80px_rgba(244,114,182,0.08)] flex flex-col lg:flex-row">

        {/* =========================================================
            LEFT — BRAND / ANIMATED MESH
        ========================================================== */}
        <section className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] overflow-hidden bg-[#faf8f5]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(254,240,138,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(251,207,232,0.4),transparent_45%)]" />

          <div className="absolute -left-28 -top-28 h-[520px] w-[520px] rounded-full bg-[#fef08a]/60 blur-[70px] mesh-one" />
          <div className="absolute left-[20%] top-[15%] h-[460px] w-[460px] rounded-full bg-[#fbcfe8]/70 blur-[80px] mesh-two" />
          <div className="absolute -right-28 top-[25%] h-[540px] w-[540px] rounded-full bg-[#fef9c3]/75 blur-[85px] mesh-three" />
          <div className="absolute -bottom-36 left-[8%] h-[580px] w-[580px] rounded-full bg-[#fce7f3]/80 blur-[90px] mesh-four" />

          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

          {/* Brand content */}
          <div className="relative z-10 flex min-h-full w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-amber-300 shadow-md transition-transform duration-300 group-hover:scale-105">
                  <Bot className="h-6 w-6 text-slate-900" />
                </div>
                <span className="text-[17px] font-bold tracking-tight text-slate-950">
                  Flowdexx <span className="font-medium text-pink-500">AI Platform</span>
                </span>
              </Link>
            </div>

            {/* Main copy */}
            <div className="max-w-[580px] pb-8 xl:pb-12">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                Intelligent Front Desk AI Agents
              </div>

              <h2 className="max-w-[560px] text-[42px] font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 xl:text-[52px]">
                A better way to grow your{' '}
                <span className="relative inline-block">
                  business.
                  <span className="absolute -bottom-1 left-0 h-2.5 w-full -rotate-1 rounded-full bg-gradient-to-r from-pink-200 to-amber-200/80" />
                </span>
              </h2>

              <p className="mt-6 max-w-[490px] text-[16px] leading-7 text-slate-600">
                Bring your business knowledge, live customer chats, and automated lead capture together in one unified dashboard.
              </p>
            </div>

            {/* Bottom badge */}
            <div className="relative mt-auto flex items-end justify-between">
              <div className="rounded-2xl border border-white/80 bg-white/70 px-5 py-4 shadow-[0_15px_40px_rgba(251,207,232,0.3)] backdrop-blur-xl">
                <p className="text-sm font-semibold text-slate-900">
                  Built for modern businesses
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Live AI answers • Zero-code embed • Fast sync
                </p>
              </div>

              <div className="hidden xl:flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/50 shadow-sm backdrop-blur-md">
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

            {/* Mobile brand */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-amber-300 shadow-md">
                  <Bot className="h-6 w-6 text-slate-900" />
                </div>
                <span className="text-[17px] font-bold tracking-tight text-slate-950">
                  Flowdexx <span className="font-medium text-pink-500">AI Platform</span>
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

            {/* Login / signup tab switcher */}
            <div
              role="tablist"
              aria-label="Authentication Options"
              className="mt-8 grid grid-cols-2 rounded-xl bg-amber-50/60 p-1 border border-amber-100"
            >
              <button
                type="button"
                role="tab"
                aria-selected="true"
                aria-current="page"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm"
              >
                Log in
              </button>

              <Link
                href="/signup"
                role="tab"
                aria-selected="false"
                onClick={() => setError(null)}
                className="flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Sign up
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-pink-200 bg-pink-50/70 p-3.5 text-sm text-pink-700">
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-pink-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Password Reset Confirmation Banner */}
            {resetSuccess && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
                <span>Password reset instructions were sent. Please sign in with your updated password once complete.</span>
              </div>
            )}

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-pink-200 hover:bg-pink-50/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGoogleSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
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
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-medium text-slate-400">
                OR
              </span>
              <div className="h-px flex-1 bg-slate-100" />
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
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
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
                    className="text-xs font-medium text-slate-500 transition hover:text-pink-600 hover:underline"
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
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 hover:from-pink-600 hover:to-amber-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(244,114,182,0.3)] transition hover:shadow-[0_10px_30px_rgba(244,114,182,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
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
                className="font-semibold text-slate-900 underline underline-offset-2 transition hover:text-pink-600"
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}