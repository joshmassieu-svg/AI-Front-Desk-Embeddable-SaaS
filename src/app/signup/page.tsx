'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getAdditionalUserInfo } from 'firebase/auth';
import {
  Bot,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Sparkles,
  Check,
} from 'lucide-react';

function SignupFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { signup, loginWithGoogle, logout, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromOnboarding = searchParams?.get('from') === 'onboarding' || searchParams?.get('redirect') === 'onboarding';

  useEffect(() => {
    // Only redirect if user was already logged in on initial page load (and not actively submitting/logging out)
    if (!loading && user && !isSubmitting && !isGoogleSubmitting) {
      router.push('/dashboard/overview');
    }
  }, [user, loading, router, isSubmitting, isGoogleSubmitting]);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setIsGoogleSubmitting(true);
      const cred = await loginWithGoogle();
      const info = getAdditionalUserInfo(cred);

      if (info && !info.isNewUser) {
        // User already has an existing account -> prevent auto-entry via signup page
        await logout();
        setError('An account with this Google email already exists. Please log in instead.');
        return;
      }

      // Fresh user -> forward to onboarding
      window.location.href = '/onboarding';
    } catch (err: any) {
      console.error('Google signup error:', err);
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

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(email, password);
      // Forward to onboarding
      window.location.href = '/onboarding';
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError(err.message || 'Failed to create an account. Please try again.');
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
            LEFT — ANIMATED MESH (Light Yellow & Light Pink branding)
        ========================================================== */}
        <section className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] overflow-hidden bg-[#faf8f5]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(254,240,138,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(251,207,232,0.4),transparent_45%)]" />

          <div className="absolute -left-28 -top-28 h-[520px] w-[520px] rounded-full bg-[#fef08a]/60 blur-[70px] mesh-one" />
          <div className="absolute left-[20%] top-[15%] h-[460px] w-[460px] rounded-full bg-[#fbcfe8]/70 blur-[80px] mesh-two" />
          <div className="absolute -right-28 top-[25%] h-[540px] w-[540px] rounded-full bg-[#fef9c3]/75 blur-[85px] mesh-three" />
          <div className="absolute -bottom-36 left-[8%] h-[580px] w-[580px] rounded-full bg-[#fce7f3]/80 blur-[90px] mesh-four" />

          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

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

            <div className="max-w-[580px] pb-8 xl:pb-12">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                Deploy AI Front Desk Widgets instantly
              </div>

              <h2 className="max-w-[560px] text-[42px] font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 xl:text-[52px]">
                Build intelligent AI support in{' '}
                <span className="relative inline-block">
                  minutes.
                  <span className="absolute -bottom-1 left-0 h-2.5 w-full -rotate-1 rounded-full bg-gradient-to-r from-pink-200 to-amber-200/80" />
                </span>
              </h2>

              <p className="mt-6 max-w-[490px] text-[16px] leading-7 text-slate-600">
                Crawl your website knowledge, customize chat widgets, and automate client interactions effortlessly.
              </p>
            </div>

            <div className="relative mt-auto flex items-end justify-between">
              <div className="rounded-2xl border border-white/80 bg-white/70 px-5 py-4 shadow-[0_15px_40px_rgba(251,207,232,0.3)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-sm">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Get Started Free</p>
                    <p className="text-xs text-slate-500">No credit card required</p>
                  </div>
                </div>
              </div>

              <div className="hidden xl:flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/50 shadow-sm backdrop-blur-md">
                <ArrowUpRight className="h-6 w-6 text-slate-700" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT — AUTHENTICATION (Clean White Background)
        ========================================================== */}
        <section className="flex min-h-[calc(100vh-1.5rem)] flex-1 items-center justify-center bg-white px-5 py-10 sm:px-10 lg:min-h-0 lg:px-12 xl:px-20">
          <div className="w-full max-w-[440px]">
            {/* Mobile logo */}
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
                Create an account
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Start deploying your AI widgets in minutes
              </p>
            </div>

            {/* Onboarding info notice banner */}
            {fromOnboarding && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 font-medium shadow-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  To connect your website domain and generate your AI widget snippet, please create your account below.
                </span>
              </div>
            )}

            {/* Login / Signup tabs */}
            <div
              role="tablist"
              aria-label="Authentication Options"
              className="mt-8 grid grid-cols-2 rounded-xl bg-amber-50/60 p-1 border border-amber-100"
            >
              <Link
                href="/login"
                role="tab"
                aria-selected="false"
                onClick={() => setError(null)}
                className="flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Log in
              </Link>
              <button
                type="button"
                role="tab"
                aria-selected="true"
                aria-current="page"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm"
              >
                Sign up
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 flex flex-col gap-2 rounded-xl border border-pink-200 bg-pink-50/70 p-3.5 text-sm text-pink-700">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-pink-500" />
                  <span className="leading-snug">{error}</span>
                </div>
                {error.includes('log in') && (
                  <Link
                    href="/login"
                    className="ml-7 inline-flex items-center gap-1 font-bold text-pink-700 underline underline-offset-2 hover:text-pink-900"
                  >
                    <span>Go to Log in page</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
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
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-medium text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
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

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 pt-1 select-none">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition checked:border-pink-500 checked:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                  <Check className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100 p-0.5" />
                </div>
                <span className="text-xs leading-5 text-slate-500">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-slate-700 underline underline-offset-2 hover:text-pink-600">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium text-slate-700 underline underline-offset-2 hover:text-pink-600">
                    Privacy Policy
                  </Link>.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 hover:from-pink-600 hover:to-amber-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(244,114,182,0.3)] transition hover:shadow-[0_10px_30px_rgba(244,114,182,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-slate-900 underline underline-offset-2 transition hover:text-pink-600">
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
