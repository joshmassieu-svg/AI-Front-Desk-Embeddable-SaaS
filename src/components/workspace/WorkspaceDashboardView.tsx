/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ClientWebsite, 
  LeadItem, 
  AppointmentItem, 
  Conversation, 
  LeadStatus, 
  AppointmentStatus 
} from '../../types';
import { 
  Building2, 
  Bot, 
  ExternalLink, 
  Code2, 
  MonitorPlay, 
  Settings, 
  Users, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Copy, 
  Check, 
  ArrowUpRight, 
  Mail, 
  Phone, 
  FileText,
  ShieldCheck,
  Palette,
  Briefcase
} from 'lucide-react';
import { FrontDeskWidget } from '../widget/FrontDeskWidget';

interface WorkspaceDashboardViewProps {
  client: ClientWebsite;
  allClients: ClientWebsite[];
  leads: LeadItem[];
  appointments: AppointmentItem[];
  conversations: Conversation[];
  onSelectClient: (id: string) => void;
  onEditClient: (client: ClientWebsite) => void;
  onOpenEmbedModal: (client: ClientWebsite) => void;
  onLaunchSandbox: () => void;
  onUpdateLeadStatus: (id: string, status: LeadStatus) => void;
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  onAppointmentBooked: (newApt: AppointmentItem) => void;
  onLeadCaptured: (newLead: LeadItem) => void;
  onBackToWorkspaces: () => void;
}

