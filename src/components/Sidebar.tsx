import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard,
  MonitorPlay, 
  Inbox, 
  BarChart3, 
  Code2, 
  Plus, 
  Sparkles, 
  ChevronDown,
  Bot,
  User as UserIcon,
  LogIn,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ClientWebsite } from '../types';

interface SidebarProps {
  activeTab: 'clients' | 'dashboard' | 'sandbox' | 'inbox' | 'analytics';
  onTabChange: (tab: 'clients' | 'dashboard' | 'sandbox' | 'inbox' | 'analytics') => void;
  clients: ClientWebsite[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onNewClient: () => void;
  onOpenEmbedModal: (client: ClientWebsite) => void;
  unreadLeadsCount: number;
  currentUser: any | null;
  onOpenAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  clients,
  selectedClientId,
  onSelectClient,
  onNewClient,
  onOpenEmbedModal,
  unreadLeadsCount,
  currentUser,
  onOpenAuthModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const isRealUser = currentUser && !currentUser.isAnonymous && currentUser.email;

  const handleNavClick = (tab: 'clients' | 'dashboard' | 'sandbox' | 'inbox' | 'analytics') => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 w-68 sm:w-72 select-none">
      {/* Brand & Logo Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">ReceptionAI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Embeddable Workspace Engine</p>
          </div>
        </div>
        {mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Workspace Switcher Card */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1.5 flex items-center justify-between">
          <span>Active Workspace</span>
          <span className="text-slate-400 font-normal">{clients.length} Total</span>
        </div>

        <div className="relative mb-2">
          <label htmlFor="sidebar-client-select" className="sr-only">Select Website Workspace</label>
          <select
            id="sidebar-client-select"
            value={selectedClientId}
            onChange={(e) => onSelectClient(e.target.value)}
            className="w-full appearance-none bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-white text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer transition-colors truncate"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.workspaceName || c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          {currentClient && (
            <button
              onClick={() => {
                onOpenEmbedModal(currentClient);
                setMobileMenuOpen(false);
              }}
              className="flex-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              title="Get installation embed script"
            >
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span>&lt;script&gt; Embed</span>
            </button>
          )}
          <button
            onClick={() => {
              onNewClient();
              setMobileMenuOpen(false);
            }}
            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-xs"
            title="Create a new website workspace"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Workspaces &amp; Management
        </div>

        <button
          onClick={() => handleNavClick('clients')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'clients'
              ? 'bg-teal-600 text-white shadow-sm font-bold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Building2 className={`w-4 h-4 ${activeTab === 'clients' ? 'text-white' : 'text-teal-400'}`} />
            <span>Website Workspaces</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'clients'
              ? 'bg-white/20 text-white'
              : 'bg-slate-800 text-slate-300'
          }`}>
            {clients.length}
          </span>
        </button>

        <button
          onClick={() => handleNavClick('dashboard')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-teal-600 text-white shadow-sm font-bold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-indigo-400'}`} />
            <span>Workspace Dashboard</span>
          </div>
          {currentClient && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[80px] ${
              activeTab === 'dashboard'
                ? 'bg-white/20 text-white'
                : 'bg-slate-800 text-indigo-300'
            }`}>
              {(currentClient.workspaceName || currentClient.name).split(' ')[0]}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNavClick('sandbox')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'sandbox'
              ? 'bg-teal-600 text-white shadow-sm font-bold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <MonitorPlay className={`w-4 h-4 ${activeTab === 'sandbox' ? 'text-white' : 'text-indigo-400'}`} />
            <span>Live Website Sandbox</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'sandbox'
              ? 'bg-white/20 text-white'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}>
            Live
          </span>
        </button>

        <div className="px-3 pt-5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Leads &amp; Intelligence
        </div>

        <button
          onClick={() => handleNavClick('inbox')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'inbox'
              ? 'bg-teal-600 text-white shadow-sm font-bold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Inbox className={`w-4 h-4 ${activeTab === 'inbox' ? 'text-white' : 'text-amber-400'}`} />
            <span>CRM Inbox</span>
          </div>
          {unreadLeadsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
              {unreadLeadsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNavClick('analytics')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-teal-600 text-white shadow-sm font-bold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-white' : 'text-emerald-400'}`} />
            <span>Analytics &amp; ROI</span>
          </div>
        </button>
      </div>

      {/* Footer / Account Section */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/80 space-y-2">
        {/* Firebase Authentication Button */}
        <button
          onClick={() => {
            onOpenAuthModal();
            setMobileMenuOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
            isRealUser
              ? 'bg-slate-800/90 border-emerald-500/30 text-emerald-300 hover:bg-slate-800'
              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            {isRealUser ? (
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                  {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="text-left truncate">
              <p className="text-xs font-bold text-white truncate">
                {isRealUser ? (currentUser.displayName || currentUser.email) : 'Sign In / Account'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {isRealUser ? 'Authenticated' : 'Cloud Sync Profile'}
              </p>
            </div>
          </div>
          <LogIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* System Status badge */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/60 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">Multi-Tenant Engine</span>
          </div>
          <span className="text-slate-500 font-mono">v2.4</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex shrink-0 min-h-screen sticky top-0 h-screen z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Top Header (hidden on desktop lg) */}
      <div className="lg:hidden sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-teal-700 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tight">ReceptionAI</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentClient && (
            <button
              onClick={() => onOpenEmbedModal(currentClient)}
              className="px-2.5 py-1.5 bg-slate-800 text-teal-300 hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Embed</span>
            </button>
          )}
          <button
            onClick={onNewClient}
            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-72 max-w-[85vw] h-full shadow-2xl">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
};
