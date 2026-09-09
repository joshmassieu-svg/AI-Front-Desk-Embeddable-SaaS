'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Star, ShieldCheck, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useWebsite } from '@/context/website-context';

type PlanId = 'free' | 'starter' | 'growth' | 'pro';

interface PlanDef {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  badge?: string;
  description: string;
  isPopular?: boolean;
  websites: string;
  conversations: string;
  convLimitNum: number;
  analytics: string;
  crm: boolean;
  removeBranding: boolean;
  teamMembers: string;
  whitelabel: boolean;
  prioritySupport: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Essential AI assistant features for personal sites and testing.',
    websites: '1',
    conversations: '100',
    convLimitNum: 100,
    analytics: 'Basic',
    crm: false,
    removeBranding: false,
    teamMembers: '1',
    whitelabel: false,
    prioritySupport: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 24,
    description: 'Ideal for small business websites and blogs starting with AI.',
    websites: '1',
    conversations: '1,000',
    convLimitNum: 1000,
    analytics: 'Basic',
    crm: false,
    removeBranding: true,
    teamMembers: '1',
    whitelabel: false,
    prioritySupport: false,
  },
  {
    id: 'growth',
    name: 'Growth ⭐',
    monthlyPrice: 79,
    annualPrice: 65,
    badge: 'Most Popular',
    isPopular: true,
    description: 'Powerful multi-site tools, CRM hooks, and advanced metrics.',
    websites: '3',
    conversations: '5,000',
    convLimitNum: 5000,
    analytics: 'Advanced',
    crm: true,
    removeBranding: true,
    teamMembers: '5',
    whitelabel: false,
    prioritySupport: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 199,
    annualPrice: 159,
    badge: 'Enterprise Power',
    description: 'High volume, total white-labeling, and dedicated support.',
    websites: '10',
    conversations: '25,000',
    convLimitNum: 25000,
    analytics: 'Advanced',
    crm: true,
    removeBranding: true,
    teamMembers: 'Unlimited',
    whitelabel: true,
    prioritySupport: true,
  },
];

const COMPARISON_ROWS: { label: string; key: keyof PlanDef | 'check_all'; tooltip?: string }[] = [
  { label: 'Price', key: 'monthlyPrice' },
  { label: 'Websites included', key: 'websites' },
  { label: 'AI conversations / mo', key: 'conversations' },
  { label: 'AI Ask Bar Search', key: 'check_all' },
  { label: 'Knowledge base index', key: 'check_all' },
  { label: 'Lead capture forms', key: 'check_all' },
  { label: 'Lead qualification', key: 'check_all' },
  { label: 'API & Webhooks', key: 'check_all' },
  { label: 'Analytics & Reports', key: 'analytics' },
  { label: 'CRM integrations', key: 'crm' },
  { label: 'Remove Flowdexx branding', key: 'removeBranding' },
  { label: 'Team seats', key: 'teamMembers' },
  { label: 'White-label widget', key: 'whitelabel' },
  { label: 'Priority SLA Support', key: 'prioritySupport' },
];

