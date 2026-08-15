'use client';

import React, { useState } from 'react';
import { Key, Shield, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useWebsite } from '@/context/website-context';

export default function ApiKeysPage() {
  const { currentSite, currentSiteId } = useWebsite();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const realApiKey = currentSite?.apiKey || `pk_live_${currentSiteId}`;

  const copyKey = () => {
    navigator.clipboard.writeText(realApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-600" /> API Authentication Key
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Your production API key used to authenticate widget requests and integrations for{' '}
          <span className="text-brand-600 font-semibold">{currentSite?.name || currentSiteId}</span>.
        </p>
      </div>

      {/* Real API Key Display */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" /> Production API Key
          </h3>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div className="font-mono text-xs text-slate-800 truncate flex-1">
            {showKey ? realApiKey : 'pk_live_••••••••••••••••••••••••••••••••'}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={copyKey}
              className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Key</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
