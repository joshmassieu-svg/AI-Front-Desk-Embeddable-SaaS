export type IndustryType = 
  | 'healthcare_dental'
  | 'hospitality_hotel'
  | 'legal_law'
  | 'real_estate'
  | 'saas_tech'
  | 'agency'
  | 'custom';

export type WidgetPosition = 'bottom-right' | 'bottom-left';

export interface ServiceItem {
  id: string;
  name: string;
  durationMinutes: number;
  price?: string;
  description: string;
  category?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface AppointmentSettings {
  enabled: boolean;
  businessHours: {
    start: string; // e.g. "08:00"
    end: string;   // e.g. "17:30"
    daysOfWeek: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
  };
  slotDurationMinutes: number;
  requirePhone: boolean;
  requireReason: boolean;
  confirmationMessage: string;
}

export type WidgetTemplateType = 
  | 'modern_soft'
  | 'executive_clean'
  | 'friendly_rounded'
  | 'dark_minimal'
  | 'glass_morphism';

export type LauncherStyleType = 'circle' | 'pill' | 'avatar';

export interface ClientWebsite {
  id: string;
  name: string;
  workspaceName?: string;
  industry: IndustryType;
  websiteUrl: string;
  logoText: string;
  avatarUrl?: string;
  primaryColor: string; // Hex color
  secondaryColor: string;
  widgetPosition: WidgetPosition;
  widgetTemplate?: WidgetTemplateType;
  launcherStyle?: LauncherStyleType;
  widgetRadius?: 'rounded-none' | 'rounded-lg' | 'rounded-2xl' | 'rounded-3xl';
  widgetTitle: string;
  personaName: string;
  personaRole: string;
  welcomeMessage: string;
  quickQuestions: string[];
  systemPrompt: string;
  knowledgeBase: string;
  unstructuredKnowledge?: string;
  faqItems: FaqItem[];
  services: ServiceItem[];
  appointmentSettings: AppointmentSettings;
  enableSoundEffects: boolean;
  enableLeadCapture: boolean;
  createdAt: string;
}

export type ChatMessageSender = 'user' | 'assistant' | 'system';

export interface StructuredMessageData {
  type: 'appointment_proposal' | 'lead_form' | 'booking_confirmation' | 'faq_suggestion' | 'service_card';
  payload?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: ChatMessageSender;
  text: string;
  timestamp: string;
  structuredData?: StructuredMessageData;
}

export type ConversationStatus = 
  | 'active'
  | 'lead_captured'
  | 'appointment_booked'
  | 'support_needed'
  | 'closed';

export interface Conversation {
  id: string;
  clientId: string;
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  status: ConversationStatus;
  summary: string;
  lastActive: string;
  messages: ChatMessage[];
  tags: string[];
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'booked' | 'archived';

export interface LeadItem {
  id: string;
  clientId: string;
  visitorName: string;
  email: string;
  phone?: string;
  reasonOrInquiry: string;
  status: LeadStatus;
  sourcePage: string;
  createdAt: string;
  notes?: string;
  conversationId?: string;
}

export type AppointmentStatus = 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';

export interface AppointmentItem {
  id: string;
  clientId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  conversationId?: string;
}

export interface AnalyticsSummary {
  totalEmbedLoads: number;
  totalConversations: number;
  totalLeadsCaptured: number;
  totalAppointmentsBooked: number;
  conversionRatePercent: number;
  avgResponseTimeSeconds: number;
  topQuestions: { question: string; count: number; category: string }[];
  clientStats: {
    clientId: string;
    clientName: string;
    conversations: number;
    leads: number;
    appointments: number;
  }[];
}

export interface EmbedTestOptions {
  mode: 'floating' | 'inline';
  simulatedDevice: 'desktop' | 'tablet' | 'mobile';
  showConfigDrawer: boolean;
}
