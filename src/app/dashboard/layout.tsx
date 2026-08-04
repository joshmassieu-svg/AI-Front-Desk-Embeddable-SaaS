'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Palette,
  Database,
  MessageSquareText,
  Users,
  Cpu,
  Code2,
  Key,
  Settings,
  ExternalLink,
  ChevronDown,
  Globe,
  Bot,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { label: 'Widget Customizer', href: '/dashboard/customizer', icon: Palette },
  { label: 'Knowledge Base', href: '/dashboard/knowledge', icon: Database },
  { label: 'Live Support Inbox', href: '/dashboard/inbox', icon: MessageSquareText, badge: 'Live' },
  { label: 'Leads & CRM', href: '/dashboard/leads', icon: Users },
  { label: 'AI & Guardrails', href: '/dashboard/ai-settings', icon: Cpu },
  { label: 'Embed Snippet', href: '/dashboard/embed', icon: Code2 },
  { label: 'API & Webhooks', href: '/dashboard/api-keys', icon: Key },
  { label: 'Settings & Plans', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selectedSite, setSelectedSite] = useState('Acme SaaS Platform (acme.com)');

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 flex flex-col justify-between shrink-0 z-30">
        <div>
          {/* Logo & Platform Title */}
          <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                Acme AI <span className="text-brand-400 font-normal">SaaS</span>
              </span>
            </Link>
          </div>

          {/* Website Switcher Dropdown */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Active Website
            </div>
            <div className="relative">
              <button className="w-full bg-slate-900/90 border border-slate-700/70 hover:border-brand-500/50 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 flex items-center justify-between transition">
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{selectedSite}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Demo Link */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <Link
            href="/demo-embed"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/80 border border-slate-700/60 hover:bg-slate-800 hover:border-brand-500/40 transition"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Preview Demo Site</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0d1322]/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-white">
              {navItems.find((n) => n.href === pathname)?.label || 'Dashboard'}
            </h1>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">site_acme_123</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Service Operational
            </div>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-xs">
                SJ
              </div>
              <div className="text-xs hidden md:block">
                <div className="font-semibold text-slate-200">Sarah Jenkins</div>
                <div className="text-slate-500">Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#080c14]">
          {children}
        </main>
      </div>
    </div>
  );
}
