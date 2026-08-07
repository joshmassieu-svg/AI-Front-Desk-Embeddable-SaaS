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

  const snippet = `<script src="${appUrl}/widget.js" data-website-id="${siteId}" async></script>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-brand-400" /> Website Embed Code Snippet
          </h2>
          <p className="text-slate-400 text-xs">
            Add your AI website assistant to any site by pasting this single JavaScript tag before <code className="text-brand-300">&lt;/body&gt;</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" /> Domain: {domain}
        </div>
      </div>

      {/* Snippet Card */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/30 shadow-glow space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-brand-400" /> Production Embed Tag ({domain})
          </div>
          <button
            onClick={() => copyToClipboard(snippet)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition flex items-center gap-1.5"
          >
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Snippet</>}
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-brand-300 overflow-x-auto select-all">
          {snippet}
        </div>
      </div>

      {/* Framework Guides */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white">Framework Installation Instructions</h3>

        {/* Framework Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {(['html', 'nextjs', 'react', 'vue', 'wordpress'] as const).map((fw) => (
            <button
              key={fw}
              onClick={() => setActiveFramework(fw)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                activeFramework === fw
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {fw === 'nextjs' ? 'Next.js' : fw === 'wordpress' ? 'WordPress / Shopify' : fw}
            </button>
          ))}
        </div>

        {/* Instructions content */}
        {activeFramework === 'html' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p>1. Open your website template or main <code className="text-brand-300">index.html</code> file.</p>
            <p>2. Paste the snippet code directly above the closing <code className="text-brand-300">&lt;/body&gt;</code> tag.</p>
            <p>3. Save and publish your website. The widget will appear automatically!</p>
          </div>
        )}

        {activeFramework === 'nextjs' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">Add the script tag in your App Router <code className="text-brand-300">app/layout.tsx</code>:</p>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="${appUrl}/widget.js"
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
            <p className="text-xs text-slate-300">Load dynamically in a React component:</p>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`useEffect(() => {
  const script = document.createElement('script');
  script.src = '${appUrl}/widget.js';
  script.setAttribute('data-website-id', '${siteId}');
  script.async = true;
  document.body.appendChild(script);
}, []);`}
            </pre>
          </div>
        )}

        {activeFramework === 'vue' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">Load inside your Vue <code className="text-brand-300">App.vue</code> or component:</p>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`import { onMounted } from 'vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = '${appUrl}/widget.js';
  script.setAttribute('data-website-id', '${siteId}');
  script.async = true;
  document.body.appendChild(script);
});`}
            </pre>
          </div>
        )}

        {activeFramework === 'wordpress' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p>1. Go to your WordPress admin dashboard or Shopify Theme Editor.</p>
            <p>2. Open <strong>Header and Footer Scripts</strong> settings (or edit <code className="text-brand-300">theme.liquid</code>).</p>
            <p>3. Paste the script tag into the Footer Scripts section and save.</p>
          </div>
        )}
      </div>
    </div>
  );
}
