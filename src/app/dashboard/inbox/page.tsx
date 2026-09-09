'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareText,
  UserCheck,
  Bot,
  Send,
  User,
  Clock,
  Globe,
  Monitor,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Conversation } from '@/lib/types';
import { useWebsite } from '@/context/website-context';
import { useAuth } from '@/context/auth-context';

export default function InboxPage() {
  const { currentSiteId } = useWebsite();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'human_requested' | 'ai'>('all');
  const [agentMsg, setAgentMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [inboxError, setInboxError] = useState<string | null>(null);

  const agentDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Support Agent';

  // PAIN POINT (fixed): the 4s poll interval was set up once inside an
  // effect keyed only on [currentSiteId], so it captured a stale closure
  // of `fetchConversations` (and, through it, `activeConvId`) from
  // whatever render the effect first ran on. In practice activeConvId
  // stayed frozen at its mount-time value (null) inside that closure,
  // which meant "auto-select the first conversation" kept re-firing on
  // every poll and yanked the agent back to conversation #1 every 4
  // seconds even after they'd clicked into a different one. A ref always
  // reflects the latest value regardless of when the closure was created.
  const activeConvIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000); // Live poll updates
    return () => clearInterval(interval);
  }, [currentSiteId]);

  const fetchConversations = async () => {
    if (!currentSiteId) return;
    try {
      const res = await fetch(`/api/v1/conversations?websiteId=${currentSiteId}`);
      if (!res.ok) throw new Error(`Failed to load conversations (${res.status})`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!activeConvIdRef.current && data.conversations.length > 0) {
          setActiveConvId(data.conversations[0].id);
        }
      }
      setInboxError(null);
    } catch (err) {
      console.error(err);
      setInboxError('Could not refresh the inbox. Retrying automatically...');
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleTakeover = async (status: 'human_active' | 'ai') => {
    if (!activeConvId) return;
    try {
      const res = await fetch('/api/v1/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeConvId,
          status,
          assignedAgent: status === 'human_active' ? agentDisplayName : null,
        }),
      });
      if (!res.ok) throw new Error(`Failed to update status (${res.status})`);

      // Local optimistic update
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                status,
                assignedAgent: status === 'human_active' ? agentDisplayName : undefined,
              }
            : c
        )
      );
      setInboxError(null);
    } catch (err) {
      console.error('Failed to switch conversation status:', err);
      setInboxError('Could not update the conversation status. Please try again.');
    }
  };

  const handleSendAgentMessage = async (msgText?: string) => {
    const textToSend = msgText || agentMsg;
    if (!activeConvId || !textToSend.trim()) return;
    setSending(true);

    try {
      // PAIN POINT (fixed): this used to POST to '/api/v1/chat', which
      // doesn't exist anywhere in the app (only '/api/v1/chat/stream'
      // does) — every agent reply 404'd silently since only `res.ok` was
      // checked, with no error shown. The route that actually saves an
      // agent message is '/api/v1/conversations/[id]/message'.
      const res = await fetch(`/api/v1/conversations/${activeConvId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textToSend.trim(),
          agentName: agentDisplayName,
        }),
      });

      if (!res.ok) throw new Error(`Failed to send message (${res.status})`);

      setAgentMsg('');
      setInboxError(null);
      fetchConversations();
    } catch (err) {
      console.error('Error sending agent message:', err);
      setInboxError('Your reply could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) => {
    if (filter === 'human_requested') return c.status === 'human_requested' || c.status === 'human_active';
    if (filter === 'ai') return c.status === 'ai' || c.status === 'resolved';
    return true;
  });

  const simulateConversation = async () => {
    if (!currentSiteId) return;
    try {
      // PAIN POINT (fixed): same wrong-endpoint issue as handleSendAgentMessage
      // above ('/api/v1/chat' doesn't exist), plus this expected a plain JSON
      // { conversationId } response when the real route streams SSE. Reads
      // the SSE stream and pulls the conversationId out of the first frame.
      const demoVisitorId = 'vis_demo_' + Date.now();
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: currentSiteId,
          visitorId: demoVisitorId,
          message: 'Hello! I need help setting up custom webhook triggers for my billing system.',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to simulate chat (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let newConversationId: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.replace('data: ', ''));
            if (payload.conversationId && !newConversationId) {
              newConversationId = payload.conversationId;
            }
          } catch {
            // Partial SSE frame split across reads — expected, skip it.
          }
        }
      }

      await fetchConversations();
      if (newConversationId) setActiveConvId(newConversationId);
      setInboxError(null);
    } catch (err) {
      console.error('Failed to simulate chat:', err);
      setInboxError('Could not start a simulated conversation. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-brand-600" /> Live Support Inbox & Handoff
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Monitor AI interactions in real time. Click <span className="text-purple-600 font-semibold">Take Over Chat</span> to speak directly with visitors whenever needed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {conversations.length === 0 && (
            <button
              onClick={simulateConversation}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Simulate Customer Chat
            </button>
          )}
          <button
            onClick={fetchConversations}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-600" /> Refresh Inbox
          </button>
        </div>
      </div>

      {inboxError && (
        <div className="shrink-0 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {inboxError}
        </div>
      )}

      {/* Main Inbox Container */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-200 flex overflow-hidden shadow-sm">
        {/* Left Side: Conversation List */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
          {/* Filter Row */}
          <div className="p-3 border-b border-slate-200 bg-white flex gap-1 text-xs">
            {(['all', 'human_requested', 'ai'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition text-[11px] capitalize ${
                  filter === f
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f === 'human_requested' ? 'Handoff' : f}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center space-y-3 text-slate-400">
                <Bot className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No live conversations yet.</p>
                <button
                  onClick={simulateConversation}
                  className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 text-xs font-semibold transition border border-brand-100"
                >
                  Simulate Customer Message
                </button>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const isActive = conv.id === activeConvId;
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-4 cursor-pointer transition ${
                      isActive
                        ? 'bg-brand-50/80 border-l-4 border-brand-600'
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {conv.visitorName || conv.visitorId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(conv.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate mb-2">
                      {lastMsg ? lastMsg.content : 'Started conversation'}
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          conv.status === 'human_requested'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : conv.status === 'human_active'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {conv.status === 'human_requested'
                          ? '⚠️ Handoff Triggered'
                          : conv.status === 'human_active'
                          ? '👨‍💼 Agent Takeover'
                          : '🤖 AI Active'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Live Chat View & Action Panel */}
        {activeConv ? (
          <div className="flex-1 flex flex-col justify-between bg-white">
            {/* Top Bar with Visitor Specs */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {activeConv.visitorName || activeConv.visitorId} ({activeConv.visitorEmail || 'No email saved'})
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-brand-600" /> {activeConv.visitorLocation}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Monitor className="w-3 h-3 text-brand-600" /> {activeConv.visitorDevice}</span>
                  </div>
                </div>
              </div>

              {/* Handoff Toggle Button */}
              <div className="flex items-center gap-3">
                {activeConv.status === 'human_active' ? (
                  <button
                    onClick={() => handleTakeover('ai')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Bot className="w-3.5 h-3.5" /> Return Control to AI
                  </button>
                ) : (
                  <button
                    onClick={() => handleTakeover('human_active')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Take Over Chat Live
                  </button>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
              {activeConv.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[80%] ${
                    m.sender === 'visitor' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-medium mb-1">
                    {m.sender === 'visitor' ? 'Visitor' : m.sender === 'agent' ? `👨‍💼 Agent (${m.agentName})` : '🤖 AI Assistant'}
                  </span>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'visitor'
                        ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                        : m.sender === 'agent'
                        ? 'bg-purple-50 border border-purple-200 text-purple-900 rounded-bl-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.content}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Sources:</span>
                        {m.sources.map((s, i) => (
                          s.url ? (
                            <a
                              key={i}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-medium text-slate-500 hover:text-brand-600 bg-white border border-slate-200 rounded-full px-2 py-0.5 max-w-[160px] truncate"
                            >
                              {s.title}
                            </a>
                          ) : (
                            <span key={i} className="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5 max-w-[160px] truncate">
                              {s.title}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Agent Reply Box */}
            <div className="p-4 border-t border-slate-200 bg-white space-y-3">
              {/* Canned Responses */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 self-center">Quick Replies:</span>
                <button
                  onClick={() => handleSendAgentMessage('Hello! I am a live support specialist. How can I help you today?')}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:border-brand-400 text-[11px] font-medium"
                >
                  &quot;Hello! How can I help?&quot;
                </button>
                <button
                  onClick={() => handleSendAgentMessage('I have verified your account details and updated your subscription.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:border-brand-400 text-[11px] font-medium"
                >
                  &quot;Account updated&quot;
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={agentMsg}
                  onChange={(e) => setAgentMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAgentMessage()}
                  placeholder={
                    activeConv.status === 'human_active'
                      ? 'Type response as Human Support Agent...'
                      : 'Click "Take Over Chat Live" above to reply directly...'
                  }
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
                <button
                  onClick={() => handleSendAgentMessage()}
                  disabled={sending || activeConv.status !== 'human_active'}
                  className="px-5 py-2.5 font-semibold text-xs text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Select a conversation from the left to view thread
          </div>
        )}
      </div>
    </div>
  );
}