export const WorkspaceDashboardView: React.FC<WorkspaceDashboardViewProps> = ({
  client,
  allClients,
  leads,
  appointments,
  conversations,
  onSelectClient,
  onEditClient,
  onOpenEmbedModal,
  onLaunchSandbox,
  onUpdateLeadStatus,
  onUpdateAppointmentStatus,
  onAppointmentBooked,
  onLeadCaptured,
  onBackToWorkspaces
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'appointments' | 'settings'>('overview');

  // Filter data strictly for this website workspace
  const clientLeads = leads.filter(l => l.clientId === client.id);
  const clientAppointments = appointments.filter(a => a.clientId === client.id);
  const clientConversations = conversations.filter(c => c.clientId === client.id);

  const newLeadsCount = clientLeads.filter(l => l.status === 'new').length;
  const pendingAppointmentsCount = clientAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;

  const embedSnippet = `<script
  src="https://cdn.receptionai.com/widget.js"
  data-client-id="${client.id}"
  data-theme="${client.widgetTemplate || 'modern_soft'}"
  data-position="${client.widgetPosition}"
  async
></script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="flex-1 bg-slate-100/70 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Workspace Header & Breadcrumbs */}
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top bar with breadcrumb and workspace switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button
              onClick={onBackToWorkspaces}
              className="font-bold text-teal-700 hover:text-teal-900 transition-colors flex items-center gap-1"
            >
              <Building2 className="w-4 h-4" />
              All Workspaces
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: client.primaryColor || '#0d9488' }}
              />
              {client.workspaceName || client.name}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              ID: {client.id}
            </span>
          </div>

          {/* Quick Switch Workspace Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="workspace-switcher" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Switch Workspace:
            </label>
            <select
              id="workspace-switcher"
              value={client.id}
              onChange={(e) => onSelectClient(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {allClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.workspaceName || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workspace Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
            style={{ backgroundColor: client.primaryColor || '#0d9488' }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Active Website Workspace
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-200 uppercase tracking-wider">
                  {client.industry.replace('_', ' ')}
                </span>
                <a
                  href={client.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-300 hover:text-teal-200 transition-colors underline"
                >
                  {client.websiteUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {client.workspaceName || client.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-teal-400" />
                  <span>
                    Assistant: <strong className="text-white">{client.personaName}</strong> ({client.personaRole})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>
                    Theme: <strong className="text-white capitalize">{(client.widgetTemplate || 'modern_soft').replace('_', ' ')}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onLaunchSandbox}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                <MonitorPlay className="w-4 h-4" />
                Live Website Sandbox
              </button>

              <button
                onClick={() => onOpenEmbedModal(client)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-colors flex items-center gap-2"
              >
                <Code2 className="w-4 h-4 text-teal-300" />
                Get Embed Script
              </button>

              <button
                onClick={() => onEditClient(client)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-300" />
                Configure Persona
              </button>
            </div>
          </div>
        </div>

        {/* KPI Metrics Row for this Workspace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Leads</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">{clientLeads.length}</span>
                {newLeadsCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {newLeadsCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Captured via Front Desk</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appointments</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">{clientAppointments.length}</span>
                {pendingAppointmentsCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {pendingAppointmentsCount} active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Booked directly in widget</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Conversations</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">{clientConversations.length}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">24/7 Automated response</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Knowledge Base</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {client.services.length + client.faqItems.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">items</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{client.services.length} services • {client.faqItems.length} FAQs</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Content Split: Left Workspace Details & Leads, Right Live AI Front Desk Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Section: Leads & Appointments for this Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Workspace Overview
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'leads'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Captured Leads</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {clientLeads.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'appointments'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Appointments</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {clientAppointments.length}
                </span>
              </button>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Bookable Services & FAQs Summary */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">Website Bookable Services</h3>
                      <p className="text-xs text-slate-500">
                        Patients &amp; customers can select these directly inside the AI Front Desk widget.
                      </p>
                    </div>
                    <button
                      onClick={() => onEditClient(client)}
                      className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors"
                    >
                      + Edit Services
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {client.services.map((service) => (
                      <div key={service.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{service.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                            {service.durationMinutes} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Installation Embed Script Panel */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-teal-600" />
                        Website Installation Snippet
                      </h3>
                      <p className="text-xs text-slate-500">
                        Copy and paste this snippet right before the closing <code className="bg-slate-100 px-1 py-0.5 rounded-sm">&lt;/body&gt;</code> tag on {client.name}.
                      </p>
                    </div>
                    <button
                      onClick={handleCopySnippet}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {copiedScript ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                    {embedSnippet}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB: LEADS */}
            {activeTab === 'leads' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200/80">
                  <h3 className="font-bold text-slate-900">Leads Captured for {client.name}</h3>
                  <p className="text-xs text-slate-500">
                    Real-time inquiries captured automatically by {client.personaName}.
                  </p>
                </div>

                {clientLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold">No leads captured yet for this website.</p>
                    <p className="text-xs">Try chatting with the assistant on the right to submit a test inquiry!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {clientLeads.map((lead) => (
                      <div key={lead.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{lead.visitorName}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                              lead.status === 'new'
                                ? 'bg-amber-100 text-amber-800'
                                : lead.status === 'contacted'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 flex items-center gap-3">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{lead.email}</span>
                            {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>}
                          </p>
                          {lead.notes && (
                            <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mt-2">
                              &quot;{lead.notes}&quot;
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={lead.status}
                            onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                          >
                            <option value="new">Status: New</option>
                            <option value="contacted">Status: Contacted</option>
                            <option value="closed">Status: Closed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200/80">
                  <h3 className="font-bold text-slate-900">Bookings &amp; Appointments for {client.name}</h3>
                  <p className="text-xs text-slate-500">
                    Appointments scheduled by visitors through the AI Front Desk.
                  </p>
                </div>

                {clientAppointments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold">No appointments booked yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {clientAppointments.map((apt) => (
                      <div key={apt.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{apt.visitorName}</span>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold">
                            {apt.serviceName} • {apt.preferredDate} at {apt.preferredTime}
                          </p>
                          <p className="text-xs text-slate-500">
                            {apt.email} {apt.phone && `• ${apt.phone}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={apt.status}
                            onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                          >
                            <option value="pending">Status: Pending</option>
                            <option value="confirmed">Status: Confirmed</option>
                            <option value="completed">Status: Completed</option>
                            <option value="cancelled">Status: Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive AI Assistant Widget right inside the Workspace Dashboard! */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-slate-900 text-sm">Live Assistant Workspace Test</h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Gemini Online
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Test chatting, asking FAQs, or booking a test appointment for this workspace website right here.
              </p>
            </div>

            {/* Embedded Live FrontDeskWidget in Standalone Card mode */}
            <div className="w-full h-[620px] rounded-2xl shadow-xl overflow-hidden border border-slate-300 bg-white">
              <FrontDeskWidget
                client={client}
                mode="embedded"
                onAppointmentBooked={onAppointmentBooked}
                onLeadCaptured={onLeadCaptured}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
