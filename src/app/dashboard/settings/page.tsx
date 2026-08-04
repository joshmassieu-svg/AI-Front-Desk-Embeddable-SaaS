'use client';

import React, { useState } from 'react';
import { Settings, CreditCard, Check, Zap, Users, ShieldCheck, Building } from 'lucide-react';

export default function SettingsPage() {
  const [currentPlan, setCurrentPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-400" /> Account Settings & Subscriptions
        </h2>
        <p className="text-slate-400 text-xs">
          Manage your SaaS organization tier, subscription billing, team seats, and usage quotas.
        </p>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter Plan */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Starter</div>
            <div className="text-3xl font-extrabold text-white mb-2">$29 <span className="text-xs font-normal text-slate-400">/month</span></div>
            <p className="text-xs text-slate-400 mb-4">Perfect for single website owners getting started with AI support.</p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> 1 Website</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> 1,000 AI Conversations/mo</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> 10 Knowledge Base docs</li>
            </ul>
          </div>
          <button
            onClick={() => setCurrentPlan('starter')}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition ${
              currentPlan === 'starter' ? 'bg-slate-800 border-brand-500 text-brand-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {currentPlan === 'starter' ? 'Current Plan' : 'Downgrade to Starter'}
          </button>
        </div>

        {/* Pro Plan (Active) */}
        <div className="glass-panel p-6 rounded-2xl border-2 border-brand-500 shadow-glow flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider">
            Active Tier
          </div>
          <div>
            <div className="text-xs font-bold text-brand-300 uppercase tracking-wider mb-1">Pro Scale</div>
            <div className="text-3xl font-extrabold text-white mb-2">$99 <span className="text-xs font-normal text-slate-400">/month</span></div>
            <p className="text-xs text-slate-400 mb-4">Ideal for growing SaaS and e-commerce platforms.</p>
            <ul className="space-y-2 text-xs text-slate-200 font-medium">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> 5 Websites</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> 10,000 AI Conversations/mo</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> 100 Knowledge Base docs</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> Live Support Agent Takeover</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> Custom Branding & Webhooks</li>
            </ul>
          </div>
          <button
            disabled
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white cursor-default shadow-glow"
          >
            ✓ Currently Active Plan
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Enterprise</div>
            <div className="text-3xl font-extrabold text-white mb-2">$299 <span className="text-xs font-normal text-slate-400">/month</span></div>
            <p className="text-xs text-slate-400 mb-4">Dedicated SLAs, custom domains, and unlimited scale.</p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Unlimited Websites</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> 100,000 AI Conversations/mo</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Custom Domain Whitelabel</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Dedicated Account Manager</li>
            </ul>
          </div>
          <button
            onClick={() => setCurrentPlan('enterprise')}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow-glow"
          >
            Upgrade to Enterprise
          </button>
        </div>
      </div>

      {/* Quota Usage Gauge */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Zap className="w-4 h-4 text-amber-400" /> Current Plan Usage Quotas
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>AI Conversations (Monthly)</span>
              <span className="text-brand-400">1,428 / 10,000 (14.2%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full rounded-full" style={{ width: '14.2%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Knowledge Base Documents</span>
              <span className="text-purple-400">3 / 100 (3%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '3%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
