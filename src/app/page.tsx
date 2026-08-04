'use client';

import Link from 'next/link';
import { Sparkles, Bot, Code, Zap, Shield, ArrowRight, MessageSquare, Database, Users, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient light gradients */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[400px] bg-purple-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-glow">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-brand-300">
                Acme AI Platform
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                v1.0 SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/demo-embed"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Test Live Embed
            </Link>
            <Link
              href="/dashboard/overview"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-glow transition flex items-center gap-2"
            >
              Open SaaS Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-brand-500/30 text-brand-300 text-xs font-medium mb-8 shadow-inner">
          <Sparkles className="w-4 h-4 text-brand-400" />
          Single JavaScript Snippet Website AI Assistant
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Supercharge Any Website With An <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">
            Intelligent AI Chat Assistant
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Crawl website documentation, ingest PDFs, capture qualified sales leads, and seamlessly transfer chats to live human agents — isolated cleanly inside a zero-conflict Shadow DOM widget.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-16">
          <Link
            href="/dashboard/overview"
            className="px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-glow-lg transition flex items-center gap-3"
          >
            <Bot className="w-5 h-5" /> Launch Dashboard Now
          </Link>
          <Link
            href="/demo-embed"
            className="px-8 py-4 text-base font-semibold text-slate-200 bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 rounded-xl transition flex items-center gap-3"
          >
            <Code className="w-5 h-5 text-brand-400" /> Test Widget Embed Host Page
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mb-4 text-brand-400">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1-Line Shadow DOM Embed</h3>
            <p className="text-slate-400 text-sm">
              Zero CSS or framework conflicts. Works on React, Next.js, WordPress, Shopify, Webflow, and standard HTML pages.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">RAG Knowledge Engine</h3>
            <p className="text-slate-400 text-sm">
              Crawl website URLs, upload PDF/DOCX/Markdown files, and retrieve relevant answers with Gemini AI models.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Support Takeover</h3>
            <p className="text-slate-400 text-sm">
              Support agents can monitor active visitor sessions in real-time and take over live chat whenever needed.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-slate-500 text-xs">
        <p>© 2026 Acme AI Platform SaaS Inc. Production-Ready Enterprise Architecture.</p>
      </footer>
    </div>
  );
}
