import React from 'react';
import { 
  Building2, 
  LayoutDashboard,
  MonitorPlay, 
  Inbox, 
  BarChart3, 
  Code2, 
  Plus, 
  ChevronDown,
  User as UserIcon,
  LogIn,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { ClientWebsite } from '../types';

interface TopHeaderProps {
  activeTab: 'clients' | 'dashboard' | 'sandbox' | 'inbox' | 'analytics';
  clients: ClientWebsite[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onNewClient: () => void;
  onOpenEmbedModal: (client: ClientWebsite) => void;
  currentUser: any | null;
  onOpenAuthModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  clients,
  selectedClientId,
  onSelectClient,
  onNewClient,
  onOpenEmbedModal,
  currentUser,
  onOpenAuthModal
}) => {
  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const isRealUser = currentUser && !currentUser.isAnonymous && currentUser.email;

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'clients':
        return {
          title: 'Website Workspaces',
          subtitle: 'Multi-Tenant AI Front Desk Administration & Configuration',
          icon: <Building2 className="w-5 h-5 text-teal-600" />
        };
      case 'dashboard':
        return {
          title: 'Workspace Dashboard',
          subtitle: currentClient ? `Managing ${currentClient.workspaceName || currentClient.name}` : 'Tenant Control Center',
          icon: <LayoutDashboard className="w-5 h-5 text-indigo-600" />
        };
      case 'sandbox':
        return {
          title: 'Live Website Sandbox',
          subtitle: currentClient ? `Testing embeddable widget on ${currentClient.workspaceName || currentClient.name}` : 'Interactive Simulator',
          icon: <MonitorPlay className="w-5 h-5 text-indigo-600" />
        };
      case 'inbox':
        return {
          title: 'CRM Inbox & Leads',
          subtitle: 'Centralized lead capture and appointment bookings across client websites',
          icon: <Inbox className="w-5 h-5 text-amber-600" />
        };
      case 'analytics':
        return {
          title: 'Analytics & ROI',
          subtitle: 'Performance metrics, conversation counts, and conversion tracking',
          icon: <BarChart3 className="w-5 h-5 text-emerald-600" />
        };
    }
  };

  const section = getSectionTitle();

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
      {/* Left: Section Header & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
          {section.icon}
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{section.title}</span>
            {currentClient && activeTab !== 'clients' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/60">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentClient.primaryColor || '#0d9488' }}
                />
                {currentClient.workspaceName || currentClient.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 font-medium">{section.subtitle}</p>
        </div>
      </div>

      {/* Right Actions: Quick Workspace selector, Embed Script, New Workspace, Profile */}
      <div className="flex items-center gap-3">
        {/* Active Workspace Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300/80 rounded-xl pl-3 pr-2 py-1.5 text-xs font-semibold text-slate-600">
          <span className="text-[11px] uppercase tracking-wider text-teal-700 font-bold">Workspace:</span>
          <select
            value={selectedClientId}
            onChange={(e) => onSelectClient(e.target.value)}
            className="appearance-none bg-transparent text-slate-900 text-xs pl-1 pr-5 py-0.5 font-bold focus:outline-hidden cursor-pointer"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.workspaceName || c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
        </div>

        {/* Embed Script button */}
        {currentClient && (
          <button
            onClick={() => onOpenEmbedModal(currentClient)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            title="Get copyable embed script snippet for this website"
          >
            <Code2 className="w-3.5 h-3.5 text-teal-300" />
            <span>&lt;script&gt; Embed</span>
          </button>
        )}

        {/* New Workspace button */}
        <button
          onClick={onNewClient}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          title="Create a new website workspace"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workspace</span>
        </button>

        {/* Firebase Authentication Account Button */}
        <button
          onClick={onOpenAuthModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isRealUser
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
          title="User Account & Cloud Sync"
        >
          {isRealUser ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span className="max-w-[120px] truncate font-bold">
                {currentUser.displayName || currentUser.email}
              </span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold">Sign In</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
