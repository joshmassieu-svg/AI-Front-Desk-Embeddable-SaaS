export interface WebsiteConfig {
  id: string;
  name: string;
  domain: string;
  allowedDomains: string[];
  apiKey: string;
  theme: 'dark' | 'light' | 'auto';
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  welcomeMessage: string;
  botName: string;
  botAvatar: string;
  launcherIcon: 'chat' | 'sparkles' | 'message' | 'headset';
  launcherStyle?: 'circle' | 'pill' | 'bar' | 'tab';
  launcherText?: string;
  launcherPlaceholder?: string;
  borderRadius: number; // px
  fontFamily: string;
  customCss?: string;
  onlineStatus: 'online' | 'offline' | 'away';
  offlineMessage?: string;
  
  // Lead Capture Config
  leadFormEnabled: boolean;
  leadFormTitle: string;
  leadFields: {
    name: boolean;
    email: boolean;
    phone: boolean;
    company: boolean;
  };
  
  // AI Config
  model: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash';
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  restrictedTopics: string[];
  suggestedQuestions: string[];
  
  // Human Handoff Config
  handoffEnabled: boolean;
  handoffTriggerWords: string[];
  slackWebhookUrl?: string;
  supportEmail?: string;
  
  // Security
  rateLimitPerMin: number;
  domainVerificationSecret: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  websiteId: string;
  type: 'url' | 'file' | 'text';
  title: string;
  sourceUrl?: string;
  fileName?: string;
  content: string;
  chunksCount: number;
  status: 'indexed' | 'processing' | 'error';
  lastSyncedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  knowledgeId: string;
  websiteId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface Lead {
  id: string;
  websiteId: string;
  conversationId?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  sourceUrl?: string;
  customData?: Record<string, string>;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'visitor' | 'ai' | 'agent';
  content: string;
  agentName?: string;
  cards?: {
    title: string;
    description: string;
    imageUrl?: string;
    actionUrl?: string;
    actionText?: string;
  }[];
  sources?: {
    title: string;
    url?: string;
  }[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  websiteId: string;
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorLocation?: string;
  visitorDevice?: string;
  currentUrl?: string;
  status: 'ai' | 'human_requested' | 'human_active' | 'resolved';
  assignedAgent?: string;
  unreadCount?: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  websiteId: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface Webhook {
  id: string;
  websiteId: string;
  url: string;
  secret: string;
  events: ('lead.captured' | 'conversation.started' | 'handoff.requested')[];
  active: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalConversations: number;
  totalMessages: number;
  totalLeads: number;
  resolutionRate: number; // percentage
  csatScore: number; // 0 - 5
  avgResponseTimeSec: number;
  knowledgeCoverage: number; // percentage
  tokenUsage: number;
  activeVisitorsNow: number;
}
