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
}

export const ClientListView: React.FC<ClientListViewProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onNewClient,
  onEditClient,
  onDeleteClient,
  onOpenEmbedModal,
  onLaunchSandbox
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SaaS Status & Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Front Desk Embeddable SaaS • Multi-Tenant Workspace Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Manage Virtual Assistants &amp; Website Workspaces
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Configure custom personas, select widget appearance templates, upload FAQs, and generate copyable <code className="bg-white/10 px-1 rounded-sm">&lt;script&gt;</code> embed tags. Each client website operates as an isolated workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onNewClient}
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Website Workspace
          </button>
        </div>
      </div>

      {/* Client Websites Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">Active Website Workspaces ({clients.length})</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Click &apos;Live Sandbox&apos; to test widget on client site
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map((client) => {
            const isSelected = client.id === selectedClientId;
            return (
              <div
                key={client.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Card Top Brand & Persona Banner */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                        style={{ backgroundColor: client.primaryColor || '#0d9488' }}
                      >
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg leading-tight">{client.name}</h3>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                              Active
                            </span>
                          )}
                        </div>
                        <a
                          href={client.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 mt-0.5"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{client.websiteUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
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
                <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectClient(client.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {isSelected ? '✓ Currently Selected' : 'Select Client'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenEmbedModal(client)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5 text-teal-300" />
                      Embed Code
                    </button>

                    <button
                      onClick={() => {
                        onSelectClient(client.id);
                        onLaunchSandbox(client);
                      }}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Live Sandbox
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
