'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
}

export default function WidgetFrame() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Hi! What would you like to know about Handhold?',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initialHandledRef = useRef(false);

  const suggestions = [
    'What types of AI agents exist?',
    'How does the platform work?',
    'Pricing plans',
  ];

  const handleClose = () => {
    window.parent.postMessage({ type: 'ai-widget-close' }, '*');
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    // Simulated AI response delay
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `I'm here whenever you have a question about Handhold.`,
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 600);
  };

  // Receive search queries submitted through the launcher bar
  useEffect(() => {
    if (!initialHandledRef.current) {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('initialQuery');
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
  }, []);

  // Auto-scroll chat window to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

        /* CARD 1: MAIN CHAT CONTAINER */
        .chat-card {
          flex: 1;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
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
        }
        .agent-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .agent-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .agent-names {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .agent-name {
          font-weight: 600;
          font-size: 15px;
          color: #0f172a;
        }
        .agent-title {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 400;
        }
        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #0f172a;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        /* MESSAGES BODY */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px 20px;
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
          max-width: 82%;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.45;
          border-radius: 20px;
        }
        .bubble.user {
          background: #3b3d40;
          color: #ffffff;
          border-bottom-right-radius: 6px;
        }
        .bubble.agent {
          background: transparent;
          color: #0f172a;
          padding-left: 0;
        }

        /* FOOTER BRANDING */
        .chat-footer {
          padding: 12px 20px;
          text-align: left;
        }
        .powered-by {
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 4px;
        }
        .privacy-note {
          font-size: 10px;
          color: #cbd5e1;
          line-height: 1.3;
        }
        .privacy-note a {
          color: #94a3b8;
          text-decoration: underline;
        }

        /* CARD 2: BOTTOM INPUT DOCK */
        .input-dock {
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
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
          color: #1e293b;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .chip:hover { background: #f1f5f9; }

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
          width: 32px;
          height: 32px;
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
          background: #0f172a;
          color: #ffffff;
        }
      `}</style>

      <div className="frame-container">
        {/* CARD 1: MAIN CHAT BOX */}
        <div className="chat-card">
          <div className="chat-header">
            <div className="agent-info">
              <div className="agent-avatar">✨</div>
              <div className="agent-names">
                <span className="agent-name">Holly</span>
                <span className="agent-title">Inbound Q&A agent</span>
              </div>
            </div>
            <button className="close-btn" onClick={handleClose}>
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
            <div ref={chatEndRef} />
          </div>

          <div className="chat-footer">
            <div className="powered-by">
              powered by <strong>handhold</strong>
            </div>
            <div className="privacy-note">
              AI can sometimes make mistakes. By continuing, you agree to our <a href="#">Privacy Policy</a>
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
              placeholder="Ask me anything..."
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
