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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-400" /> API Authentication Key
        </h2>
        <p className="text-slate-400 text-xs">
          Your production API key used to authenticate widget requests and integrations for{' '}
          <span className="text-brand-300 font-medium">{currentSite?.name || currentSiteId}</span>.
        </p>
      </div>

      {/* Real API Key Display */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" /> Production API Key
          </h3>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
          <div className="font-mono text-xs text-slate-200 truncate flex-1">
            {showKey ? realApiKey : 'pk_live_••••••••••••••••••••••••••••••••'}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={copyKey}
              className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-glow"
            >
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Key</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
