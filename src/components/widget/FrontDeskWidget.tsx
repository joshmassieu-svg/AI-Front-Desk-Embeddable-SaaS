import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Minimize2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User, 
  PhoneCall, 
  Mail, 
  Building2, 
  HelpCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { 
  ClientWebsite, 
  ChatMessage, 
  ServiceItem, 
  AppointmentItem, 
  LeadItem,
  DEFAULT_ASK_AI_BAR_CONFIG,
  AskAiBarConfig,
  DEFAULT_CUSTOM_LAUNCHER_CODE
} from '../../types';
import { ApiService } from '../../services/api';

interface FrontDeskWidgetProps {
  client: ClientWebsite;
  mode?: 'floating' | 'inline';
  onClose?: () => void;
  onAppointmentBooked?: (appointment: AppointmentItem) => void;
  onLeadCaptured?: (lead: LeadItem) => void;
  defaultOpen?: boolean;
}

const getAskAiBarPaletteStyles = (palette: string = 'cyberpunk', primaryColor: string = '#0d9488') => {
  switch (palette) {
    case 'emerald_teal':
      return {
        outerGradientClass: 'from-emerald-400 via-teal-500 via-cyan-500 to-emerald-400',
        conicGradientStyle: {
          backgroundImage: 'conic-gradient(from 0deg, #10b981, #14b8a6, #06b6d4, #0d9488, #10b981)'
        }
      };
    case 'sunset_fire':
      return {
        outerGradientClass: 'from-amber-400 via-orange-500 via-rose-500 via-purple-500 to-amber-400',
        conicGradientStyle: {
          backgroundImage: 'conic-gradient(from 0deg, #f59e0b, #f97316, #e11d48, #8b5cf6, #f59e0b)'
        }
      };
    case 'purple_indigo':
      return {
        outerGradientClass: 'from-indigo-500 via-purple-500 via-pink-500 via-violet-500 to-indigo-500',
        conicGradientStyle: {
          backgroundImage: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #7c3aed, #6366f1)'
        }
      };
    case 'monochrome':
      return {
        outerGradientClass: 'from-slate-300 via-slate-500 via-slate-700 to-slate-300',
        conicGradientStyle: {
          backgroundImage: 'conic-gradient(from 0deg, #cbd5e1, #64748b, #334155, #cbd5e1)'
        }
      };
    case 'brand_match':
      return {
        outerGradientClass: 'from-white/40 via-teal-400/80 to-white/40',
        conicGradientStyle: {
          backgroundImage: `conic-gradient(from 0deg, ${primaryColor}, #ffffff, ${primaryColor}, #3b82f6, ${primaryColor})`
        }
      };
    case 'cyberpunk':
    default:
      return {
        outerGradientClass: 'from-teal-500 via-indigo-500 via-purple-500 via-pink-500 to-teal-500',
        conicGradientStyle: {
          backgroundImage: 'conic-gradient(from 0deg, #0d9488, #3b82f6, #8b5cf6, #ec4899, #f43f5e, #f97316, #10b981, #0d9488)'
        }
      };
  }
};

const getSpeedClass = (type: 'conic' | 'neon' | 'shimmer', speed: string = 'normal', enabled: boolean = true) => {
  if (!enabled || speed === 'static') return '';
  if (type === 'conic') {
    if (speed === 'slow') return 'animate-conic-spin-slow';
    if (speed === 'fast') return 'animate-conic-spin-fast';
    return 'animate-conic-spin';
  }
  if (type === 'neon') {
    if (speed === 'slow') return 'animate-neon-glow-slow';
    if (speed === 'fast') return 'animate-neon-glow-fast';
    return 'animate-neon-glow';
  }
  if (type === 'shimmer') {
    if (speed === 'slow') return 'animate-shimmer-sweep-slow';
    if (speed === 'fast') return 'animate-shimmer-sweep-fast';
    return 'animate-shimmer-sweep';
  }
  return '';
};

// Simple Web Audio chime for welcoming feedback
function playSoftChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore autoplay or audio policy restrictions
  }
}

