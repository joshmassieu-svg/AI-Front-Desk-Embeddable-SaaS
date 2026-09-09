'use client';

import React, { useState, useEffect } from 'react';
import { Code2, Copy, Check, Terminal, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { useWebsite } from '@/context/website-context';

export default function EmbedPage() {
  const { currentSite } = useWebsite();
  const [copied, setCopied] = useState(false);
  const [activeFramework, setActiveFramework] = useState<'html' | 'nextjs' | 'react' | 'vue' | 'wordpress'>('html');
  const [appUrl, setAppUrl] = useState('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, []);

  const siteId = currentSite?.id || '';
  const domain = currentSite?.domain || 'localhost';

  const snippet = `<script src="${appUrl}/embed.js" data-website-id="${siteId}" async></script>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    // Mark Step 3 of the onboarding checklist as complete
    if (typeof window !== 'undefined') {
      localStorage.setItem('flowdexx_embed_copied', 'true');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-brand-600" /> Website Embed Code Snippet
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Add your AI website assistant to any site by pasting this single JavaScript tag before <code className="text-brand-600 font-semibold">&lt;/body&gt;</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" /> Domain: {domain}
        </div>
      </div>

      {/* Snippet Card */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-200 shadow-sm space-y-4 bg-brand-50/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Terminal className="w-4 h-4 text-brand-600" /> Production Embed Tag ({domain})
          </div>
          <button
            onClick={() => copyToClipboard(snippet)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <><Check className="w-4 h-4 text-emerald-300" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Snippet</>}
          </button>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-brand-300 overflow-x-auto select-all">
          {snippet}
        </div>
      </div>

      {/* Framework Guides */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-6">
        <h3 className="text-base font-bold text-slate-900">Framework Installation Instructions</h3>

        {/* Framework Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {(['html', 'nextjs', 'react', 'vue', 'wordpress'] as const).map((fw) => (
            <button
              key={fw}
              onClick={() => setActiveFramework(fw)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                activeFramework === fw
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {fw === 'nextjs' ? 'Next.js' : fw === 'wordpress' ? 'WordPress / Shopify' : fw}
            </button>
          ))}
        </div>

        {/* Instructions content */}
        {activeFramework === 'html' && (
          <div className="space-y-3 text-xs text-slate-700">
            <p>1. Open your website template or main <code className="text-brand-600 font-mono font-semibold">index.html</code> file.</p>
            <p>2. Paste the snippet code directly above the closing <code className="text-brand-600 font-mono font-semibold">&lt;/body&gt;</code> tag.</p>
            <p>3. Save and publish your website. The widget will appear automatically!</p>
          </div>
        )}

        {activeFramework === 'nextjs' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-700">Add the script tag in your App Router <code className="text-brand-600 font-mono font-semibold">app/layout.tsx</code>:</p>
            <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800">
{`import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="${appUrl}/embed.js"
          data-website-id="${siteId}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`}
            </pre>
          </div>
        )}

        {activeFramework === 'react' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-700">Load dynamically in a React component:</p>
            <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800">
{`useEffect(() => {
  const script = document.createElement('script');
  script.src = '${appUrl}/embed.js';
  script.setAttribute('data-website-id', '${siteId}');
  script.async = true;
  document.body.appendChild(script);
}, []);`}
            </pre>
          </div>
        )}

        {activeFramework === 'vue' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-700">Load inside your Vue <code className="text-brand-600 font-mono font-semibold">App.vue</code> or component:</p>
            <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800">
{`import { onMounted } from 'vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = '${appUrl}/embed.js';
  script.setAttribute('data-website-id', '${siteId}');
  script.async = true;
  document.body.appendChild(script);
});`}
            </pre>
          </div>
        )}

        {activeFramework === 'wordpress' && (
          <div className="space-y-3 text-xs text-slate-700">
            <p>1. Go to your WordPress admin dashboard or Shopify Theme Editor.</p>
            <p>2. Open <strong>Header and Footer Scripts</strong> settings (or edit <code className="text-brand-600 font-mono font-semibold">theme.liquid</code>).</p>
            <p>3. Paste the script tag into the Footer Scripts section and save.</p>
          </div>
        )}
      </div>
    </div>
  );
}
