'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  Zap,
  Globe,
  Database,
  CheckCircle2,
  Clock,
  ArrowRight,
  Gift,
  ShieldCheck,
} from 'lucide-react';

interface GrowthPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GrowthPromoModal({ isOpen, onClose }: GrowthPromoModalProps) {
  const router = useRouter();
  const [expiresAtStr, setExpiresAtStr] = useState('');
  const [daysLeft, setDaysLeft] = useState(30);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let expiresAt = localStorage.getItem('flowdexx_growth_promo_expires_at');
    if (!expiresAt) {
      // Set expiration to 30 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expiresAt = futureDate.toISOString();
      localStorage.setItem('flowdexx_growth_promo_expires_at', expiresAt);
    }

    const expDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const computedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    setDaysLeft(computedDays);
    setExpiresAtStr(
      expDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flowdexx_growth_promo_dismissed', 'true');
    }
    onClose();
  };

  const handleCrawlClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flowdexx_growth_promo_dismissed', 'true');
    }
    onClose();
    router.push('/dashboard/knowledge');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden z-10 my-8">
        {/* Top Promotional Header */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 text-white p-7 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
            title="Dismiss Announcement"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5 text-amber-300" /> Exclusive Marketing Reward
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
            Try Growth ⭐ Plan Free for 1 Month
          </h2>

          <p className="text-brand-100 text-xs mt-1.5 leading-relaxed font-medium">
            {/* PAIN POINT (fixed): previously claimed the workspace had
                already been upgraded ("We've upgraded your workspace..."),
                which reads as a completed billing action rather than an
                offer — misleading regardless of intent. */}
            Crawl your site and unlock the full Growth ⭐ Tier at zero cost for your first month.
          </p>

          {/* Expiration Badge Banner */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 text-xs font-semibold text-white">
            <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Offer Valid for 30 Days</span>
            <span className="text-white/60">•</span>
            <span className="font-bold text-amber-200">{daysLeft} Days Left</span>
            <span className="text-white/60">(Expires {expiresAtStr})</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-7 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unlocked Growth ⭐ Tier Capabilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">3 Websites Workplaces</div>
                  <div className="text-[11px] text-slate-500">Deploy AI on up to 3 domains.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">5,000 AI Chats / mo</div>
                  <div className="text-[11px] text-slate-500">5x higher chat volume limit.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Unlimited Web Crawler</div>
                  <div className="text-[11px] text-slate-500">Crawl website URLs & docs automatically.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">CRM & Webhook Access</div>
                  <div className="text-[11px] text-slate-500">Stream leads straight to your CRM.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Box Call to Crawl */}
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Recommended Next Step:</h4>
                <p className="text-[11px] text-slate-600">
                  Crawl your website URLs now to train your AI on your latest documentation!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-7 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition text-center"
          >
            Dismiss & Explore
          </button>

          <button
            onClick={handleCrawlClick}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Globe className="w-4 h-4" /> Crawl Website & Add Knowledge <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
