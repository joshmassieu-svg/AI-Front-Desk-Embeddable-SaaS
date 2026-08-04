import { WebsiteConfig, KnowledgeItem, KnowledgeChunk, Lead, Conversation, Message, ApiKey, Webhook, AnalyticsSummary } from './types';

// In-memory persistent database store with initial production-grade seed dataset
class DatabaseStore {
  private websites: Map<string, WebsiteConfig> = new Map();
  private knowledgeItems: Map<string, KnowledgeItem> = new Map();
  private knowledgeChunks: KnowledgeChunk[] = [];
  private leads: Lead[] = [];
  private conversations: Map<string, Conversation> = new Map();
  private apiKeys: ApiKey[] = [];
  private webhooks: Webhook[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Default Website
    const defaultSite: WebsiteConfig = {
      id: 'site_acme_123',
      name: 'Acme SaaS Platform',
      domain: 'acme.com',
      allowedDomains: ['acme.com', 'localhost', '127.0.0.1'],
      apiKey: 'pk_live_acme9876543210',
      theme: 'dark',
      primaryColor: '#536df4',
      textColor: '#ffffff',
      backgroundColor: '#0f172a',
      position: 'bottom-right',
      welcomeMessage: "👋 Hi there! I'm Acme's AI Assistant. How can I help you today?",
      botName: 'Acme Copilot',
      botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
      launcherIcon: 'sparkles',
      borderRadius: 16,
      fontFamily: 'Inter, system-ui, sans-serif',
      customCss: `/* Custom widget override */
.widget-header { backdrop-filter: blur(12px); }`,
      onlineStatus: 'online',
      offlineMessage: 'We are currently offline, but leave your email and our team will get back to you!',
      
      leadFormEnabled: true,
      leadFormTitle: 'Want personalized onboarding?',
      leadFields: {
        name: true,
        email: true,
        phone: false,
        company: true,
      },
      
      model: 'gemini-1.5-flash',
      systemPrompt: `You are Acme Copilot, an expert AI Customer Support & Sales Assistant for Acme SaaS Platform.
Your tone is professional, warm, concise, and helpful.
Guidelines:
1. Answer visitor questions clearly using the provided Knowledge Base context.
2. If asked about pricing or custom demos, offer to capture their contact details.
3. If a user expresses frustration or asks for human support, politely suggest transferring them to a live support agent.
4. Keep answers focused on Acme SaaS products and avoid discussing off-topic politics or religion.`,
      temperature: 0.3,
      maxTokens: 512,
      restrictedTopics: ['Competitor financial details', 'Internal server passwords', 'Unreleased roadmap secrets'],
      suggestedQuestions: [
        'What features does Acme offer?',
        'How much does the Pro plan cost?',
        'Can I talk to a human agent?',
        'How do I embed the AI widget?'
      ],
      
      handoffEnabled: true,
      handoffTriggerWords: ['human', 'agent', 'support rep', 'representative', 'talk to person', 'real human'],
      slackWebhookUrl: 'https://hooks.slack.com/services/T000/B000/XXXXX',
      supportEmail: 'support@acme.com',
      
      rateLimitPerMin: 60,
      domainVerificationSecret: 'sec_acme_verified_99',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.websites.set(defaultSite.id, defaultSite);

    // Initial Knowledge Base
    const kb1: KnowledgeItem = {
      id: 'kb_1',
      websiteId: defaultSite.id,
      type: 'url',
      title: 'Acme Overview & Features Documentation',
      sourceUrl: 'https://acme.com/docs/features',
      content: `Acme SaaS is the all-in-one AI Automation Platform for modern businesses.
Key Features:
- Intelligent Website AI Assistant Widgets with Shadow DOM isolation.
- Automatic website crawling and multi-format document ingestion (PDF, DOCX, TXT, Markdown).
- Streaming responses powered by Google Gemini AI models.
- Live Human Handoff with real-time support inbox.
- Lead capture integration with automatic CSV export and Webhooks.
- Custom branding with visual live preview customizer.`,
      chunksCount: 3,
      status: 'indexed',
      lastSyncedAt: new Date(Date.now() - 3600000).toISOString(),
    };

    const kb2: KnowledgeItem = {
      id: 'kb_2',
      websiteId: defaultSite.id,
      type: 'text',
      title: 'Pricing Tiers & Subscription Plans',
      content: `Acme Subscription Tiers:
1. Starter Plan ($29/mo): Includes 1 Website, 1,000 AI Conversations/mo, 10 Knowledge Base docs, standard lead capture.
2. Pro Plan ($99/mo): Includes 5 Websites, 10,000 AI Conversations/mo, 100 Knowledge Base docs, Live Human Handoff, Custom Branding, Webhooks.
3. Enterprise Plan ($299/mo): Unlimited Websites, 100,000 AI Conversations/mo, Unlimited Knowledge Base, Dedicated SLA, Custom Domain, Priority Slack Support.`,
      chunksCount: 2,
      status: 'indexed',
      lastSyncedAt: new Date(Date.now() - 7200000).toISOString(),
    };

    const kb3: KnowledgeItem = {
      id: 'kb_3',
      websiteId: defaultSite.id,
      type: 'file',
      title: 'JavaScript Embed Integration Guide.pdf',
      fileName: 'Embed-Guide-2026.pdf',
      content: `Installing Acme AI Assistant Widget:
Copy the 1-line script tag from your dashboard embed settings:
<script src="https://platform.acme.com/widget.js" data-website-id="site_acme_123" async></script>
Paste this before the closing </body> tag in any website or app template. Works natively with HTML, React, Next.js, Vue, WordPress, Shopify, Wix, and Webflow.`,
      chunksCount: 2,
      status: 'indexed',
      lastSyncedAt: new Date(Date.now() - 14400000).toISOString(),
    };

    this.knowledgeItems.set(kb1.id, kb1);
    this.knowledgeItems.set(kb2.id, kb2);
    this.knowledgeItems.set(kb3.id, kb3);

    // Initial Leads
    this.leads.push(
      {
        id: 'lead_101',
        websiteId: defaultSite.id,
        name: 'Sarah Jenkins',
        email: 'sarah.j@techflow.io',
        phone: '+1 (555) 234-5678',
        company: 'TechFlow Solutions',
        sourceUrl: 'https://acme.com/pricing',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'lead_102',
        websiteId: defaultSite.id,
        name: 'Marcus Vance',
        email: 'marcus@nexustrade.com',
        phone: '+1 (555) 876-5432',
        company: 'Nexus Trade Inc',
        sourceUrl: 'https://acme.com/demo',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'lead_103',
        websiteId: defaultSite.id,
        name: 'Elena Rostova',
        email: 'elena@cyberpulse.net',
        company: 'CyberPulse AI',
        sourceUrl: 'https://acme.com/features',
        createdAt: new Date(Date.now() - 12000000).toISOString(),
      }
    );

    // Initial Conversations
    const conv1: Conversation = {
      id: 'conv_1',
      websiteId: defaultSite.id,
      visitorId: 'vis_991',
      visitorName: 'Sarah Jenkins',
      visitorEmail: 'sarah.j@techflow.io',
      visitorLocation: 'San Francisco, USA',
      visitorDevice: 'Chrome on macOS',
      currentUrl: 'https://acme.com/pricing',
      status: 'ai',
      unreadCount: 0,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86000000).toISOString(),
      messages: [
        {
          id: 'm1',
          conversationId: 'conv_1',
          sender: 'visitor',
          content: 'Hi! What is included in the Pro Plan?',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'm2',
          conversationId: 'conv_1',
          sender: 'ai',
          content: 'Hello Sarah! The **Pro Plan ($99/mo)** includes:\n- Up to 5 Websites\n- 10,000 AI Conversations/month\n- 100 Knowledge Base docs\n- Live Human Handoff\n- Custom Branding & Webhooks\n\nWould you like me to schedule a demo for your team?',
          createdAt: new Date(Date.now() - 86390000).toISOString(),
        }
      ]
    };

    const conv2: Conversation = {
      id: 'conv_2',
      websiteId: defaultSite.id,
      visitorId: 'vis_992',
      visitorName: 'Marcus Vance',
      visitorEmail: 'marcus@nexustrade.com',
      visitorLocation: 'London, UK',
      visitorDevice: 'Safari on iPhone',
      currentUrl: 'https://acme.com/support',
      status: 'human_requested',
      unreadCount: 1,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
      messages: [
        {
          id: 'm3',
          conversationId: 'conv_2',
          sender: 'visitor',
          content: 'I need to speak to a real human support rep right away about my enterprise billing.',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'm4',
          conversationId: 'conv_2',
          sender: 'ai',
          content: 'I have notified our support team. An agent will take over this chat shortly. Please stand by!',
          createdAt: new Date(Date.now() - 1790000).toISOString(),
        },
        {
          id: 'm5',
          conversationId: 'conv_2',
          sender: 'visitor',
          content: 'Thanks, I am waiting.',
          createdAt: new Date(Date.now() - 300000).toISOString(),
        }
      ]
    };

    this.conversations.set(conv1.id, conv1);
    this.conversations.set(conv2.id, conv2);

    // Initial API Keys
    this.apiKeys.push({
      id: 'key_1',
      websiteId: defaultSite.id,
      name: 'Production Server Key',
      key: 'ak_live_998877665544332211',
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      lastUsedAt: new Date().toISOString(),
    });

    // Initial Webhook
    this.webhooks.push({
      id: 'wh_1',
      websiteId: defaultSite.id,
      url: 'https://api.techflow.io/webhooks/acme-leads',
      secret: 'whsec_secret99887766',
      events: ['lead.captured', 'handoff.requested'],
      active: true,
      createdAt: new Date(Date.now() - 1296000000).toISOString(),
    });
  }

