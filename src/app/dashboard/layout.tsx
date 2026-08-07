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
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

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

import { WebsiteProvider, useWebsite } from '@/context/website-context';
import { Plus } from 'lucide-react';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { websites, currentSite, currentSiteId, setCurrentSiteId, createWebsite } = useWebsite();
  const { user, logout } = useAuth();
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteDomain.trim()) return;
    await createWebsite(newSiteName.trim(), newSiteDomain.trim());
    setNewSiteName('');
    setNewSiteDomain('');
    setShowNewSiteModal(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

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
          <div className="p-4 border-b border-slate-800/50 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>Active Website</span>
              <button
                onClick={() => setShowNewSiteModal(true)}
                className="text-brand-400 hover:text-brand-300 flex items-center gap-0.5 font-bold cursor-pointer"
                title="Add New Website Workspace"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>
            <div className="relative">
              <select
                value={currentSiteId}
                onChange={(e) => setCurrentSiteId(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/70 hover:border-brand-500/50 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer appearance-none"
              >
                {websites.map((site) => (
                  <option key={site.id} value={site.id} className="bg-slate-900 text-slate-100">
                    {site.name} ({site.domain})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
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
            <span className="text-xs text-brand-300 font-mono font-medium px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
              {currentSite?.id || currentSiteId}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Service Operational
            </div>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-xs">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-xs hidden md:block">
                <div className="font-semibold text-slate-200 truncate max-w-[150px]">
                  {user?.email || 'Guest User'}
                </div>
                <div className="text-slate-500">
                  {user ? 'Authenticated' : 'Not signed in'}
                </div>
              </div>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-xs px-3 py-1.5 font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition ml-1"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#080c14]">
          {children}
        </main>
      </div>

      {/* Add New Website Modal */}
      {showNewSiteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-400" /> Create Website Workspace
              </h3>
              <button
                onClick={() => setShowNewSiteModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Website Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NexusTech Store"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Primary Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nexustech.io"
                  value={newSiteDomain}
                  onChange={(e) => setNewSiteDomain(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSiteModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-glow"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebsiteProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </WebsiteProvider>
  );
}
