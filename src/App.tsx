/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ClientWebsite, 
  LeadItem, 
  AppointmentItem, 
  Conversation, 
  AnalyticsSummary, 
  LeadStatus, 
  AppointmentStatus 
} from './types';
import { ApiService } from './services/api';
import { Navigation } from './components/Navigation';
import { ClientListView } from './components/clients/ClientListView';
import { ClientEditorModal } from './components/clients/ClientEditorModal';
import { WebsiteSimulator } from './components/embed/WebsiteSimulator';
import { EmbedCodeModal } from './components/embed/EmbedCodeModal';
import { InboxView } from './components/inbox/InboxView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { FrontDeskWidget } from './components/widget/FrontDeskWidget';
import { AuthModal } from './components/auth/AuthModal';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { INITIAL_CLIENTS, INITIAL_ANALYTICS } from './data/initialData';

export default function App() {
  const [clients, setClients] = useState<ClientWebsite[]>(INITIAL_CLIENTS);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(INITIAL_ANALYTICS);

  const [activeTab, setActiveTab] = useState<'clients' | 'sandbox' | 'inbox' | 'analytics'>('clients');
  const [selectedClientId, setSelectedClientId] = useState<string>(INITIAL_CLIENTS[0]?.id || 'cl_apex_dental');

  // Modals state
  const [embedModalClient, setEmbedModalClient] = useState<ClientWebsite | null>(null);
  const [editorModalClient, setEditorModalClient] = useState<ClientWebsite | null | 'new'>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Check if we are being loaded inside an external website's iframe or script (Embedded Widget Standalone Mode)
  const [isEmbeddedMode, setIsEmbeddedMode] = useState<boolean>(false);
  const [embedClientIdParam, setEmbedClientIdParam] = useState<string>('');

  useEffect(() => {
    // Detect URL parameter: ?embed=true&clientId=...
    const query = new URLSearchParams(window.location.search);
    const isEmbed = query.get('embed') === 'true';
    const cid = query.get('clientId') || 'cl_apex_dental';
    if (isEmbed) {
      setIsEmbeddedMode(true);
      setEmbedClientIdParam(cid);
    }

    // Load initial data
    const loadAll = async () => {
      const loadedClients = await ApiService.getClients();
      const loadedLeads = await ApiService.getLeads();
      const loadedAppts = await ApiService.getAppointments();
      const loadedConvs = await ApiService.getConversations();
      const loadedAnalytics = await ApiService.getAnalytics();

      setClients(loadedClients);
      setLeads(loadedLeads);
      setAppointments(loadedAppts);
      setConversations(loadedConvs);
      setAnalytics(loadedAnalytics);

      if (loadedClients.length > 0 && !selectedClientId) {
        setSelectedClientId(loadedClients[0].id);
      }
    };
    loadAll();
  }, []);

  // Handlers for client updates
  const handleSaveClient = async (updatedOrNew: ClientWebsite) => {
    const saved = await ApiService.saveClient(updatedOrNew);
    const all = await ApiService.getClients();
    setClients(all);
    setSelectedClientId(saved.id);
    setEditorModalClient(null);
  };

  const handleDeleteClient = async (id: string) => {
    if (clients.length <= 1) {
      alert('You must have at least one active client website configured.');
      return;
    }
    await ApiService.deleteClient(id);
    const all = await ApiService.getClients();
    setClients(all);
    if (selectedClientId === id && all.length > 0) {
      setSelectedClientId(all[0].id);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: LeadStatus) => {
    await ApiService.updateLeadStatus(id, status);
    const updatedLeads = await ApiService.getLeads();
    setLeads(updatedLeads);
  };

  const handleUpdateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    await ApiService.updateAppointmentStatus(id, status);
    const updatedAppts = await ApiService.getAppointments();
    setAppointments(updatedAppts);
  };

  const handleNewAppointmentBooked = async (newApt: AppointmentItem) => {
    const updatedAppts = await ApiService.getAppointments();
    setAppointments(updatedAppts);
  };

  const handleNewLeadCaptured = async (newLead: LeadItem) => {
    const updatedLeads = await ApiService.getLeads();
    setLeads(updatedLeads);
  };

  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // =========================================================
  // 1. EMBEDDED WIDGET STANDALONE MODE (Served to external sites via iframe/script)
  // =========================================================
  if (isEmbeddedMode) {
    const targetClient = clients.find(c => c.id === embedClientIdParam) || clients[0];
    if (!targetClient) {
      return (
        <div className="p-4 text-center text-xs text-slate-500 font-sans">
          AI Front Desk widget configuration not found.
        </div>
      );
    }
    return (
      <div className="w-full h-full min-h-screen bg-transparent flex items-end justify-end p-2 font-sans">
        <FrontDeskWidget
          client={targetClient}
          mode="floating"
          defaultOpen={true}
          onAppointmentBooked={handleNewAppointmentBooked}
          onLeadCaptured={handleNewLeadCaptured}
        />
      </div>
    );
  }

  // =========================================================
  // 2. MAIN SAAS ADMIN DASHBOARD MODE
  // =========================================================
  const unreadLeadsCount = leads.filter(l => l.status === 'new').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Top SaaS Navigation bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        onNewClient={() => setEditorModalClient('new')}
        onOpenEmbedModal={(client) => setEmbedModalClient(client)}
        unreadLeadsCount={unreadLeadsCount}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'clients' && (
          <ClientListView
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onNewClient={() => setEditorModalClient('new')}
            onEditClient={(client) => setEditorModalClient(client)}
            onDeleteClient={handleDeleteClient}
            onOpenEmbedModal={(client) => setEmbedModalClient(client)}
            onLaunchSandbox={(client) => {
              setSelectedClientId(client.id);
              setActiveTab('sandbox');
            }}
          />
        )}

        {activeTab === 'sandbox' && currentClient && (
          <WebsiteSimulator
            client={currentClient}
            onUpdateClient={handleSaveClient}
            onAppointmentBooked={handleNewAppointmentBooked}
            onLeadCaptured={handleNewLeadCaptured}
          />
        )}

        {activeTab === 'inbox' && (
          <InboxView
            clients={clients}
            leads={leads}
            appointments={appointments}
            conversations={conversations}
            selectedClientId={selectedClientId}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            clients={clients}
          />
        )}
      </main>

      {/* Modal 1: Embed Snippet Generator Modal */}
      {embedModalClient && (
        <EmbedCodeModal
          client={embedModalClient}
          onClose={() => setEmbedModalClient(null)}
          onLaunchSimulator={() => {
            setSelectedClientId(embedModalClient.id);
            setEmbedModalClient(null);
            setActiveTab('sandbox');
          }}
        />
      )}

      {/* Modal 2: Client Editor & Configuration Modal */}
      {editorModalClient !== null && (
        <ClientEditorModal
          client={editorModalClient === 'new' ? null : editorModalClient}
          onClose={() => setEditorModalClient(null)}
          onSave={handleSaveClient}
        />
      )}

      {/* Modal 3: Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