  // --- Website Methods ---
  public getWebsite(id: string): WebsiteConfig | undefined {
    return this.websites.get(id) || Array.from(this.websites.values())[0];
  }

  public getAllWebsites(): WebsiteConfig[] {
    return Array.from(this.websites.values());
  }

  public updateWebsite(id: string, updates: Partial<WebsiteConfig>): WebsiteConfig {
    const existing = this.getWebsite(id);
    if (!existing) throw new Error('Website not found');
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.websites.set(id, updated);
    return updated;
  }

  public createWebsite(site: Omit<WebsiteConfig, 'id' | 'createdAt' | 'updatedAt'>): WebsiteConfig {
    const id = `site_${Date.now()}`;
    const newSite: WebsiteConfig = {
      ...site,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.websites.set(id, newSite);
    return newSite;
  }

  // --- Knowledge Base Methods ---
  public getKnowledgeItems(websiteId: string): KnowledgeItem[] {
    return Array.from(this.knowledgeItems.values()).filter(k => k.websiteId === websiteId);
  }

  public addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'lastSyncedAt'>): KnowledgeItem {
    const id = `kb_${Date.now()}`;
    const newItem: KnowledgeItem = {
      ...item,
      id,
      lastSyncedAt: new Date().toISOString(),
    };
    this.knowledgeItems.set(id, newItem);
    return newItem;
  }

