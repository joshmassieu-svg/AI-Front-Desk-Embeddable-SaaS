'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WebsiteConfig } from '@/lib/types';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
}

function WidgetFrameContent() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId') || searchParams.get('websiteId') || 'site_default';

  const [config, setConfig] = useState<WebsiteConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initialHandledRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);

  // Fetch dynamic website configuration
  useEffect(() => {
    if (!siteId) return;
    fetch(`/api/v1/widget/config?siteId=${encodeURIComponent(siteId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setConfig(data);
          setMessages([
            {
              id: 'init_welcome',
              sender: 'agent',
              text: data.welcomeMessage || `👋 Welcome! How can I assist you today?`,
            },
          ]);
        } else {
          setMessages([
            {
              id: 'init_welcome_default',
              sender: 'agent',
              text: `👋 Welcome! How can I assist you today?`,
            },
          ]);
        }
      })
      .catch((err) => {
        console.error('Error loading widget config:', err);
        setMessages([
          {
            id: 'init_welcome_err',
            sender: 'agent',
            text: `👋 Welcome! How can I assist you today?`,
          },
        ]);
      });
  }, [siteId]);

  const suggestions = config?.suggestedQuestions && config.suggestedQuestions.length > 0
    ? config.suggestedQuestions
    : ['What features do you offer?', 'Pricing & Plans', 'How to contact support?'];

  const botName = config?.botName || 'AI Assistant';
  const siteName = config?.name || 'AI Assistant Platform';
  const primaryColor = config?.primaryColor || '#536df4';

  const handleClose = () => {
    window.parent.postMessage({ type: 'ai-widget-close' }, '*');
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: siteId,
          message: query.trim(),
          conversationId: conversationIdRef.current,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to stream response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';
      const agentMsgId = (Date.now() + 1).toString();

      // Add placeholder agent message
      setMessages((prev) => [...prev, { id: agentMsgId, sender: 'agent', text: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.replace('data: ', ''));
              if (payload.conversationId) {
                conversationIdRef.current = payload.conversationId;
              }
              if (payload.chunk) {
                aiText += payload.chunk;
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === agentMsgId ? { ...msg, text: aiText } : msg))
                );
              }
            } catch (e) {
              // Ignore partial chunk parse errors
            }
          }
        }
      }

      if (!aiText) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMsgId
              ? { ...msg, text: `Thank you for your question! How else can I assist you with ${siteName}?` }
              : msg
          )
        );
      }
    } catch (err) {
      console.error('Chat stream error:', err);
      // Fallback agent message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: `Thank you for reaching out! I am here to help you with ${siteName}.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Receive search queries submitted through launcher bar or URL
  useEffect(() => {
    if (!initialHandledRef.current) {
      const initialQuery = searchParams.get('initialQuery');
      if (initialQuery && initialQuery.trim()) {
        initialHandledRef.current = true;
        handleSend(initialQuery.trim());
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ai-widget-query' && event.data.query) {
        handleSend(event.data.query.trim());
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [searchParams]);

  // Auto-scroll chat window to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          width: 100%;
          height: 100%;
          background: transparent !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }

        .frame-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 8px;
          gap: 12px;
          justify-content: flex-end;
          animation: frameFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes frameFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* MAIN CHAT CONTAINER */
        .chat-card {
          flex: 1;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* HEADER */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #ffffff;
          border-b: 1px solid #f1f5f9;
        }
        .agent-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .agent-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: ${primaryColor};
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 600;
          overflow: hidden;
        }
        .agent-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .agent-names {
          display: flex;
          flex-direction: column;
        }
        .agent-name {
          font-weight: 600;
          font-size: 15px;
          color: #0f172a;
          line-height: 1.2;
        }
        .agent-title {
          font-size: 12px;
          color: #64748b;
          font-weight: 400;
        }
        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.15s ease;
        }
        .close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        /* MESSAGES BODY */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .message-row {
          display: flex;
          width: 100%;
        }
        .message-row.user { justify-content: flex-end; }
        .message-row.agent { justify-content: flex-start; }

        .bubble {
          max-width: 85%;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.45;
          border-radius: 18px;
          word-break: break-word;
        }
        .bubble.user {
          background: ${primaryColor};
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }
        .bubble.agent {
          background: #f1f5f9;
          color: #0f172a;
          border-bottom-left-radius: 4px;
        }

        .typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: #f1f5f9;
          border-radius: 18px;
          width: max-content;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: typingBlink 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBlink {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* FOOTER BRANDING */
        .chat-footer {
          padding: 10px 20px;
          text-align: center;
          border-t: 1px solid #f8fafc;
        }
        .powered-by {
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        /* BOTTOM INPUT DOCK */
        .input-dock {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.08);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* SUGGESTION CHIPS */
        .chips-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .chips-scroll::-webkit-scrollbar { display: none; }
        .chip {
          white-space: nowrap;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 8px 14px;
          font-size: 13px;
          color: #334155;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .chip:hover { background: #f1f5f9; color: #0f172a; }

        /* INPUT FIELD */
        .input-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 8px;
        }
        .input-wrapper input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          color: #0f172a;
          background: transparent;
        }
        .input-wrapper input::placeholder { color: #94a3b8; }
        .send-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #e2e8f0;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .send-btn.active {
          background: ${primaryColor};
          color: #ffffff;
        }
      `}</style>

      <div className="frame-container">
        {/* CARD 1: MAIN CHAT BOX */}
        <div className="chat-card">
          <div className="chat-header">
            <div className="agent-info">
              <div className="agent-avatar">
                {config?.botAvatar ? (
                  <img src={config.botAvatar} alt={botName} />
                ) : (
                  '✨'
                )}
              </div>
              <div className="agent-names">
                <span className="agent-name">{botName}</span>
                <span className="agent-title">{siteName} Assistant</span>
              </div>
            </div>
            <button className="close-btn" onClick={handleClose} title="Close Assistant">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className={`bubble ${msg.sender}`}>{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message-row agent">
                <div className="typing-dots">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-footer">
            <div className="powered-by">
              Powered by <strong>{siteName}</strong>
            </div>
          </div>
        </div>

        {/* CARD 2: BOTTOM INPUT DOCK */}
        <div className="input-dock">
          <div className="chips-scroll">
            {suggestions.map((chipText, idx) => (
              <button key={idx} className="chip" onClick={() => handleSend(chipText)}>
                {chipText}
              </button>
            ))}
          </div>

          <div className="input-wrapper">
            <input
              type="text"
              placeholder={config?.launcherPlaceholder || 'Ask me anything...'}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className={`send-btn ${inputQuery.trim() ? 'active' : ''}`}
              onClick={() => handleSend()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function WidgetFrame() {
  return (
    <Suspense fallback={<div style={{ color: '#94a3b8', padding: 16, fontSize: 13 }}>Loading AI Assistant...</div>}>
      <WidgetFrameContent />
    </Suspense>
  );
}
