'use client';

import React, { useState, useEffect } from 'react';
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
  Building2,
  User,
  LogOut,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { WebsiteProvider, useWebsite } from '@/context/website-context';

const navItems = [
  { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { label: 'Widget Customizer', href: '/dashboard/customizer', icon: Palette },
  { label: 'Knowledge Base', href: '/dashboard/knowledge', icon: Database },
  { label: 'Live Support Inbox', href: '/dashboard/inbox', icon: MessageSquareText, badge: 'Live' },
  { label: 'Leads & CRM', href: '/dashboard/leads', icon: Users },
  { label: 'Team & Members', href: '/dashboard/team', icon: ShieldCheck },
  { label: 'My Workplaces', href: '/dashboard/workplaces', icon: Building2 },
  { label: 'AI & Guardrails', href: '/dashboard/ai-settings', icon: Cpu },
  { label: 'Embed Snippet', href: '/dashboard/embed', icon: Code2 },
  { label: 'API & Webhooks', href: '/dashboard/api-keys', icon: Key },
  { label: 'Settings & Plans', href: '/dashboard/settings', icon: Settings },
];

import { TestBotDrawer } from '@/components/test-bot-drawer';
import { DashboardTourModal } from '@/components/dashboard-tour-modal';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, HelpCircle } from 'lucide-react';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { websites, currentSite, currentSiteId, setCurrentSiteId, createWebsite, workplace } = useWebsite();
  const { user, loading, logout } = useAuth();
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [showTestDrawer, setShowTestDrawer] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');

  // Close the mobile sidebar automatically whenever the route changes
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [pathname]);

  // Strict Auth Protection: Redirect unauthenticated guest users immediately to /login
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [user, loading, pathname, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Verifying your session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400 shadow-lg">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold mb-1.5 text-white tracking-tight">Sign in required</h2>
        <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
          You need to be signed in to a Flowdexx account to access this workspace.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition shadow-md"
        >
          Sign In to Unlock
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 shadow-lg transition-transform duration-200 ease-out lg:static lg:z-30 lg:shadow-sm lg:translate-x-0 ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Platform Title */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900">
                Flowdexx <span className="text-brand-600 font-medium">AI SaaS</span>
              </span>
            </Link>
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Website Switcher / Workplace Display */}
          <div className="p-4 border-b border-slate-100 space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <span>Websites ({websites.length})</span>
              <button
                onClick={() => setShowNewSiteModal(true)}
                className="text-brand-600 hover:text-brand-700 flex items-center gap-0.5 font-semibold cursor-pointer transition"
                title="Add New Website"
              >
                <Plus className="w-3 h-3" /> Add Website
              </button>
            </div>
            <div className="relative">
              <select
                value={currentSiteId}
                onChange={(e) => setCurrentSiteId(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-brand-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 cursor-pointer appearance-none shadow-sm transition"
              >
                {websites.map((site) => (
                  <option key={site.id} value={site.id} className="bg-white text-slate-800">
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Demo Link */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <Link
            href="/demo-embed"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:border-brand-300 transition shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Preview Demo Site</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-3 sm:px-5 lg:px-8 flex items-center justify-between shrink-0 shadow-sm gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition lg:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {navItems.find((n) => n.href === pathname)?.label || 'Dashboard'}
            </h1>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-xs text-brand-700 font-mono font-semibold px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-100 hidden sm:inline-block truncate max-w-[160px]">
              {currentSite?.name || currentSiteId}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setShowTourModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
              title="Open Platform Guide & Feature Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>Help & Tour</span>
            </button>

            <button
              onClick={() => setShowTestDrawer(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Test AI Assistant live from any dashboard page"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test Bot Live</span>
            </button>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Service Operational
            </div>

            <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-xs hidden md:block">
                <div className="font-semibold text-slate-800 truncate max-w-[150px]">
                  {user?.email || 'Guest User'}
                </div>
                <div className="text-slate-400 text-[11px]">
                  {user ? 'Authenticated' : 'Not signed in'}
                </div>
              </div>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-xl transition ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-xs px-3 py-1.5 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition ml-1 shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>

      {/* Global Interactive Test Drawer & Tour Modal */}
      <TestBotDrawer isOpen={showTestDrawer} onClose={() => setShowTestDrawer(false)} />
      <DashboardTourModal isOpen={showTourModal} onClose={() => setShowTourModal(false)} />

      {/* Add New Website Modal */}
      {showNewSiteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-600" /> Create Website Workspace
              </h3>
              <button
                onClick={() => setShowNewSiteModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Website Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NexusTech Store"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Primary Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nexustech.io"
                  value={newSiteDomain}
                  onChange={(e) => setNewSiteDomain(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSiteModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition"
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
