'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trash2, X, Send } from 'lucide-react';

interface Message {
  id: string;
  sender: 'visitor' | 'ai' | 'agent';
  content: string;
  agentName?: string;
  sources?: { title: string; url?: string }[];
  createdAt: string;
}

interface WebsiteConfig {
  id: string;
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  theme: 'dark' | 'light' | 'auto';
  borderRadius: number;
  botAvatar: string;
  leadFormEnabled: boolean;
  leadFormTitle: string;
  leadFields?: { name?: boolean; email?: boolean; company?: boolean };
  suggestedQuestions?: string[];
}

function WidgetFrameContent() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId') || searchParams.get('websiteId') || 'site_acme_123';

  const [config, setConfig] = useState<WebsiteConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [visitorId, setVisitorId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLeadDone, setIsLeadDone] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCompany, setLeadCompany] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialQuery = searchParams.get('initialQuery');
  const initialQueryProcessed = useRef(false);

  // Initialize Visitor ID and fetch config
  useEffect(() => {
    let vid = localStorage.getItem('ai_widget_visitor_id');
    if (!vid) {
      vid = 'vis_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('ai_widget_visitor_id', vid);
    }
    setVisitorId(vid);

    const savedConvId = localStorage.getItem('ai_widget_conv_id_' + siteId);
    if (savedConvId) setConversationId(savedConvId);

    const leadDone = localStorage.getItem('ai_widget_lead_done_' + siteId) === 'true';
    setIsLeadDone(leadDone);

    fetch(`/api/v1/widget/config?siteId=${siteId}`)
      .then((res) => res.json())
      .then((data: WebsiteConfig) => {
        setConfig(data);
        const welcomeMsg: Message = {
          id: 'welcome',
          sender: 'ai',
          content: data.welcomeMessage || "👋 Hi there! How can I help you today?",
          createdAt: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);

        if (initialQuery && !initialQueryProcessed.current) {
          initialQueryProcessed.current = true;
          setTimeout(() => {
            handleSend(initialQuery);
          }, 300);
        }
      })
      .catch((err) => console.error('Failed to load widget config:', err));
  }, [siteId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage({ type: 'ai-widget-close' }, '*');
    }
  };

  const clearChat = () => {
    if (!config) return;
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        content: config.welcomeMessage,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = async (text: string) => {
    if (!text || !text.trim() || isTyping) return;
    const cleanText = text.trim();
    setInputValue('');

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'visitor',
      content: cleanText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const aiMsgId = 'ai_' + Date.now();
    let accumulatedText = '';

    try {
      const res = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: siteId,
          visitorId,
          conversationId,
          message: cleanText,
          currentUrl: document.referrer || window.location.href,
        }),
      });

      setIsTyping(false);

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          content: '',
          createdAt: new Date().toISOString(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.substring(6));
              if (json.conversationId) {
                setConversationId(json.conversationId);
                localStorage.setItem('ai_widget_conv_id_' + siteId, json.conversationId);
              }
              if (json.chunk) {
                accumulatedText += json.chunk;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: accumulatedText, sources: json.sources || m.sources }
                      : m
                  )
                );
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          content: 'Apologies, I encountered a connection issue. Please try again!',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadEmail.trim()) {
      alert('Please enter your email address.');
      return;
    }

    try {
      await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: siteId,
          conversationId,
          name: leadName || 'Visitor',
          email: leadEmail,
          company: leadCompany,
          sourceUrl: document.referrer || window.location.href,
        }),
      });

      setIsLeadDone(true);
      localStorage.setItem('ai_widget_lead_done_' + siteId, 'true');

      setMessages((prev) => [
        ...prev,
        {
          id: 'lead_thanks',
          sender: 'ai',
          content: '✅ Thank you! Your contact information has been saved.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  if (!config) {
    return (
      <div className="w-full h-full min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center text-xs">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const isDark = config.theme === 'dark' || config.theme === 'auto';
  const primaryColor = config.primaryColor || '#536df4';

  return (
    <div
      className={`w-full h-full flex flex-col justify-between overflow-hidden text-sm font-sans ${
        isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${
          isDark ? 'bg-[#1e293b] border-slate-700/80' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={config.botAvatar}
            alt={config.botName}
            className="w-9 h-9 rounded-full object-cover border-2"
            style={{ borderColor: primaryColor }}
          />
          <div>
            <h4 className="font-semibold text-sm leading-tight">{config.botName}</h4>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>AI Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition"
            title="Close Widget"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isVisitor = msg.sender === 'visitor';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isVisitor ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              {msg.sender === 'agent' && (
                <span className="text-[11px] text-slate-400 font-medium mb-1">
                  👨‍💼 Support Agent ({msg.agentName || 'Agent'})
                </span>
              )}

              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed break-words ${
                  isVisitor
                    ? 'text-white rounded-br-none'
                    : isDark
                    ? 'bg-[#1e293b] text-slate-100 border border-slate-700 rounded-bl-none'
                    : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
                }`}
                style={isVisitor ? { backgroundColor: primaryColor } : {}}
              >
                {msg.content}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-slate-700 text-[11px] text-slate-400">
                  Sources:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {msg.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 hover:text-white text-[10px]"
                      >
                        📄 {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Suggested Questions */}
        {config.suggestedQuestions && messages.length <= 2 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {config.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/40 text-indigo-400 hover:bg-indigo-600 hover:text-white transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Lead Form */}
        {config.leadFormEnabled && !isLeadDone && messages.length >= 3 && (
          <div
            className={`p-3.5 rounded-xl border space-y-2 mt-3 ${
              isDark ? 'bg-[#1e293b] border-indigo-500/40' : 'bg-slate-50 border-indigo-200'
            }`}
          >
            <h5 className="font-semibold text-xs text-slate-200">{config.leadFormTitle}</h5>
            {config.leadFields?.name && (
              <input
                type="text"
                placeholder="Your Name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            )}
            <input
              type="email"
              placeholder="Email Address *"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            {config.leadFields?.company && (
              <input
                type="text"
                placeholder="Company Name"
                value={leadCompany}
                onChange={(e) => setLeadCompany(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            )}
            <button
              onClick={handleLeadSubmit}
              className="w-full py-1.5 rounded-lg font-bold text-xs text-white transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Submit Info
            </button>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#1e293b] border border-slate-700 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div
        className={`p-3 border-t flex items-center gap-2 ${
          isDark ? 'bg-[#1e293b] border-slate-700/80' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <input
          type="text"
          placeholder="Ask a question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
          className={`flex-1 px-3.5 py-2 rounded-full border text-xs focus:outline-none ${
            isDark
              ? 'bg-[#0f172a] border-slate-700 text-slate-100 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
          }`}
        />
        <button
          onClick={() => handleSend(inputValue)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 hover:scale-105 transition"
          style={{ backgroundColor: primaryColor }}
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Branding */}
      <div
        className={`text-center py-1 text-[10px] ${
          isDark ? 'bg-[#1e293b] text-slate-400' : 'bg-slate-100 text-slate-500'
        }`}
      >
        Powered by{' '}
        <a
          href="https://demo.flowdexx.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium hover:underline"
          style={{ color: primaryColor }}
        >
          FlowDexx AI
        </a>
      </div>
    </div>
  );
}

export default function WidgetFramePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center text-xs">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
        </div>
      }
    >
      <WidgetFrameContent />
    </Suspense>
  );
}
