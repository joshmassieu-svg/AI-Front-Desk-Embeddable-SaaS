'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, ShieldCheck, Users, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { WorkplaceInvitation } from '@/lib/types';

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const { user, loading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<WorkplaceInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  useEffect(() => {
    if (!code) {
      setError('Missing invite code in link.');
      setLoading(false);
      return;
    }

    fetch(`/api/v1/workplace/join?code=${code}`)
      .then((res) => {
        if (!res.ok) throw new Error('Invitation code is invalid or expired.');
        return res.json();
      })
      .then((data) => {
        if (data.invitation) {
          setInvitation(data.invitation);
        } else {
          setError('Invitation not found.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load invitation.');
      })
      .finally(() => setLoading(false));
  }, [code]);

  const handleJoin = async () => {
    if (!user || !user.email || !code) return;
    setJoining(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/workplace/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: code,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setJoinedSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard/overview';
        }, 1500);
      } else {
        setError(data.error || 'Failed to join workplace.');
      }
    } catch (err: any) {
      setError(err.message || 'Error processing request.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-base text-white tracking-tight">Flowdexx AI Platform</div>
            <div className="text-xs text-slate-400">Team Collaboration Platform</div>
          </div>
        </div>

        {loading || authLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>Validating workplace invitation...</div>
          </div>
        ) : error ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Invalid Invitation</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <Link
              href="/dashboard/overview"
              className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : joinedSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Welcome to the Team!</h3>
            <p className="text-xs text-emerald-400 font-medium">
              You have successfully joined <strong className="text-white">{invitation?.workplaceName}</strong>. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Team Invitation
              </div>
              <h2 className="text-xl font-bold text-white">Join {invitation?.workplaceName}</h2>
              <p className="text-xs text-slate-400">
                You have been invited to join <strong className="text-slate-200">{invitation?.workplaceName}</strong> as a <span className="text-brand-300 uppercase font-semibold">{invitation?.role}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Workplace:</span>
                <span className="font-semibold text-white">{invitation?.workplaceName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Assigned Role:</span>
                <span className="font-semibold text-brand-400 uppercase">{invitation?.role}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Invited Email:</span>
                <span className="font-mono text-slate-300">{invitation?.email}</span>
              </div>
            </div>

            {user ? (
              user.email?.toLowerCase().trim() === invitation?.email?.toLowerCase().trim() ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 text-center">
                    Signed in as <strong className="text-slate-200">{user.email}</strong>
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-500 hover:to-brand-500 text-white font-bold text-xs rounded-xl shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {joining ? 'Joining Workplace...' : 'Accept Invitation & Join'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center space-y-1">
                    <div className="font-bold">Email Mismatch</div>
                    <p className="text-[11px] text-slate-300">
                      This invite was issued to <strong className="text-white">{invitation?.email}</strong>, but you are signed in as <strong className="text-white">{user.email}</strong>.
                    </p>
                  </div>

                  <Link
                    href={`/login?redirect=/join?code=${code}`}
                    className="w-full py-2.5 block text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-glow transition"
                  >
                    Sign In as {invitation?.email}
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 text-center">
                  Please sign in with <strong className="text-slate-200">{invitation?.email}</strong> to accept this invitation:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/login?redirect=/join?code=${code}`}
                    className="py-2.5 text-center text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`/signup?redirect=/join?code=${code}`}
                    className="py-2.5 text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-glow transition"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-4">
        <div className="text-xs text-slate-400">Loading...</div>
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
