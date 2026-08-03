export type IndustryType = 
  | 'healthcare_dental'
  | 'hospitality_hotel'
  | 'legal_law'
  | 'real_estate'
  | 'saas_tech'
  | 'agency'
  | 'custom';

export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';

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

export type LauncherStyleType = 'circle' | 'pill' | 'avatar' | 'ask_ai_bar' | 'custom_code';

export const DEFAULT_CUSTOM_LAUNCHER_CODE = `<div style="
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #f8fafc;
  padding: 12px 22px;
  border-radius: 9999px;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15);
  cursor: pointer;
">
  <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981;"></span>
  <span>Custom AI Assistant</span>
</div>`;

export type AskAiBarPalette = 
  | 'cyberpunk' 
  | 'emerald_teal' 
  | 'sunset_fire' 
  | 'purple_indigo' 
  | 'brand_match' 
  | 'monochrome';

export type AskAiBarAnimSpeed = 'slow' | 'normal' | 'fast' | 'static';

export interface AskAiBarConfig {
  neonGlow: boolean;
  neonPalette: AskAiBarPalette;
  conicRotation: boolean;
  conicSpeed: AskAiBarAnimSpeed;
  shimmerEffect: boolean;
  shimmerSpeed: AskAiBarAnimSpeed;
}

export const DEFAULT_ASK_AI_BAR_CONFIG: AskAiBarConfig = {
  neonGlow: true,
  neonPalette: 'cyberpunk',
  conicRotation: true,
  conicSpeed: 'normal',
  shimmerEffect: true,
  shimmerSpeed: 'normal',
};

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
  askAiBarConfig?: AskAiBarConfig;
  customLauncherCode?: string;
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

export type AppointmentStatus = 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';

export interface AppointmentItem {
  id: string;
  clientId: string;
  visitorName: string;
  visitorEmail: string;
  email?: string;
  visitorPhone?: string;
  phone?: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  preferredDate?: string;
  time: string; // HH:MM
  preferredTime?: string;
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
