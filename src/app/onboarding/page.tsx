'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useWebsite } from '@/context/website-context';
import {
  Bot,
  Globe,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Terminal,
  Loader2,
  ShieldCheck,
  Building2,
  Palette,
  BookOpen,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentSite, completeOnboarding, isLoading: siteLoading } = useWebsite();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [siteName, setSiteName] = useState('');
  const [domain, setDomain] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState<'idle' | 'crawling' | 'completed' | 'background'>('idle');
  const [activeFramework, setActiveFramework] = useState<'html' | 'nextjs' | 'react' | 'wordpress'>('html');
  const [appUrl, setAppUrl] = useState('http://localhost:3000');
  const [error, setError] = useState<string | null>(null);

  // If unauthenticated guest visits /onboarding directly, send them to signup
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signup?from=onboarding');
    }
  }, [user, authLoading, router]);

  // Initialize URL & defaults from active site
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (currentSite) {
      if (!siteName && currentSite.name && currentSite.name !== 'AI Front-Desk Assistant') {
        setSiteName(currentSite.name);
      }
      if (!domain && currentSite.domain && currentSite.domain !== 'mywebsite.com') {
        setDomain(currentSite.domain);
      }
    }
  }, [currentSite]);

  const cleanDomain = (input: string) => {
    return input
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');
  };

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = cleanDomain(domain);
    if (!cleaned) {
      setError('Please enter a valid website domain.');
      return;
    }

    const finalName = siteName.trim() || cleaned.split('.')[0].toUpperCase();

    try {
      setIsSaving(true);
      const createdSite = await completeOnboarding(finalName, cleaned);

      setDomain(cleaned);
      setSiteName(finalName);

      // Start crawling website knowledge base in the background
      const targetWebsiteId = createdSite?.id || 'site_default';
      const crawlUrl = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;

      setCrawlStatus('crawling');
      const crawlPromise = fetch('/api/v1/knowledge/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: targetWebsiteId,
          url: crawlUrl,
          mode: 'site',
        }),
      })
        .then((res) => {
          if (res.ok) {
            setCrawlStatus('completed');
          } else {
            setCrawlStatus('background');
          }
        })
        .catch((err) => {
          console.log('Background crawl execution continuing:', err);
          setCrawlStatus('background');
        });

      // Max 3-second wait timeout: if crawling lasts more than 3 seconds, continue in background and lead user to next step
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000));
      await Promise.race([crawlPromise, timeoutPromise]);

      setCrawlStatus((prev) => (prev === 'crawling' ? 'background' : prev));
      setStep(2);
    } catch (err: any) {
      console.error('Error saving domain during onboarding:', err);
      setError('Failed to save website details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishOnboarding = () => {
    router.push('/dashboard/overview');
  };

  const siteId = currentSite?.id || 'site_default';
  const effectiveDomain = domain ? cleanDomain(domain) : currentSite?.domain || 'mywebsite.com';
  const embedSnippet = `<script src="${appUrl}/embed.js" data-website-id="${siteId}" async></script>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes meshFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(30px, -20px, 0) scale(1.08); }
        }
        .bg-mesh-glow {
          animation: meshFloat 14s ease-in-out infinite;
        }
      `}</style>

      <main className="min-h-screen bg-[#faf8f5] relative overflow-hidden font-sans p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        {/* Soft Background Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(254,240,138,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(251,207,232,0.4),transparent_45%)] pointer-events-none" />
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#fef08a]/60 blur-[90px] bg-mesh-glow pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-[#fbcfe8]/70 blur-[95px] bg-mesh-glow pointer-events-none" />

        {/* Top Navigation Bar */}
        <header className="relative z-10 max-w-4xl w-full mx-auto flex items-center justify-between py-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-amber-300 shadow-md transition-transform group-hover:scale-105">
              <Bot className="h-5 w-5 text-slate-900" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-950">
              Flowdexx <span className="font-medium text-pink-500">AI</span>
            </span>
          </Link>
        </header>

        {/* Main Content Area */}
        <div className="relative z-10 max-w-2xl w-full mx-auto my-auto py-6">
          {/* Stepper Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-200/80 px-2.5 py-0.5 rounded-full">
                  Step {step} of 3
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {step === 1 && 'Add Your Domain'}
                  {step === 2 && 'Copy Embed Code'}
                  {step === 3 && 'Ready to Launch'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {step === 1 ? '33%' : step === 2 ? '66%' : '100%'}
              </span>
            </div>

            {/* Stepper Dots & Line */}
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-pink-500 to-amber-400 rounded-full z-0 transition-all duration-500"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              />

              {/* Step 1 Node */}
              <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition shadow-sm ${
                step >= 1 ? 'bg-pink-500 text-white ring-4 ring-pink-100' : 'bg-white border border-slate-300 text-slate-400'
              }`}>
                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>

              {/* Step 2 Node */}
              <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition shadow-sm ${
                step >= 2 ? 'bg-pink-500 text-white ring-4 ring-pink-100' : 'bg-white border border-slate-300 text-slate-400'
              }`}>
                {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>

              {/* Step 3 Node */}
              <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition shadow-sm ${
                step === 3 ? 'bg-pink-500 text-white ring-4 ring-pink-100' : 'bg-white border border-slate-300 text-slate-400'
              }`}>
                {step === 3 ? <Sparkles className="w-4 h-4" /> : '3'}
              </div>
            </div>
          </div>

          {/* Step 1: Add Domain */}
          {step === 1 && (
            <div className="rounded-[28px] border border-pink-100/80 bg-white/90 p-6 sm:p-10 shadow-[0_20px_70px_rgba(244,114,182,0.12)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
                    Add your website domain
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect the website where your AI front desk assistant will live.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-pink-200 bg-pink-50/80 p-3.5 text-xs text-pink-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleDomainSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Company or Project Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Website Domain <span className="text-pink-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="e.g. acme.com or app.mysite.io"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    We&apos;ll allow requests and embed scripts exclusively from this domain for security.
                  </p>
                </div>

                {domain && (
                  <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Configured Origin: <strong className="text-slate-900 font-mono">{cleanDomain(domain)}</strong></span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                      Ready
                    </span>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSaving || !domain.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 hover:from-pink-600 hover:to-amber-500 text-white font-semibold py-3.5 px-6 shadow-md shadow-pink-500/20 transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving domain...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Embed Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Copy Embed Code */}
          {step === 2 && (
            <div className="rounded-[28px] border border-pink-100/80 bg-white/90 p-6 sm:p-10 shadow-[0_20px_70px_rgba(244,114,182,0.12)] backdrop-blur-xl animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
                      Copy your embed code
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Paste this script into your website to install the assistant.
                    </p>
                  </div>
                </div>
              </div>

              {/* Snippet Card */}
              <div className="space-y-4 mb-6">
                {/* Knowledge Crawl Status Pill */}
                {crawlStatus === 'crawling' || crawlStatus === 'background' ? (
                  <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600 shrink-0" />
                      <span>
                        AI Knowledge Base: Scanning &amp; indexing <strong className="font-mono">{effectiveDomain}</strong> in background...
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded uppercase shrink-0">
                      In Progress
                    </span>
                  </div>
                ) : crawlStatus === 'completed' ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-900 shadow-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        AI Knowledge Base Ready: Content indexed from <strong className="font-mono">{effectiveDomain}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded uppercase shrink-0">
                      Trained
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Terminal className="w-4 h-4 text-pink-600" />
                    <span>Production JavaScript Snippet</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {effectiveDomain}
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(embedSnippet)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-xs font-semibold transition shadow-xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-pink-300 overflow-x-auto shadow-inner select-all">
                  {embedSnippet}
                </div>
              </div>

              {/* Framework Guides Tabs */}
              <div className="space-y-3 mb-8 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-800">Quick Installation Instructions:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(['html', 'nextjs', 'react', 'wordpress'] as const).map((fw) => (
                    <button
                      key={fw}
                      onClick={() => setActiveFramework(fw)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                        activeFramework === fw
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      {fw === 'nextjs' ? 'Next.js' : fw === 'wordpress' ? 'WordPress / Shopify' : fw.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-600 leading-relaxed pt-1">
                  {activeFramework === 'html' && (
                    <p>Paste the snippet right before the closing <code className="text-pink-600 font-mono">&lt;/body&gt;</code> tag of your HTML.</p>
                  )}
                  {activeFramework === 'nextjs' && (
                    <p>Add using Next.js <code className="text-pink-600 font-mono">&lt;Script src=&quot;{appUrl}/embed.js&quot; data-website-id=&quot;{siteId}&quot; /&gt;</code> in <code className="text-slate-800 font-mono">app/layout.tsx</code>.</p>
                  )}
                  {activeFramework === 'react' && (
                    <p>Load dynamically inside a <code className="text-slate-800 font-mono">useEffect</code> hook or index.html template.</p>
                  )}
                  {activeFramework === 'wordpress' && (
                    <p>Paste into your Theme Settings &rarr; Header &amp; Footer Scripts (or <code className="text-slate-800 font-mono">theme.liquid</code> footer).</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 hover:from-pink-600 hover:to-amber-500 text-white font-semibold py-3.5 px-6 shadow-md shadow-pink-500/20 transition hover:shadow-lg cursor-pointer"
                >
                  <span>Next: Flow Complete</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Onboarding Complete -> Head to Dashboard Overview */}
          {step === 3 && (
            <div className="rounded-[28px] border border-pink-100/80 bg-white/95 p-6 sm:p-10 shadow-[0_20px_70px_rgba(244,114,182,0.12)] backdrop-blur-xl text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Success Badge */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-pink-500 to-amber-400 text-white shadow-xl shadow-pink-500/25">
                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
              </div>

              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-pink-200/80 bg-pink-50/80 px-3.5 py-1 text-xs font-semibold text-pink-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Onboarding Flow Complete</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                You&apos;re all set!
              </h1>

              <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your AI Front Desk Assistant for <strong className="text-slate-900 font-mono">{effectiveDomain}</strong> is active and ready to handle customer inquiries.
              </p>

              {/* Summary Card */}
              <div className="my-6 p-4 rounded-2xl bg-[#faf8f5] border border-slate-200/80 text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Domain Connected</span>
                  <span className="font-semibold text-slate-900 font-mono">{effectiveDomain}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Embed Snippet</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Generated &amp; Ready
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Website Knowledge</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    {crawlStatus === 'completed' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Indexed &amp; Ready</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        <span className="text-amber-700">Indexing in Background</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">AI Front Desk Status</span>
                  <span className="font-semibold text-pink-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Online &amp; Active
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-3 max-w-md mx-auto pt-2">
                <button
                  onClick={handleFinishOnboarding}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold py-4 px-6 shadow-md transition hover:shadow-lg text-sm cursor-pointer"
                >
                  <span>Head to Dashboard Overview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <Link
                    href="/dashboard/customizer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                  >
                    <Palette className="w-3.5 h-3.5 text-pink-500" />
                    <span>Customize Look</span>
                  </Link>

                  <Link
                    href="/dashboard/knowledge"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Add Knowledge</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center py-4 text-xs text-slate-400">
          Flowdexx AI Platform &copy; {new Date().getFullYear()} &bull; Fast, intelligent front-desk support.
        </footer>
      </main>
    </>
  );
}
