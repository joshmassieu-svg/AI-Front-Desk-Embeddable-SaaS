import React from 'react';
import { 
  Building2, 
  Plus, 
  Code2, 
  Play, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Globe,
  Award
} from 'lucide-react';
import { ClientWebsite } from '../../types';

interface ClientListViewProps {
  clients: ClientWebsite[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onNewClient: () => void;
  onEditClient: (client: ClientWebsite) => void;
  onDeleteClient: (id: string) => void;
  onOpenEmbedModal: (client: ClientWebsite) => void;
  onLaunchSandbox: (client: ClientWebsite) => void;
  onLaunchDashboard: (client: ClientWebsite) => void;
}

export const ClientListView: React.FC<ClientListViewProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onNewClient,
  onEditClient,
  onDeleteClient,
  onOpenEmbedModal,
  onLaunchSandbox,
  onLaunchDashboard
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Client Websites Grid Header & Actions */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-900">Active Website Workspaces ({clients.length})</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Click &apos;Live Sandbox&apos; to test widget on client site
            </span>
            <button
              onClick={onNewClient}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Website Workspace
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map((client) => {
            const isSelected = client.id === selectedClientId;
            return (
              <div
                key={client.id}
                onClick={() => {
                  onSelectClient(client.id);
                  onLaunchDashboard(client);
                }}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg shadow-xs'
                }`}
              >
                {/* Card Top Brand & Persona Banner */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: client.primaryColor || '#0d9488' }}
                      >
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-teal-700 transition-colors">
                            {client.workspaceName || client.name}
                          </h3>
                          <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                            Workspace
                          </span>
                        </div>
                        <a
                          href={client.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 mt-0.5"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{client.websiteUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEditClient(client)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                        title="Configure Persona & Knowledge Base"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClient(client.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Assistant Persona Box */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {client.personaName} • <span className="font-normal text-slate-600">{client.personaRole}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">
                          &quot;{client.welcomeMessage}&quot;
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-md bg-slate-200 text-slate-700 shrink-0">
                      {client.widgetPosition}
                    </span>
                  </div>

                  {/* Services, Theme & FAQs badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                      Theme: {(client.widgetTemplate || 'modern_soft').replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {client.services.length} Bookable Services
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {client.faqItems.length} Automated FAQs
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Gemini Online
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div
                  className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onSelectClient(client.id);
                      onLaunchDashboard(client);
                    }}
                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Enter Workspace Dashboard</span>
                    <span className="text-teal-400 font-extrabold">→</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenEmbedModal(client)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                      title="Copy embed script"
                    >
                      <Code2 className="w-3.5 h-3.5 text-teal-600" />
                      Embed Script
                    </button>

                    <button
                      onClick={() => {
                        onSelectClient(client.id);
                        onLaunchSandbox(client);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Sandbox
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
