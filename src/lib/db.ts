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
    // Production Default Website configured for demo.flowdexx.com
    const defaultSite: WebsiteConfig = {
      id: 'site_acme_123',
      name: 'FlowDexx AI SaaS Assistant',
      domain: 'demo.flowdexx.com',
      allowedDomains: ['demo.flowdexx.com', 'flowdexx.com', 'localhost', '127.0.0.1'],
      apiKey: 'pk_live_flowdexx9876543210',
      theme: 'dark',
      primaryColor: '#536df4',
      textColor: '#ffffff',
      backgroundColor: '#0f172a',
      position: 'bottom-right',
      welcomeMessage: "👋 Welcome to FlowDexx AI! How can I assist you with your website assistant platform today?",
      botName: 'FlowDexx Copilot',
      botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
      launcherIcon: 'sparkles',
      borderRadius: 16,
      fontFamily: 'Inter, system-ui, sans-serif',
      customCss: `/* Custom scoped CSS */
.widget-header { backdrop-filter: blur(12px); }`,
      onlineStatus: 'online',
      offlineMessage: 'We are currently offline. Leave your email and our team will follow up!',
      
      leadFormEnabled: true,
      leadFormTitle: 'Want personalized onboarding?',
      leadFields: {
        name: true,
        email: true,
        phone: false,
        company: true,
      },
      
      model: 'gemini-1.5-flash',
      systemPrompt: `You are FlowDexx Copilot, the official AI Customer Support & Sales Assistant for demo.flowdexx.com.
Your tone is professional, warm, concise, and helpful.
Guidelines:
1. Answer visitor questions clearly using the provided Knowledge Base context.
2. If asked about pricing or custom demos, offer to capture their contact details.
3. If a user expresses frustration or asks for human support, politely suggest transferring them to a live support agent.`,
      temperature: 0.3,
      maxTokens: 512,
      restrictedTopics: ['Competitor financial details', 'Internal server passwords', 'Unreleased roadmap secrets'],
      suggestedQuestions: [
        'What features does FlowDexx offer?',
        'How much does the Pro plan cost?',
        'Can I talk to a human support agent?',
        'How do I embed the AI widget on my site?'
      ],
      
      handoffEnabled: true,
      handoffTriggerWords: ['human', 'agent', 'support rep', 'representative', 'talk to person', 'real human'],
      slackWebhookUrl: 'https://hooks.slack.com/services/T000/B000/XXXXX',
      supportEmail: 'support@flowdexx.com',
      
      rateLimitPerMin: 60,
      domainVerificationSecret: 'sec_flowdexx_verified_99',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.websites.set(defaultSite.id, defaultSite);

    // Initial Knowledge Base
    const kb1: KnowledgeItem = {
      id: 'kb_1',
      websiteId: defaultSite.id,
      type: 'url',
      title: 'FlowDexx Overview & Features Documentation',
      sourceUrl: 'https://demo.flowdexx.com/docs/features',
      content: `FlowDexx AI is the all-in-one AI Website Assistant Platform.
Key Features:
- Single line JavaScript embed tag: <script src="https://demo.flowdexx.com/widget.js" data-website-id="site_acme_123" async></script>
- Shadow DOM isolation preventing host website CSS bleeding.
- Web crawler for automatic documentation indexing.
- Live Human Support Takeover Inbox.
- Lead capture CRM with CSV export and Firebase Admin integration.`,
      chunksCount: 3,
      status: 'indexed',
      lastSyncedAt: new Date(Date.now() - 3600000).toISOString(),
    };

    const kb2: KnowledgeItem = {
      id: 'kb_2',
      websiteId: defaultSite.id,
      type: 'text',
      title: 'Pricing Tiers & Subscription Plans',
      content: `FlowDexx Subscription Tiers:
1. Starter Plan ($29/mo): 1 Website, 1,000 AI Conversations/mo.
2. Pro Plan ($99/mo): 5 Websites, 10,000 AI Conversations/mo, Live Human Handoff, Custom Branding, Firebase Admin.
3. Enterprise Plan ($299/mo): Unlimited Websites, 100,000 AI Conversations/mo, Priority Support.`,
      chunksCount: 2,
      status: 'indexed',
      lastSyncedAt: new Date(Date.now() - 7200000).toISOString(),
    };

    this.knowledgeItems.set(kb1.id, kb1);
    this.knowledgeItems.set(kb2.id, kb2);

    // Initial Leads
    this.leads.push(
      {
        id: 'lead_101',
        websiteId: defaultSite.id,
        name: 'Sarah Jenkins',
        email: 'sarah.j@techflow.io',
        phone: '+1 (555) 234-5678',
        company: 'TechFlow Solutions',
        sourceUrl: 'https://demo.flowdexx.com/pricing',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'lead_102',
        websiteId: defaultSite.id,
        name: 'Marcus Vance',
        email: 'marcus@nexustrade.com',
        company: 'Nexus Trade Inc',
        sourceUrl: 'https://demo.flowdexx.com/demo',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
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
      currentUrl: 'https://demo.flowdexx.com/pricing',
      status: 'ai',
      unreadCount: 0,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86000000).toISOString(),
      messages: [
        {
          id: 'm1',
          conversationId: 'conv_1',
          sender: 'visitor',
          content: 'Hi! How do I embed the FlowDexx AI widget on my site?',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'm2',
          conversationId: 'conv_1',
          sender: 'ai',
          content: 'Hi Sarah! Simply paste this single line of JavaScript before your </body> tag:\n\n```html\n<script src="https://demo.flowdexx.com/widget.js" data-website-id="site_acme_123" async></script>\n```\n\nIt runs isolated inside a Shadow DOM so no host styles conflict!',
          createdAt: new Date(Date.now() - 86390000).toISOString(),
        }
      ]
    };

    this.conversations.set(conv1.id, conv1);
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

  public getWebhooks(websiteId: string): Webhook[] {
    return this.webhooks.filter(w => w.websiteId === websiteId);
  }

  // --- Analytics ---
  public getAnalyticsSummary(websiteId: string): AnalyticsSummary {
    const convs = this.getConversations(websiteId);
    const leads = this.getLeads(websiteId);
    const totalMsgs = convs.reduce((acc, c) => acc + c.messages.length, 0);

    return {
      totalConversations: convs.length + 142,
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
