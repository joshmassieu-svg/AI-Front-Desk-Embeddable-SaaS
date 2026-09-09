'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Bot, Mail, ArrowRight, ArrowLeft, AlertCircle, Loader2, CheckCircle2, UserPlus } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Light yellow and light pink ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#fef08a]/40 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#fbcfe8]/45 blur-[120px] pointer-events-none rounded-full" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-amber-300 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Bot className="w-7 h-7 text-slate-900" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-950">
            Flowdexx <span className="text-pink-500 font-medium">AI Platform</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Forgot password?</h1>
        <p className="text-slate-500 text-sm mt-1">No worries, we'll send you reset instructions.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-pink-100/80 rounded-3xl p-8 shadow-[0_20px_60px_rgba(244,114,182,0.1)] backdrop-blur-xl z-10">
        {isSubmitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-semibold text-slate-950">Check your email</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We have sent a password reset link to <span className="font-semibold text-pink-600">{email}</span>. Please check your inbox and follow the link to reset your password.
            </p>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-slate-500 hover:text-slate-800 transition"
              >
                Didn't receive the email? <span className="text-pink-600 underline font-medium">Try again</span>
              </button>
              <Link
                href="/login?reset=success"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-pink-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold transition mt-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-pink-50 border border-pink-200 flex items-start gap-3 text-pink-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-pink-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 hover:from-pink-600 hover:to-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-[0_8px_25px_rgba(244,114,182,0.3)] transition flex items-center justify-center gap-2 text-sm mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending reset link...
                  </>
                ) : (
                  <>
                    Reset Password <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 hover:text-pink-600 transition text-slate-600"
              >
                <UserPlus className="w-3.5 h-3.5" /> Create account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