  public deleteKnowledgeItem(id: string): boolean {
    return this.knowledgeItems.delete(id);
  }

  // --- Leads Methods ---
  public getLeads(websiteId: string): Lead[] {
    return this.leads.filter(l => l.websiteId === websiteId);
  }

  public addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    return newLead;
  }

  // --- Conversations & Live Handoff Methods ---
  public getConversations(websiteId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(c => c.websiteId === websiteId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  public createOrGetConversation(websiteId: string, visitorId: string, metadata?: Partial<Conversation>): Conversation {
    const existing = Array.from(this.conversations.values()).find(
      c => c.websiteId === websiteId && c.visitorId === visitorId
    );
    if (existing) return existing;

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      websiteId,
      visitorId,
      visitorDevice: metadata?.visitorDevice || 'Web Browser',
      visitorLocation: metadata?.visitorLocation || 'Online Visitor',
      currentUrl: metadata?.currentUrl || '',
      status: 'ai',
      unreadCount: 0,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(newConv.id, newConv);
    return newConv;
  }

  public addMessage(conversationId: string, msg: Omit<Message, 'id' | 'createdAt'>): Message {
    const conv = this.conversations.get(conversationId);
    const newMsg: Message = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    if (conv) {
      conv.messages.push(newMsg);
      conv.updatedAt = newMsg.createdAt;
      if (msg.sender === 'visitor' && conv.status === 'human_active') {
        conv.unreadCount = (conv.unreadCount || 0) + 1;
      }
      this.conversations.set(conversationId, conv);
    }
    return newMsg;
  }

  public updateConversationStatus(id: string, status: Conversation['status'], assignedAgent?: string): Conversation | undefined {
    const conv = this.conversations.get(id);
    if (conv) {
      conv.status = status;
      if (assignedAgent !== undefined) conv.assignedAgent = assignedAgent;
      conv.unreadCount = 0;
      conv.updatedAt = new Date().toISOString();
      this.conversations.set(id, conv);
    }
    return conv;
  }

  // --- API Keys & Webhooks ---
  public getApiKeys(websiteId: string): ApiKey[] {
    return this.apiKeys.filter(k => k.websiteId === websiteId);
  }

  public createApiKey(websiteId: string, name: string): ApiKey {
    const key: ApiKey = {
      id: `key_${Date.now()}`,
      websiteId,
      name,
      key: `ak_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
    };
    this.apiKeys.push(key);
    return key;
  }

  public getWebhooks(websiteId: string): Webhook[] {
    return this.webhooks.filter(w => w.websiteId === websiteId);
  }

  public addWebhook(websiteId: string, url: string, events: Webhook['events']): Webhook {
    const wh: Webhook = {
      id: `wh_${Date.now()}`,
      websiteId,
      url,
      secret: `whsec_${Math.random().toString(36).substring(2)}`,
      events,
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.webhooks.push(wh);
    return wh;
  }

  // --- Analytics ---
  public getAnalyticsSummary(websiteId: string): AnalyticsSummary {
    const convs = this.getConversations(websiteId);
    const leads = this.getLeads(websiteId);
    const totalMsgs = convs.reduce((acc, c) => acc + c.messages.length, 0);

    return {
      totalConversations: convs.length + 142, // Adding seeded metrics
      totalMessages: totalMsgs + 890,
      totalLeads: leads.length + 38,
      resolutionRate: 94.2,
      csatScore: 4.8,
      avgResponseTimeSec: 1.2,
      knowledgeCoverage: 88.5,
      tokenUsage: 142850,
      activeVisitorsNow: 14,
    };
  }
}

// Global singleton instance
export const db = new DatabaseStore();
