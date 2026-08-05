'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Bot, ArrowLeft, ExternalLink, Sparkles, CheckCircle2, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

export default function DemoEmbedPage() {
  const [widgetLaunched, setWidgetLaunched] = useState(false);

  const handleLaunchWidget = useCallback(() => {
    if (widgetLaunched) return;
    setWidgetLaunched(true);

    // Inject widget script dynamically into host demo page
    const existing = document.getElementById('demo-widget-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'demo-widget-script';
      script.src = '/widget.js';
      script.setAttribute('data-website-id', 'site_acme_123');
      script.async = true;
      document.body.appendChild(script);
    }
  }, [widgetLaunched]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 border-b border-brand-500/30 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>
            <strong>Host Demo Environment</strong>: Click the launcher button to load <code className="text-brand-300">/widget.js</code> with Shadow DOM isolation.
          </span>
        </div>

        <Link
          href="/dashboard/overview"
          className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Simulated Customer Webpage Header */}
      <header className="max-w-7xl mx-auto px-6 w-full h-20 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-glow">
            NT
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">NexusTech Solutions</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#docs" className="hover:text-white">Docs</a>
        </nav>

        <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-glow">
          Get Started Free
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs mb-6">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Next-Generation Enterprise Software Host Site
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
          Accelerate Operations with <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-brand-300">
            NexusTech Cloud Automation
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          This simulated customer website demonstrates how the embedded AI Assistant operates natively inside host web applications without style bleeding or layout shift.
        </p>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-xl mx-auto text-left space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Try Asking the Widget:</div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <em>&quot;What features does Acme offer?&quot;</em></li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <em>&quot;How much does the Pro plan cost?&quot;</em></li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <em>&quot;I need to speak with a human support rep.&quot;</em></li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-slate-500 text-xs">
        <p>© 2026 NexusTech Solutions Host Demo Page. AI Widget Embedded via Shadow DOM.</p>
      </footer>

      {/* Floating Launcher Button — only visible before widget is loaded */}
      {!widgetLaunched && (
        <button
          onClick={handleLaunchWidget}
          className="fixed bottom-5 right-5 z-[999999] w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white border-none cursor-pointer flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3),0_0_20px_rgba(83,109,244,0.4)] hover:scale-110 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4),0_0_30px_rgba(83,109,244,0.7)] transition-all duration-300 group"
          title="Launch AI Assistant"
          aria-label="Launch AI Assistant Widget"
        >
          <MessageSquare className="w-7 h-7 group-hover:scale-110 transition-transform duration-200" />
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full border-2 border-brand-400 animate-ping opacity-40 pointer-events-none" />
        </button>
      )}
    </div>
  );
}