export default function BillingPage() {
  const { currentSiteId } = useWebsite();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<PlanId>('growth');
  const [convCount, setConvCount] = useState(1420);
  const [kbCount, setKbCount] = useState(18);

  useEffect(() => {
    if (!currentSiteId) return;

    fetch(`/api/v1/conversations?websiteId=${currentSiteId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.conversations) setConvCount(data.conversations.length);
      })
      .catch((err) => console.error(err));

    fetch(`/api/v1/knowledge?websiteId=${currentSiteId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items) setKbCount(data.items.length);
      })
      .catch((err) => console.error(err));
  }, [currentSiteId]);

  const activePlanDef = PLANS.find((p) => p.id === currentPlan) || PLANS[2];
  const convLimit = activePlanDef.convLimitNum;
  const kbLimit = currentPlan === 'free' ? 10 : currentPlan === 'starter' ? 50 : currentPlan === 'growth' ? 250 : 1000;

  const [promoExpiresStr, setPromoExpiresStr] = useState('');
  const [promoDaysRemaining, setPromoDaysRemaining] = useState(30);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let expiresAt = localStorage.getItem('flowdexx_growth_promo_expires_at');
    if (!expiresAt) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expiresAt = futureDate.toISOString();
      localStorage.setItem('flowdexx_growth_promo_expires_at', expiresAt);
    }
    const expDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    setPromoDaysRemaining(days);
    setPromoExpiresStr(
      expDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  const convPct = Math.min(100, Number(((convCount / convLimit) * 100).toFixed(1)));
  const kbPct = Math.min(100, Number(((kbCount / kbLimit) * 100).toFixed(1)));

  return (
    <div className="space-y-10 max-w-6xl mx-auto font-sans pb-20">
      {/* Top Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Plans & Billing</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Manage your subscription tier, usage quotas, and plan features.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Plan Badge */}
        <div className="flex items-center gap-3">
          {currentPlan === 'growth' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Free Growth Trial:</span>
              <span className="font-extrabold text-amber-700">{promoDaysRemaining} Days Left</span>
              <span className="text-amber-400">({promoExpiresStr})</span>
            </div>
          )}
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Tier:</span>
            <span className="font-extrabold uppercase text-emerald-900">{activePlanDef.name}</span>
          </div>
        </div>
      </div>

      {/* Quota Consumption Card (Clean Flowdexx Aesthetic) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Monthly Usage & Limits ({activePlanDef.name} Plan)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Renews on the 1st of next month
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Conversations Gauge */}
          <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>AI Conversations</span>
              <span className="text-brand-600 font-mono">
                {convCount.toLocaleString()} / {convLimit.toLocaleString()} ({convPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  convPct > 85 ? 'bg-amber-500' : 'bg-brand-600'
                }`}
                style={{ width: `${convPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {convLimit - convCount > 0
                ? `${(convLimit - convCount).toLocaleString()} AI responses available in current cycle.`
                : 'Limit reached. Upgrade your plan to increase volume.'}
            </p>
          </div>

          {/* Knowledge Base Index Gauge */}
          <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Knowledge Base Documents</span>
              <span className="text-purple-600 font-mono">
                {kbCount.toLocaleString()} / {kbLimit.toLocaleString()} ({kbPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${kbPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Includes crawled web pages, PDF documents, & markdown files.
            </p>
          </div>
        </div>
      </div>

      {/* Billing Switcher & Header */}
      <div className="text-center space-y-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Flexible Plans for Every Stage</h3>
          <p className="text-slate-500 text-xs mt-1">
            Simple pricing with clear quotas. Change plans or cancel anytime.
          </p>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg transition ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Save ~20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const displayPrice = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition duration-200 bg-white ${
                plan.isPopular
                  ? 'border-2 border-brand-600 shadow-lg ring-4 ring-brand-500/10'
                  : 'border border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                      : 'bg-brand-600 text-white'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  <span className={plan.isPopular ? 'text-brand-600 font-extrabold' : ''}>{plan.name}</span>
                  {plan.isPopular && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">${displayPrice}</span>
                  <span className="text-xs text-slate-500 font-medium">/month</span>
                </div>

                <p className="text-xs text-slate-500 min-h-[36px] leading-relaxed mb-4">
                  {plan.description}
                </p>

                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">Websites</span>
                    <span className="font-bold text-slate-800">{plan.websites}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">AI conversations</span>
                    <span className="font-bold text-slate-800">{plan.conversations}/mo</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">Analytics</span>
                    <span className="font-bold text-slate-800">{plan.analytics}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">Team seats</span>
                    <span className="font-bold text-slate-800">{plan.teamMembers}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentPlan(plan.id)}
                disabled={isCurrent}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                    : plan.isPopular
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isCurrent ? '✓ Currently Active' : `Select ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix Section */}
      <div className="space-y-5 pt-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Compare Tier Features</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Detailed breakdown of capability limits across all plans.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-800">
                  <th className="py-4 px-6 font-bold w-1/3 text-slate-900">Feature</th>
                  {PLANS.map((plan) => {
                    const priceVal = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                    const isActive = plan.id === currentPlan;
                    return (
                      <th
                        key={plan.id}
                        className={`py-4 px-4 text-center w-1/6 font-bold ${
                          isActive ? 'bg-brand-50/60 text-brand-900 border-x border-brand-100' : ''
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-900">{plan.name}</div>
                        <div className="text-slate-500 text-[11px] font-medium mt-0.5">
                          ${priceVal}/mo
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition hover:bg-slate-50/80 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {row.label}
                    </td>

                    {PLANS.map((plan) => {
                      const isActive = plan.id === currentPlan;
                      let content: React.ReactNode = null;

                      if (row.key === 'monthlyPrice') {
                        const priceVal = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                        content = <span className="font-bold text-slate-900">${priceVal}/mo</span>;
                      } else if (row.key === 'check_all') {
                        content = (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        );
                      } else {
                        const val = plan[row.key as keyof PlanDef];
                        if (typeof val === 'boolean') {
                          content = val ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : (
                            <span className="text-slate-300 font-bold">—</span>
                          );
                        } else if (typeof val === 'string') {
                          content = <span className="font-semibold text-slate-800">{val}</span>;
                        }
                      }

                      return (
                        <td
                          key={plan.id}
                          className={`py-3.5 px-4 text-center ${
                            isActive ? 'bg-brand-50/30 font-semibold border-x border-brand-100/60' : ''
                          }`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enterprise Contact Footer */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Need Custom Volumes, Enterprise SLAs, or Have Inquiries?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Send all inquiries to <a href="mailto:info@flowdexx.com" className="text-brand-600 font-semibold underline">info@flowdexx.com</a> for custom high-volume API throughput, custom data residency, and SOC2 compliance.
            </p>
          </div>
        </div>

        <a
          href="mailto:info@flowdexx.com"
          className="px-5 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200 shrink-0 inline-flex items-center gap-2"
        >
          Email info@flowdexx.com
        </a>
      </div>
    </div>
  );
}
