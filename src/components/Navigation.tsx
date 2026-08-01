import React from 'react';
import { 
  Building2, 
  MonitorPlay, 
  Inbox, 
  BarChart3, 
  Code2, 
  Plus, 
  Sparkles, 
  ChevronDown,
  Globe,
  Bot,
  User as UserIcon,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { ClientWebsite } from '../types';

interface NavigationProps {
  activeTab: 'clients' | 'sandbox' | 'inbox' | 'analytics';
  onTabChange: (tab: 'clients' | 'sandbox' | 'inbox' | 'analytics') => void;
  clients: ClientWebsite[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onNewClient: () => void;
  onOpenEmbedModal: (client: ClientWebsite) => void;
  unreadLeadsCount: number;
  currentUser: any | null;
  onOpenAuthModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
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
  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const isRealUser = currentUser && !currentUser.isAnonymous && currentUser.email;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">ReceptionAI</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Embeddable SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500">Virtual Front Desk for Client Websites</p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onTabChange('clients')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'clients'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Website Workspaces ({clients.length})</span>
            </button>

            <button
              onClick={() => onTabChange('sandbox')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MonitorPlay className="w-4 h-4 text-indigo-600" />
              <span>Live Website Sandbox</span>
            </button>

            <button
              onClick={() => onTabChange('inbox')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'inbox'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Inbox className="w-4 h-4 text-amber-600" />
              <span>CRM Inbox</span>
              {unreadLeadsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[11px] font-bold bg-amber-500 text-white rounded-full">
                  {unreadLeadsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Right Actions: Active Workspace Selector & Embed Code Button */}
          <div className="flex items-center gap-2.5">
            {/* Active Website Workspace Selector Dropdown */}
            <div className="relative group">
              <label htmlFor="client-selector-select" className="sr-only">Select Website Workspace</label>
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300/80 rounded-lg pl-3 pr-2 py-1 text-xs font-semibold text-slate-600">
                <span className="text-[11px] uppercase tracking-wider text-teal-700 font-bold">Workspace:</span>
                <select
                  id="client-selector-select"
                  value={selectedClientId}
                  onChange={(e) => onSelectClient(e.target.value)}
                  className="appearance-none bg-transparent text-slate-900 text-sm pl-1 pr-6 py-0.5 font-bold focus:outline-hidden cursor-pointer"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.workspaceName || c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Embed Code Modal Button */}
            {currentClient && (
              <button
                onClick={() => onOpenEmbedModal(currentClient)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors"
                title="Get installation embed snippet for this workspace website"
              >
                <Code2 className="w-4 h-4 text-teal-300" />
                <span className="hidden sm:inline">Embed Script</span>
              </button>
            )}

            {/* New Workspace Button */}
            <button
              onClick={onNewClient}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
              title="Create a new website workspace assistant"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Workspace</span>
            </button>

            {/* Firebase Auth Account Button */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isRealUser
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title="Firebase Authentication User Profile & Login"
            >
              {isRealUser ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
