'use client';

import React, { useState, useEffect } from 'react';
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

  const agentDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Support Agent';

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000); // Live poll updates
    return () => clearInterval(interval);
  }, [currentSiteId]);

  const fetchConversations = async () => {
    if (!currentSiteId) return;
    try {
      const res = await fetch(`/api/v1/conversations?websiteId=${currentSiteId}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!activeConvId && data.conversations.length > 0) {
          setActiveConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleTakeover = async (status: 'human_active' | 'ai') => {
    if (!activeConvId) return;
    try {
      await fetch('/api/v1/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeConvId,
          status,
          assignedAgent: agentDisplayName,
        }),
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAgentMessage = async (textToSend?: string) => {
    const text = textToSend || agentMsg;
    if (!text || !text.trim() || !activeConvId || sending) return;
    setSending(true);

    try {
      await fetch(`/api/v1/conversations/${activeConvId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text.trim(),
          agentName: agentDisplayName,
        }),
      });
      setAgentMsg('');
      fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) => {
    if (filter === 'human_requested') return c.status === 'human_requested' || c.status === 'human_active';
    if (filter === 'ai') return c.status === 'ai';
    return true;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-brand-400" /> Live Support Agent Inbox
          </h2>
          <p className="text-slate-400 text-xs">
            Monitor real-time website visitors and take over live chat sessions seamlessly.
          </p>
        </div>
        <button
          onClick={fetchConversations}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Inbox
        </button>
      </div>

      {/* Main Inbox Workspace */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 flex overflow-hidden">
        {/* Left Side: Conversation List */}
        <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/60">
          {/* Filter Pills */}
          <div className="p-3 border-b border-slate-800 flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition ${
                filter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setFilter('human_requested')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition ${
                filter === 'human_requested' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              Handoffs
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition ${
                filter === 'ai' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              AI Active
            </button>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredConvs.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isSelected = conv.id === activeConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected ? 'bg-brand-600/15 border-l-4 border-brand-500' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-bold text-white truncate">
                      {conv.visitorName || conv.visitorId}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate mb-2">
                    {lastMsg ? lastMsg.content : 'Started conversation'}
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        conv.status === 'human_requested'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : conv.status === 'human_active'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
            })}
          </div>
        </div>

        {/* Right Side: Live Chat View & Action Panel */}
        {activeConv ? (
          <div className="flex-1 flex flex-col justify-between bg-[#080c14]">
            {/* Top Bar with Visitor Specs */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {activeConv.visitorName || activeConv.visitorId} ({activeConv.visitorEmail || 'No email saved'})
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-brand-400" /> {activeConv.visitorLocation}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Monitor className="w-3 h-3 text-brand-400" /> {activeConv.visitorDevice}</span>
                  </div>
                </div>
              </div>

              {/* Handoff Toggle Button */}
              <div className="flex items-center gap-3">
                {activeConv.status === 'human_active' ? (
                  <button
                    onClick={() => handleTakeover('ai')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" /> Return Control to AI
                  </button>
                ) : (
                  <button
                    onClick={() => handleTakeover('human_active')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-glow transition flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Take Over Chat Live
                  </button>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {activeConv.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[80%] ${
                    m.sender === 'visitor' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 mb-1">
                    {m.sender === 'visitor' ? 'Visitor' : m.sender === 'agent' ? `👨‍💼 Agent (${m.agentName})` : '🤖 AI Assistant'}
                  </span>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'visitor'
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : m.sender === 'agent'
                        ? 'bg-purple-900/60 border border-purple-500/30 text-purple-100 rounded-bl-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Agent Reply Box */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
              {/* Canned Responses */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 self-center">Quick Replies:</span>
                <button
                  onClick={() => handleSendAgentMessage('Hello! I am a live support specialist. How can I help you today?')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-brand-500 text-[11px]"
                >
                  "Hello! How can I help?"
                </button>
                <button
                  onClick={() => handleSendAgentMessage('I have verified your account details and updated your subscription.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-brand-500 text-[11px]"
                >
                  "Account updated"
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
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
                <button
                  onClick={() => handleSendAgentMessage()}
                  disabled={sending || activeConv.status !== 'human_active'}
                  className="px-5 py-2.5 font-semibold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl transition shadow-glow flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Select a conversation from the left to view thread
          </div>
        )}
      </div>
    </div>
  );
}
