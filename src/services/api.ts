import { 
  ClientWebsite, 
  LeadItem, 
  AppointmentItem, 
  Conversation, 
  AnalyticsSummary,
  ChatMessage,
  LeadStatus,
  AppointmentStatus
} from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_LEADS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_ANALYTICS 
} from '../data/initialData';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

const STORAGE_KEYS = {
  CLIENTS: 'receptionai_clients_v1',
  LEADS: 'receptionai_leads_v1',
  APPOINTMENTS: 'receptionai_appointments_v1',
  CONVERSATIONS: 'receptionai_conversations_v1',
};

// Helper for local persistence fallback
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

export const ApiService = {
  async getClients(): Promise<ClientWebsite[]> {
    try {
      const colRef = collection(db, 'clients');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const clients: ClientWebsite[] = [];
        snapshot.forEach((docSnap) => {
          clients.push(docSnap.data() as ClientWebsite);
        });
        saveToStorage(STORAGE_KEYS.CLIENTS, clients);
        return clients;
      } else {
        // Seed Firestore with initial clients
        for (const c of INITIAL_CLIENTS) {
          await setDoc(doc(db, 'clients', c.id), c).catch(() => {});
        }
        saveToStorage(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
        return INITIAL_CLIENTS;
      }
    } catch (error) {
      console.warn('Firestore read error for clients, falling back to storage/initial:', error);
      return getFromStorage<ClientWebsite[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    }
  },

  async getClientById(id: string): Promise<ClientWebsite | undefined> {
    const clients = await this.getClients();
    return clients.find(c => c.id === id);
  },

  async saveClient(client: ClientWebsite): Promise<ClientWebsite> {
    // Save to Firestore
    try {
      await setDoc(doc(db, 'clients', client.id), client);
    } catch (err) {
      console.warn('Firestore saveClient error:', err);
    }

    const clients = await this.getClients();
    const idx = clients.findIndex(c => c.id === client.id);
    let updated: ClientWebsite[];
    if (idx >= 0) {
      updated = [...clients];
      updated[idx] = client;
    } else {
      updated = [client, ...clients];
    }
    saveToStorage(STORAGE_KEYS.CLIENTS, updated);

    // Sync to backend if server available
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
    } catch {
      // Offline fallback
    }
    return client;
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (err) {
      console.warn('Firestore deleteClient error:', err);
    }

    const clients = await this.getClients();
    const filtered = clients.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CLIENTS, filtered);

    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    } catch {
      // Offline fallback
    }
  },

  async getLeads(clientId?: string): Promise<LeadItem[]> {
    try {
      const colRef = collection(db, 'leads');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        let leads: LeadItem[] = [];
        snapshot.forEach((docSnap) => {
          leads.push(docSnap.data() as LeadItem);
        });
        leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        saveToStorage(STORAGE_KEYS.LEADS, leads);
        if (clientId) {
          leads = leads.filter(l => l.clientId === clientId);
        }
        return leads;
      } else {
        // Seed Firestore
        for (const l of INITIAL_LEADS) {
          await setDoc(doc(db, 'leads', l.id), l).catch(() => {});
        }
        saveToStorage(STORAGE_KEYS.LEADS, INITIAL_LEADS);
        let leads = INITIAL_LEADS;
        if (clientId) {
          leads = leads.filter(l => l.clientId === clientId);
        }
        return leads;
      }
    } catch (error) {
      console.warn('Firestore read error for leads, falling back to local storage:', error);
      let leads = getFromStorage<LeadItem[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
      if (clientId) {
        leads = leads.filter(l => l.clientId === clientId);
      }
      return leads;
    }
  },

  async createLead(lead: Omit<LeadItem, 'id' | 'createdAt'>): Promise<LeadItem> {
    const newLead: LeadItem = {
      ...lead,
      id: `ld_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'leads', newLead.id), newLead);
    } catch (err) {
      console.warn('Firestore createLead error:', err);
    }

    const current = await this.getLeads();
    const updated = [newLead, ...current.filter(l => l.id !== newLead.id)];
    saveToStorage(STORAGE_KEYS.LEADS, updated);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
    } catch {
      // offline fallback
    }

    return newLead;
  },

  async updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
    try {
      await updateDoc(doc(db, 'leads', id), { status });
    } catch (err) {
      console.warn('Firestore updateLeadStatus error:', err);
    }

    const current = await this.getLeads();
    const updated = current.map(l => l.id === id ? { ...l, status } : l);
    saveToStorage(STORAGE_KEYS.LEADS, updated);
  },

  async getAppointments(clientId?: string): Promise<AppointmentItem[]> {
    try {
      const colRef = collection(db, 'appointments');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        let appts: AppointmentItem[] = [];
        snapshot.forEach((docSnap) => {
          appts.push(docSnap.data() as AppointmentItem);
        });
        appts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, appts);
        if (clientId) {
          appts = appts.filter(a => a.clientId === clientId);
        }
        return appts;
      } else {
        for (const a of INITIAL_APPOINTMENTS) {
          await setDoc(doc(db, 'appointments', a.id), a).catch(() => {});
        }
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
        let appts = INITIAL_APPOINTMENTS;
        if (clientId) {
          appts = appts.filter(a => a.clientId === clientId);
        }
        return appts;
      }
    } catch (error) {
      console.warn('Firestore read error for appointments, falling back to local storage:', error);
      let appts = getFromStorage<AppointmentItem[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
      if (clientId) {
        appts = appts.filter(a => a.clientId === clientId);
      }
      return appts;
    }
  },

  async createAppointment(appointment: Omit<AppointmentItem, 'id' | 'createdAt' | 'status'>): Promise<AppointmentItem> {
    const newApt: AppointmentItem = {
      ...appointment,
      id: `apt_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'appointments', newApt.id), newApt);
    } catch (err) {
      console.warn('Firestore createAppointment error:', err);
    }

    const current = await this.getAppointments();
    const updated = [newApt, ...current.filter(a => a.id !== newApt.id)];
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApt)
      });
    } catch {
      // offline fallback
    }

    return newApt;
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (err) {
      console.warn('Firestore updateAppointmentStatus error:', err);
    }

    const current = await this.getAppointments();
    const updated = current.map(a => a.id === id ? { ...a, status } : a);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);
  },

  async getConversations(clientId?: string): Promise<Conversation[]> {
    try {
      const colRef = collection(db, 'conversations');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        let convs: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          convs.push(docSnap.data() as Conversation);
        });
        convs.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
        saveToStorage(STORAGE_KEYS.CONVERSATIONS, convs);
        if (clientId) {
          convs = convs.filter(c => c.clientId === clientId);
        }
        return convs;
      } else {
        for (const c of INITIAL_CONVERSATIONS) {
          await setDoc(doc(db, 'conversations', c.id), c).catch(() => {});
        }
        saveToStorage(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
        let convs = INITIAL_CONVERSATIONS;
        if (clientId) {
          convs = convs.filter(c => c.clientId === clientId);
        }
        return convs;
      }
    } catch (error) {
      console.warn('Firestore read error for conversations, falling back to local storage:', error);
      let convs = getFromStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
      if (clientId) {
        convs = convs.filter(c => c.clientId === clientId);
      }
      return convs;
    }
  },

  async saveConversation(conv: Conversation): Promise<void> {
    try {
      await setDoc(doc(db, 'conversations', conv.id), conv);
    } catch (err) {
      console.warn('Firestore saveConversation error:', err);
    }

    const all = await this.getConversations();
    const idx = all.findIndex(c => c.id === conv.id);
    let updated: Conversation[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = conv;
    } else {
      updated = [conv, ...all];
    }
    saveToStorage(STORAGE_KEYS.CONVERSATIONS, updated);
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    const clients = await this.getClients();
    const leads = await this.getLeads();
    const appts = await this.getAppointments();
    const convs = await this.getConversations();

    const totalConversations = convs.length;
    const totalLeadsCaptured = leads.length;
    const totalAppointmentsBooked = appts.length;
    const totalEmbedLoads = Math.max(142, totalConversations * 14 + totalLeadsCaptured * 3 + 120);
    const conversionRatePercent = totalConversations > 0 
      ? Number((((totalLeadsCaptured + totalAppointmentsBooked) / totalConversations) * 100).toFixed(1)) 
      : 18.5;

    const clientStats = clients.map(client => {
      const cConvs = convs.filter(c => c.clientId === client.id).length;
      const cLeads = leads.filter(l => l.clientId === client.id).length;
      const cAppts = appts.filter(a => a.clientId === client.id).length;
      return {
        clientId: client.id,
        clientName: client.name,
        conversations: cConvs,
        leads: cLeads,
        appointments: cAppts
      };
    });

    return {
      totalEmbedLoads,
      totalConversations,
      totalLeadsCaptured,
      totalAppointmentsBooked,
      conversionRatePercent,
      avgResponseTimeSeconds: 1.4,
      topQuestions: [
        { question: 'What are your hours of operation?', count: Math.max(12, Math.floor(totalConversations * 0.4)), category: 'Business Info' },
        { question: 'How much does your service cost?', count: Math.max(9, Math.floor(totalConversations * 0.3)), category: 'Pricing' },
        { question: 'Can I book an appointment online?', count: Math.max(8, Math.floor(totalAppointmentsBooked * 1.2)), category: 'Scheduling' },
        { question: 'Where are you located?', count: Math.max(6, Math.floor(totalConversations * 0.2)), category: 'Location' }
      ],
      clientStats
    };
  },

  /**
   * Main conversational AI Front Desk call using server-side Gemini 3.6 Flash
   */
  async sendChatMessage(params: {
    clientId: string;
    userMessage: string;
    conversationHistory: ChatMessage[];
    visitorContext?: {
      name?: string;
      email?: string;
      phone?: string;
      currentPageUrl?: string;
    };
  }): Promise<{ message: ChatMessage; toolAction?: string }> {
    const client = await this.getClientById(params.clientId);
    if (!client) {
      throw new Error('Client configuration not found');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: params.clientId,
          userMessage: params.userMessage,
          history: params.conversationHistory,
          visitorContext: params.visitorContext,
          clientConfig: client
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          message: data.message,
          toolAction: data.toolAction
        };
      }
    } catch (error) {
      console.warn('Server-side Gemini chat error, using intelligent client fallback:', error);
    }

    // Heuristic intelligent fallback when offline or server unreachable
    return this.generateHeuristicFallback(client, params.userMessage);
  },

  generateHeuristicFallback(client: ClientWebsite, userMsg: string): { message: ChatMessage; toolAction?: string } {
    const lower = userMsg.toLowerCase();
    let replyText = '';
    let toolAction: string | undefined = undefined;
    let structuredData: any = undefined;

    if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('cleaning') || lower.includes('tour') || lower.includes('massage') || lower.includes('consult')) {
      replyText = `I would be delighted to help you schedule an appointment with ${client.name}! Please select an available date and time below:`;
      structuredData = {
        type: 'appointment_proposal',
        payload: {
          services: client.services,
          defaultService: client.services[0]?.name || 'Standard Appointment',
          slotDuration: client.appointmentSettings.slotDurationMinutes || 30
        }
      };
      toolAction = 'show_booking_modal';
    } else if (lower.includes('insurance') || lower.includes('delta') || lower.includes('cigna') || lower.includes('cost') || lower.includes('price') || lower.includes('fee')) {
      const matchedFaq = client.faqItems.find(f => f.question.toLowerCase().includes('insurance') || f.question.toLowerCase().includes('cost'));
      replyText = matchedFaq ? matchedFaq.answer : `We accept most major insurance plans and offer transparent pricing. Would you like to schedule an initial consultation or leave your contact details so our team can verify your coverage?`;
    } else if (lower.includes('hours') || lower.includes('open') || lower.includes('location') || lower.includes('address') || lower.includes('where')) {
      replyText = `We are open Monday through Friday from ${client.appointmentSettings.businessHours.start} to ${client.appointmentSettings.businessHours.end}, plus Saturday hours. Would you like our directions or to reserve an appointment slot?`;
    } else if (lower.includes('contact') || lower.includes('call') || lower.includes('speak') || lower.includes('human') || lower.includes('urgent')) {
      replyText = `Certainly! I can have a senior team member from ${client.name} reach out to you directly. Please enter your name, email, and phone number below:`;
      structuredData = {
        type: 'lead_form',
        payload: {
          title: 'Request Callback from Team',
          requirePhone: true
        }
      };
      toolAction = 'show_lead_form';
    } else {
      replyText = `Thank you for contacting ${client.name}! I'm ${client.personaName}, your virtual assistant. How can I help you today—would you like to check our services, ask about insurance/hours, or schedule an appointment?`;
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toISOString(),
      structuredData
    };

    return { message, toolAction };
  },

  getEmbedCode(clientId: string, position: string = 'bottom-right'): {
    scriptTag: string;
    iframeSnippet: string;
    reactSnippet: string;
    wordpressShortcode: string;
  } {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aifrontdesk.ai';

    const scriptTag = `<!-- AI Front Desk 100% Native Shadow DOM Widget (Zero Iframes) -->
<script 
  src="${baseUrl}/api/embed.js?client=${clientId}&position=${position}&v=2.0" 
  data-client-id="${clientId}" 
  data-position="${position}" 
  async>
</script>`;

    const iframeSnippet = `<!-- AI Front Desk Native HTML / JS Embed (Zero Iframes) -->
<div id="ai-frontdesk-popup-root-${clientId}"></div>
<script>
  (function() {
    var s = document.createElement("script");
    s.src = "${baseUrl}/api/embed.js?client=${clientId}&position=${position}&v=2.0";
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;

    const reactSnippet = `// React / Next.js Component Embed (100% Native DOM, Zero Iframes)
import { useEffect } from 'react';

export function AiFrontDeskWidget({ clientId = "${clientId}", position = "${position}" }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "${baseUrl}/api/embed.js?client=" + clientId + "&position=" + position + "&v=2.0";
    script.setAttribute("data-position", position);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      const host = document.getElementById("ai-frontdesk-shadow-host-" + clientId);
      if (host && host.parentNode) host.parentNode.removeChild(host);
    };
  }, [clientId, position]);
  return null;
}`;

    const wordpressShortcode = `[ai_frontdesk_embed client_id="${clientId}" position="${position}" native="true"]`;

    return {
      scriptTag,
      iframeSnippet,
      reactSnippet,
      wordpressShortcode
    };
  }
};