export const FrontDeskWidget: React.FC<FrontDeskWidgetProps> = ({
  client,
  mode = 'floating',
  onClose,
  onAppointmentBooked,
  onLeadCaptured,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(mode === 'inline' || defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(client.enableSoundEffects ?? true);
  const [hasUnread, setHasUnread] = useState(true);
  const [askAiBarInput, setAskAiBarInput] = useState('');

  // Booking Card state
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    client.services?.[0] || null
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [leadReason, setLeadReason] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Welcome Message
  useEffect(() => {
    const initialMsg: ChatMessage = {
      id: `welcome_${client.id}`,
      sender: 'assistant',
      text: client.welcomeMessage || `Hello! I am ${client.personaName}, your virtual assistant. How can I assist you today?`,
      timestamp: new Date().toISOString()
    };
    setMessages([initialMsg]);
  }, [client.id, client.welcomeMessage, client.personaName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    try {
      window.parent.postMessage({
        type: 'AIFRONTDESK_RESIZE',
        isOpen,
        clientId: client.id
      }, '*');
    } catch (e) {}
  }, [isOpen, client.id]);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setHasUnread(false);
      if (soundEnabled) {
        playSoftChime();
      }
    }
  };

  const handleAskAiBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toggleOpen();
    if (askAiBarInput.trim()) {
      handleSendMessage(askAiBarInput);
      setAskAiBarInput('');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const { message: aiReply } = await ApiService.sendChatMessage({
        clientId: client.id,
        userMessage: text,
        conversationHistory: newHistory,
        visitorContext: {
          name: visitorName,
          email: visitorEmail,
          phone: visitorPhone
        }
      });

      setIsTyping(false);
      setMessages(prev => [...prev, aiReply]);
      if (soundEnabled && isOpen) {
        playSoftChime();
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `I'm here to help! Feel free to ask about our hours, insurance/pricing, or schedule an appointment below.`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !visitorName || !visitorEmail) return;

    const newApt = await ApiService.createAppointment({
      clientId: client.id,
      visitorName,
      visitorEmail,
      visitorPhone,
      serviceName: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      durationMinutes: selectedService.durationMinutes,
      notes: `Booked via FrontDesk AI widget on ${client.name}`
    });

    if (onAppointmentBooked) {
      onAppointmentBooked(newApt);
    }

    const confirmMsg: ChatMessage = {
      id: `conf_${Date.now()}`,
      sender: 'assistant',
      text: `Wonderful! Your appointment for **${selectedService.name}** has been confirmed for **${selectedDate} at ${selectedTime}**. We look forward to welcoming you, ${visitorName}!`,
      timestamp: new Date().toISOString(),
      structuredData: {
        type: 'booking_confirmation',
        payload: {
          serviceName: selectedService.name,
          date: selectedDate,
          time: selectedTime,
          visitorName,
          status: 'Confirmed'
        }
      }
    };

    setMessages(prev => [...prev, confirmMsg]);
    if (soundEnabled) playSoftChime();
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorEmail) return;

    const newLead = await ApiService.createLead({
      clientId: client.id,
      visitorName,
      email: visitorEmail,
      phone: visitorPhone,
      reasonOrInquiry: leadReason || 'Callback requested via AI Front Desk widget',
      status: 'new',
      sourcePage: client.websiteUrl,
      notes: 'Captured via interactive lead form'
    });

    if (onLeadCaptured) {
      onLeadCaptured(newLead);
    }

    const leadReplyMsg: ChatMessage = {
      id: `ldack_${Date.now()}`,
      sender: 'assistant',
      text: `Thank you, ${visitorName}! Your inquiry has been securely sent to the team at ${client.name}. A senior team member will reach out to ${visitorEmail} or ${visitorPhone || 'your contact number'} shortly.`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, leadReplyMsg]);
    setLeadReason('');
    if (soundEnabled) playSoftChime();
  };

  // Custom theme colors style
  const tpl = client.widgetTemplate || 'modern_soft';
  const radiusClass = client.widgetRadius || 'rounded-2xl';

  const headerStyle = {
    backgroundColor:
      tpl === 'dark_minimal'
        ? '#0f172a'
        : tpl === 'executive_clean'
        ? '#1e293b'
        : client.primaryColor || '#0d9488',
    color: '#ffffff'
  };

  const bubbleStyle = {
    backgroundColor: client.primaryColor || '#0d9488',
    color: '#ffffff'
  };

  // 1. Floating Bubble Button (if mode === 'floating' and !isOpen)
  if (mode === 'floating' && !isOpen) {
    const launcher = client.launcherStyle || 'pill';
    return (
      <div
        className={`fixed bottom-3 ${
          client.widgetPosition === 'bottom-left'
            ? 'left-3'
            : client.widgetPosition === 'bottom-center'
            ? 'left-1/2 -translate-x-1/2'
            : 'right-3'
        } z-50 flex items-center justify-center`}
      >
        {launcher === 'ask_ai_bar' ? (() => {
          const cfg = client.askAiBarConfig || DEFAULT_ASK_AI_BAR_CONFIG;
          const paletteStyles = getAskAiBarPaletteStyles(cfg.neonPalette, client.primaryColor);
          const neonClass = getSpeedClass('neon', cfg.conicSpeed, cfg.neonGlow);
          const conicClass = getSpeedClass('conic', cfg.conicSpeed, cfg.conicRotation);
          const shimmerClass = getSpeedClass('shimmer', cfg.shimmerSpeed, cfg.shimmerEffect);

          return (
            <div className={`relative group ${neonClass}`}>
              {/* 1. Gradient Border / Neon Glow: Multi-color shifting edge that mimics futuristic neon */}
              {cfg.neonGlow && (
                <div className={`absolute -inset-1.5 bg-gradient-to-r ${paletteStyles.outerGradientClass} rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition-all duration-500 -z-10`} />
              )}

              {/* 2. Conic Gradient Rotation: Infinite spinning color loop */}
              <div className="relative p-[2.5px] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
                <div 
                  className={`absolute -inset-[100%] ${conicClass} opacity-95 group-hover:opacity-100 transition-all duration-500`}
                  style={paletteStyles.conicGradientStyle}
                />

                {/* Inner Search Bar Form */}
                <form
                  onSubmit={handleAskAiBarSubmit}
                  className="relative z-10 w-[290px] sm:w-[380px] bg-slate-950/95 backdrop-blur-xl rounded-[13.5px] p-2 flex items-center gap-2 overflow-hidden"
                >
                  {/* 3. Micro-interaction / Shimmer: Subtle light beam sweeping across to signal active AI */}
                  {cfg.shimmerEffect && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[13.5px]">
                      <div className={`absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent ${shimmerClass}`} />
                    </div>
                  )}

                  {/* Left AI Assistant Icon Button with Active Pulse */}
                  <button
                    type="button"
                    onClick={toggleOpen}
                    style={{ backgroundColor: client.primaryColor || '#0d9488' }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all duration-300 group-hover:scale-105 relative border border-white/20"
                    aria-label="Open AI Assistant"
                  >
                    <Sparkles className="w-4 h-4 text-white animate-ai-signal" />
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                    )}
                  </button>

                  {/* Input with AI Active Signal & Typing State */}
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      value={askAiBarInput}
                      onChange={(e) => setAskAiBarInput(e.target.value)}
                      placeholder={`Ask AI about ${client.name || 'us'}...`}
                      className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-slate-100 placeholder-slate-400 font-medium px-2 pr-20"
                    />
                    {/* Micro-interaction: Active AI Signal Indicator */}
                    <div className="absolute right-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/40 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                      <span className="text-[9px] font-mono font-bold tracking-wider text-teal-300 uppercase">
                        AI READY
                      </span>
                    </div>
                  </div>

                  {/* Submit / Ask AI Button */}
                  <button
                    type="submit"
                    style={{ backgroundColor: client.primaryColor || '#0d9488' }}
                    className="px-3.5 py-2 rounded-xl font-bold text-xs text-white shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0 border border-white/20 group-hover:shadow-lg"
                  >
                    <span>Ask AI</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>
              </div>
            </div>
          );
        })() : launcher === 'custom_code' ? (
          <div
            onClick={toggleOpen}
            className="cursor-pointer transition-transform hover:scale-105"
            dangerouslySetInnerHTML={{ __html: client.customLauncherCode || DEFAULT_CUSTOM_LAUNCHER_CODE }}
          />
        ) : launcher === 'pill' ? (
          <button
            onClick={toggleOpen}
            style={bubbleStyle}
            className="px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-sm transition-all duration-300 hover:scale-105 focus:outline-hidden group relative border border-white/20"
            aria-label="Open AI Front Desk Assistant"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <span>{client.widgetTitle || client.personaName}</span>
            {hasUnread && (
              <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse border border-white" />
            )}
          </button>
        ) : launcher === 'avatar' ? (
          <button
            onClick={toggleOpen}
            style={bubbleStyle}
            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-hidden group relative border-2 border-white"
            aria-label="Open AI Front Desk Assistant"
          >
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </button>
        ) : (
          <button
            onClick={toggleOpen}
            style={bubbleStyle}
            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-hidden group relative"
            aria-label="Open AI Front Desk Assistant"
          >
            <MessageSquare className="w-6 h-6 text-white" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        )}
      </div>
    );
  }

  // 2. Full Widget Container
  return (
    <div
      className={`${
        mode === 'floating'
          ? `fixed bottom-20 ${
              client.widgetPosition === 'bottom-left'
                ? 'left-4'
                : client.widgetPosition === 'bottom-center'
                ? 'left-1/2 -translate-x-1/2'
                : 'right-4'
            } w-[380px] max-w-[95vw] h-[600px] max-h-[82vh] z-50 shadow-2xl ${radiusClass} border border-slate-200`
          : `w-full h-full min-h-[580px] max-h-[700px] border border-slate-200 ${radiusClass} shadow-md`
      } bg-white flex flex-col overflow-hidden transition-all duration-300`}
    >
      {/* Widget Header */}
      <div
        style={headerStyle}
        className={`px-4 py-3.5 flex items-center justify-between shrink-0 ${
          tpl === 'glass_morphism' ? 'backdrop-blur-md bg-opacity-90' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm leading-tight text-white">{client.personaName}</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 border border-white/40" title="Online" />
            </div>
            <p className="text-xs text-white/90 leading-tight">{client.personaRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/90"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {mode === 'floating' && (
            <button
              onClick={toggleOpen}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
              title="Minimize chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 rounded-bl-xs shadow-xs border border-slate-200/80'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {/* Structured Message Cards (Booking Proposal, Lead Form, Confirmation) */}
              {msg.structuredData && (
                <div className="w-full mt-2">
                  {/* Appointment Booking Form */}
                  {msg.structuredData.type === 'appointment_proposal' && (
                    <form
                      onSubmit={handleConfirmAppointment}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          Schedule Appointment
                        </span>
                        <span className="text-xs text-teal-700 font-semibold">{client.name}</span>
                      </div>

                      {/* Service selector */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Select Service</label>
                        <select
                          value={selectedService?.id || ''}
                          onChange={(e) => {
                            const found = client.services.find(s => s.id === e.target.value);
                            if (found) setSelectedService(found);
                          }}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                        >
                          {client.services.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.durationMinutes}m) {s.price ? `- ${s.price}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date and Time selectors */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-1.5"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
                          <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-1.5"
                          >
                            {['09:00', '09:30', '10:00', '11:00', '13:00', '14:30', '16:00'].map(t => (
                              <option key={t} value={t}>{t} AM/PM</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Visitor Name & Email */}
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          placeholder="Your Full Name *"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email Address *"
                          value={visitorEmail}
                          onChange={(e) => setVisitorEmail(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number (Optional)"
                          value={visitorPhone}
                          onChange={(e) => setVisitorPhone(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2"
                        />
                      </div>

                      <button
                        type="submit"
                        style={{ backgroundColor: client.primaryColor || '#0d9488' }}
                        className="w-full py-2 rounded-lg text-white font-semibold text-xs shadow-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Booking
                      </button>
                    </form>
                  )}

                  {/* Lead Capture Form */}
                  {msg.structuredData.type === 'lead_form' && (
                    <form
                      onSubmit={handleSubmitLead}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                          <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                          Team Callback Request
                        </span>
                        <span className="text-xs text-slate-400">Response &lt; 2 hours</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Your Full Name *"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2"
                        required
                      />
                      <textarea
                        placeholder="Briefly describe your inquiry or question..."
                        value={leadReason}
                        onChange={(e) => setLeadReason(e.target.value)}
                        rows={2}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Request to Team
                      </button>
                    </form>
                  )}

                  {/* Booking Confirmation Receipt Card */}
                  {msg.structuredData.type === 'booking_confirmation' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Confirmed Booking</span>
                      </div>
                      <p className="text-xs font-medium">
                        {msg.structuredData.payload?.serviceName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-emerald-700">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {msg.structuredData.payload?.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {msg.structuredData.payload?.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2.5 w-fit shadow-xs">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-75" />
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-150" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick FAQ Pills */}
      {client.quickQuestions && client.quickQuestions.length > 0 && messages.length <= 2 && (
        <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Suggested:
          </span>
          {client.quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-200/70 text-slate-700 rounded-full border border-slate-200 shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Footer */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${client.personaName} anything...`}
            className="flex-1 text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{ backgroundColor: client.primaryColor || '#0d9488' }}
            className="p-2.5 rounded-xl text-white disabled:opacity-40 hover:opacity-90 transition-opacity shadow-xs"
            aria-label="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Powered by ReceptionAI • Gemini
          </span>
          <span className="text-[10px] font-medium text-teal-700">
            {client.industry.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
