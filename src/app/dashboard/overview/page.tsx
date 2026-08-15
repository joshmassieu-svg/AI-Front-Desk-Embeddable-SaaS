'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  CheckCircle2,
  Star,
  TrendingUp,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Conversation, Lead } from '@/lib/types';
import { useWebsite } from '@/context/website-context';
import { OnboardingChecklist } from '@/components/onboarding-checklist';

export default function OverviewPage() {
  const { currentSite, currentSiteId } = useWebsite();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [knowledgeCount, setKnowledgeCount] = useState(0);

  useEffect(() => {
    if (!currentSiteId) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/v1/conversations?websiteId=${currentSiteId}`).then((r) => r.json()),
      fetch(`/api/v1/leads?websiteId=${currentSiteId}`).then((r) => r.json()),
      fetch(`/api/v1/knowledge?websiteId=${currentSiteId}`).then((r) => r.json()),
    ])
      .then(([convData, leadData, knowData]) => {
        if (convData.conversations) setConversations(convData.conversations);
        if (leadData.leads) setLeads(leadData.leads);
        if (knowData.items) setKnowledgeCount(knowData.items.length);
      })
      .catch((err) => console.error('Error fetching analytics overview data:', err))
      .finally(() => setLoading(false));
  }, [currentSiteId]);

  const loadSampleDemoData = () => {
    const sampleConvs: Conversation[] = [
      {
        id: 'conv_sample_1',
        websiteId: currentSiteId || 'site_default',
        visitorId: 'vis_alex',
        visitorName: 'Alex Miller',
        status: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          { id: 'm1', conversationId: 'conv_sample_1', sender: 'visitor', content: 'What are your enterprise subscription plans?', createdAt: new Date().toISOString() },
          { id: 'm2', conversationId: 'conv_sample_1', sender: 'ai', content: 'Our Enterprise plan includes unlimited AI responses, custom SLA support, and dedicated webhook integrations.', createdAt: new Date().toISOString() }
        ]
      },
      {
        id: 'conv_sample_2',
        websiteId: currentSiteId || 'site_default',
        visitorId: 'vis_sarah',
        visitorName: 'Sarah Connor',
        status: 'resolved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          { id: 'm3', conversationId: 'conv_sample_2', sender: 'visitor', content: 'How do I embed the snippet on WordPress?', createdAt: new Date().toISOString() },
          { id: 'm4', conversationId: 'conv_sample_2', sender: 'ai', content: 'Simply paste the script tag into your theme footer or use our WordPress plugin.', createdAt: new Date().toISOString() }
        ]
      }
    ];

    const sampleLeadsArr: Lead[] = [
      {
        id: 'lead_sample_1',
        websiteId: currentSiteId || 'site_default',
        name: 'Alex Miller',
        email: 'alex.m@company.io',
        company: 'Nexus Tech',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'lead_sample_2',
        websiteId: currentSiteId || 'site_default',
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne.com',
        company: 'Cyberdyne Inc',
        createdAt: new Date().toISOString(),
      }
    ];

    setConversations(sampleConvs);
    setLeads(sampleLeadsArr);
  };

  // Real calculations
  const totalConversations = conversations.length;
  const totalLeads = leads.length;
  const resolvedCount = conversations.filter(
    (c) => c.status === 'resolved' || c.status === 'ai'
  ).length;
  const resolutionRate =
    totalConversations > 0 ? ((resolvedCount / totalConversations) * 100).toFixed(1) : '0';
  const conversionRate =
    totalConversations > 0 ? ((totalLeads / totalConversations) * 100).toFixed(1) : '0';

  // Build daily breakdown from real timestamp data over the last 7 days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map((d) => {
    const dayName = days[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    const dayConvs = conversations.filter((c) => c.createdAt && c.createdAt.startsWith(dateStr)).length;
    const dayLeads = leads.filter((l) => l.createdAt && l.createdAt.startsWith(dateStr)).length;

    return {
      day: dayName,
      conversations: dayConvs,
      leads: dayLeads,
    };
  });

  // Extract top visitor questions from real conversation messages
  const visitorQuestions = conversations
    .flatMap((c) => (c.messages || []).filter((m) => m.sender === 'visitor'))
    .map((m) => m.content)
    .slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Onboarding Checklist for New Users */}
      <OnboardingChecklist knowledgeCount={knowledgeCount} />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-50/80 via-white to-accent-50/60 p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{currentSite?.name || 'Workplace'} Analytics</h2>
          <p className="text-slate-500 text-xs">
            Real-time AI performance metrics, visitor engagement, and lead conversion rates for{' '}
            <span className="text-brand-600 font-semibold">{currentSite?.domain || currentSiteId}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {conversations.length === 0 && (
            <button
              onClick={loadSampleDemoData}
              className="px-4 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Click to populate metrics with sample demo data"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Demo Data
            </button>
          )}
          <a
            href="/dashboard/customizer"
            className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition shadow-sm"
          >
            Customize Widget
          </a>
          <a
            href="/demo-embed"
            target="_blank"
            className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition shadow-sm"
          >
            Test Widget Embed
          </a>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Conversations</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">{loading ? '...' : totalConversations}</div>
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-brand-600" /> Real-time active total
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leads Captured</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">{loading ? '...' : totalLeads}</div>
          <div className="flex items-center gap-1 text-purple-600 text-xs font-semibold">
            {conversionRate}% conversion rate
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Resolution Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">{loading ? '...' : `${resolutionRate}%`}</div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            {totalConversations > 0 ? `${(100 - parseFloat(resolutionRate)).toFixed(1)}% human requested` : 'No interactions yet'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CSAT Rating</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">N/A</div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            No visitor ratings collected yet
          </div>
        </div>
      </div>

      {/* Chart & Engagement Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Conversation Volume & Lead Generation</h3>
              <p className="text-xs text-slate-500">Daily breakdown of AI interactions vs captured leads</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-600" />
                <span className="text-slate-600">Conversations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-slate-600">Leads</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="conversations" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
                <Area type="monotone" dataKey="leads" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorLead)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Asked Questions */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-600" /> Frequently Asked
            </h3>
            <span className="text-xs text-slate-400">Visitor messages</span>
          </div>

          <div className="space-y-3">
            {visitorQuestions.length > 0 ? (
              visitorQuestions.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs font-medium text-slate-800 line-clamp-2">
                    &quot;{q}&quot;
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
                No visitor questions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
