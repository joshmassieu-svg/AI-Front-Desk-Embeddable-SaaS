'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Zap,
  Globe,
  Layout,
  Check,
  ExternalLink,
  Share2,
  RefreshCw,
  Search,
  Building2,
  ChevronDown,
} from 'lucide-react';

import { useWebsite } from '@/context/website-context';

function DemoEmbedContent() {
  const searchParams = useSearchParams();
  const { websites, currentSite, currentSiteId, setCurrentSiteId } = useWebsite();

  // Query Params
  const queryUrl = searchParams.get('url') || '';
  const querySiteId = searchParams.get('siteId') || '';
  const queryMode = (searchParams.get('mode') as 'iframe' | 'simulator') || 'iframe';

  // Mode state: 'iframe' or 'simulator'
  const [mode, setMode] = useState<'iframe' | 'simulator'>(queryMode);

  // URL state
  const defaultDomain = currentSite?.domain
    ? currentSite.domain.startsWith('http')
      ? currentSite.domain
      : `https://${currentSite.domain}`
    : 'https://example.com';
  const [inputUrl, setInputUrl] = useState<string>(queryUrl || defaultDomain);
  const [activeUrl, setActiveUrl] = useState<string>(queryUrl || defaultDomain);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);

  // Sync siteId from query params if specified
  useEffect(() => {
    if (querySiteId && querySiteId !== currentSiteId) {
      const match = websites.find((s) => s.id === querySiteId);
      if (match) {
        setCurrentSiteId(match.id);
      }
    }
  }, [querySiteId, websites, currentSiteId, setCurrentSiteId]);

  // Update input & active URL when currentSite changes if no custom query URL was provided
  useEffect(() => {
    if (!queryUrl && currentSite?.domain) {
      const formatted = currentSite.domain.startsWith('http')
        ? currentSite.domain
        : `https://${currentSite.domain}`;
      setInputUrl(formatted);
      setActiveUrl(formatted);
    }
  }, [currentSite, queryUrl]);

  // Inject widget script dynamically into host demo page
  useEffect(() => {
    const siteIdToUse = currentSiteId || 'site_default';

    // Remove existing script if any to force reload when siteId changes
    const existing = document.getElementById('demo-widget-script');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = 'demo-widget-script';
    script.src = '/embed.js';
    script.setAttribute('data-website-id', siteIdToUse);
    script.async = true;
    document.body.appendChild(script);
  }, [currentSiteId]);

  // Normalize URL helper
  const normalizeUrl = (url: string): string => {
    let trimmed = url.trim();
    if (!trimmed) return 'https://example.com';
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(inputUrl);
    setInputUrl(normalized);
    setActiveUrl(normalized);
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/demo-embed?url=${encodeURIComponent(activeUrl)}&siteId=${currentSiteId}&mode=${mode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const siteName = currentSite?.name || 'Client Website';
  const siteDomain = currentSite?.domain || 'mywebsite.com';
  const primaryColor = currentSite?.primaryColor || '#536df4';
  const botName = currentSite?.botName || 'AI Copilot';
  const suggestedQuestions = currentSite?.suggestedQuestions?.length
    ? currentSite.suggestedQuestions
    : [
        'What features do you offer?',
        'How much does the Pro plan cost?',
        'How can I get in touch with customer support?',
      ];

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Top Preview Controller Toolbar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Left: Back & Workspace Site Selector */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/overview"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition border border-slate-700/60"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Site Selector Dropdown */}
          <div className="relative flex items-center">
            <Building2 className="w-4 h-4 text-brand-400 absolute left-3 pointer-events-none" />
            <select
              value={currentSiteId}
              onChange={(e) => setCurrentSiteId(e.target.value)}
              className="bg-slate-950 text-slate-100 border border-slate-700/80 hover:border-slate-600 rounded-lg pl-9 pr-8 py-1.5 text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-inner"
            >
              {websites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.domain})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Center: Mode Switcher & URL Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-2xl justify-center">
          {/* Mode Switcher Tabs */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setMode('iframe')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                mode === 'iframe'
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </button>
            <button
              onClick={() => setMode('simulator')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                mode === 'simulator'
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Brand Simulator</span>
            </button>
          </div>

          {/* URL Input Bar (Visible in iframe mode) */}
          {mode === 'iframe' && (
            <form onSubmit={handleUrlSubmit} className="flex-1 min-w-[200px] flex items-center gap-1.5">
              <div className="relative flex-1 flex items-center">
                <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://clientwebsite.com"
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-brand-500 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700/60 transition shrink-0"
              >
                <Search className="w-3.5 h-3.5 text-brand-400" />
                <span className="hidden md:inline">Go</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {mode === 'iframe' && activeUrl && (
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700/60"
              title="Open site in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={handleCopyShareLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              copied
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                : 'bg-brand-600 hover:bg-brand-500 border-brand-500 text-white shadow-glow'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Demo Link</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {mode === 'iframe' ? (
          /* LIVE IFRAME PREVIEW MODE */
          <div className="flex-1 flex flex-col relative w-full h-full min-h-[calc(100vh-65px)] bg-slate-950">
            {/* Informational / Fallback Notice Banner */}
            <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="truncate">
                  Previewing Widget on <code className="text-brand-300 font-mono">{activeUrl}</code>
                </span>
              </div>
              <button
                onClick={() => setMode('simulator')}
                className="text-brand-400 hover:text-brand-300 underline font-medium shrink-0 ml-2"
              >
                Site blocked iframe? Switch to Simulator
              </button>
            </div>

            {/* Iframe Viewport */}
            <div className="flex-1 w-full relative">
              <iframe
                src={activeUrl}
                title="Client Website Live Preview"
                className="w-full h-full border-none absolute inset-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        ) : (
          /* DYNAMIC BRAND SIMULATOR MODE */
          <div className="flex-1 flex flex-col justify-between p-6 max-w-6xl mx-auto w-full my-auto">
            {/* Simulated Customer Header */}
            <div className="w-full py-4 px-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between mb-8 shadow-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-glow uppercase text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {siteName.slice(0, 2)}
                </div>
                <div>
                  <h2 className="font-extrabold text-lg tracking-tight text-white">{siteName}</h2>
                  <p className="text-xs text-slate-400 font-mono">{siteDomain}</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
                <span className="hover:text-white cursor-pointer transition">Products</span>
                <span className="hover:text-white cursor-pointer transition">Solutions</span>
                <span className="hover:text-white cursor-pointer transition">Pricing</span>
                <span className="hover:text-white cursor-pointer transition">Contact</span>
              </nav>

              <button
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow-glow"
                style={{ backgroundColor: primaryColor }}
              >
                Get Started
              </button>
            </div>

            {/* Hero Banner */}
            <div className="text-center py-12 px-4 max-w-4xl mx-auto my-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs mb-6 shadow-inner">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Powered by AI Front-Desk Embeddable Assistant
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                Welcome to <br />
                <span
                  className="bg-clip-text text-transparent bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${primaryColor}, #a5b4fc)`,
                  }}
                >
                  {siteName}
                </span>
              </h1>

              <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                This is a live interactive demonstration for <strong>{siteName}</strong>. The embedded AI assistant (<code className="text-brand-300">{botName}</code>) is fully configured for <code className="text-brand-300">{siteDomain}</code>.
              </p>

              {/* Sample Questions Card */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 max-w-xl mx-auto text-left space-y-3 shadow-2xl backdrop-blur-sm">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Try Asking {botName}:</span>
                  <span className="text-[10px] text-brand-400 font-mono">Click floating launcher 👇</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {suggestedQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>&quot;{q}&quot;</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-8 border-t border-slate-800/80 py-6 text-center text-slate-500 text-xs">
              <p>© 2026 {siteName} ({siteDomain}). AI Assistant Widget embedded via Shadow DOM &amp; Lazy Iframe.</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DemoEmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0f1d] text-slate-300 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-brand-400 animate-spin" />
            <span className="text-sm font-medium">Loading demo preview...</span>
          </div>
        </div>
      }
    >
      <DemoEmbedContent />
    </Suspense>
  );
}

