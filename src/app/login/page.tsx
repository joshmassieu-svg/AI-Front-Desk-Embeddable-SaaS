'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
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
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { login, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard/overview');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setResetMessage(null);

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
    setResetMessage(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.');
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
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes meshFloatOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(80px, -45px, 0) scale(1.12);
          }
        }

        @keyframes meshFloatTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-70px, 55px, 0) scale(1.15);
          }
        }

        @keyframes meshFloatThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(45px, 70px, 0) scale(0.92);
          }
        }

        @keyframes meshFloatFour {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-55px, -55px, 0) scale(1.08);
          }
        }

        @keyframes meshRotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(12deg) scale(1.08);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.45;
            transform: translateX(-10%);
          }
          50% {
            opacity: 0.8;
            transform: translateX(10%);
          }
        }

        .mesh-one {
          animation: meshFloatOne 11s ease-in-out infinite;
        }

        .mesh-two {
          animation: meshFloatTwo 13s ease-in-out infinite;
        }

        .mesh-three {
          animation: meshFloatThree 15s ease-in-out infinite;
        }

        .mesh-four {
          animation: meshFloatFour 12s ease-in-out infinite;
        }

        .mesh-rotate {
          animation: meshRotate 18s ease-in-out infinite;
        }

        .mesh-shimmer {
          animation: shimmer 9s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .mesh-one,
          .mesh-two,
          .mesh-three,
          .mesh-four,
          .mesh-rotate,
          .mesh-shimmer {
            animation: none !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-white p-3 sm:p-4 lg:p-5">
        <div className="min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)] w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.06)] flex flex-col lg:flex-row">
          {/* =========================================================
              LEFT — ANIMATED MESH
          ========================================================== */}
          <section className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] overflow-hidden bg-[#f4f5ed]">
            {/* Soft base gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.8),transparent_35%)]" />

            {/* Animated mesh blobs */}
            <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-[#dce9cf] blur-[65px] mesh-one" />

            <div className="absolute left-[22%] top-[12%] h-[440px] w-[440px] rounded-full bg-[#f8d7dd] blur-[75px] mesh-two" />

            <div className="absolute -right-32 top-[28%] h-[560px] w-[560px] rounded-full bg-[#d7c9f4] blur-[85px] mesh-three" />

            <div className="absolute -bottom-40 left-[10%] h-[600px] w-[600px] rounded-full bg-[#f6c8c2] blur-[90px] mesh-four" />

            <div className="absolute bottom-[-15%] right-[-10%] h-[540px] w-[540px] rounded-full bg-[#e4d4f7] blur-[80px] mesh-rotate" />

            {/* Fine glassy layer */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

            {/* Subtle mesh lines */}
            <div
              className="absolute inset-0 opacity-30 mesh-shimmer"
              style={{
                backgroundImage: `
                  linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.8) 35%, transparent 65%),
                  linear-gradient(65deg, transparent 0%, rgba(255,255,255,0.55) 45%, transparent 70%)
                `,
                backgroundSize: '160% 160%, 180% 180%',
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex min-h-full w-full flex-col justify-between p-12 xl:p-16">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <Bot className="h-6 w-6 text-white" />
                  </div>

                  <span className="text-[17px] font-bold tracking-tight text-slate-950">
                    Flowdexx{' '}
                    <span className="font-medium text-slate-500">
                      AI SaaS
                    </span>
                  </span>
                </Link>
              </div>

              <div className="max-w-[580px] pb-8 xl:pb-12">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  AI-powered customer experiences
                </div>

                <h2 className="max-w-[560px] text-[42px] font-bold leading-[1.04] tracking-[-0.045em] text-slate-950 xl:text-[54px]">
                  Turn every website visitor into a{' '}
                  <span className="relative inline-block">
                    conversation.
                    <span className="absolute -bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-[#c9d8bb]/80" />
                  </span>
                </h2>

                <p className="mt-6 max-w-[490px] text-[16px] leading-7 text-slate-600">
                  Build intelligent AI experiences that help businesses
                  answer questions, capture leads, and connect with customers
                  around the clock.
                </p>
              </div>

              {/* Decorative glass card */}
              <div className="relative mt-auto flex items-end justify-between">
                <div className="rounded-2xl border border-white/70 bg-white/45 px-5 py-4 shadow-[0_15px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Sparkles className="h-4 w-4 text-brand-500" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Your AI front desk
                      </p>
                      <p className="text-xs text-slate-500">
                        Always ready to help
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden xl:flex h-20 w-20 items-center justify-center rounded-full border border-white/60 bg-white/25 backdrop-blur-md">
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
              {/* Mobile logo */}
              <div className="mb-8 flex justify-center lg:hidden">
                <Link href="/" className="inline-flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>

                  <span className="text-[17px] font-bold tracking-tight text-slate-950">
                    Flowdexx{' '}
                    <span className="font-medium text-slate-500">
                      AI SaaS
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

              {/* Login / Signup tabs */}
              <div className="mt-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm"
                >
                  Log in
                </button>

                <Link
                  href="/signup"
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

              {/* Success/reset message */}
              {resetMessage && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-600">
                  <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
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
                  <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
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

              {/* Email form */}
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
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
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
                      className="text-xs font-medium text-slate-500 transition hover:text-brand-500 hover:underline"
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
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
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

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition checked:border-brand-500 checked:bg-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />

                  <span className="text-xs leading-5 text-slate-500">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="font-medium text-slate-700 underline underline-offset-2 hover:text-brand-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="font-medium text-slate-700 underline underline-offset-2 hover:text-brand-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(249,115,22,0.22)] transition hover:bg-brand-600 hover:shadow-[0_10px_30px_rgba(249,115,22,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="font-semibold text-slate-900 underline underline-offset-2 transition hover:text-brand-500"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}