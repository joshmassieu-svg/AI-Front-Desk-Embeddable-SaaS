'use client';

import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  Palette,
  Database,
  MessageSquareText,
  Users,
  ShieldCheck,
  Building2,
  Cpu,
  Code2,
  Key,
  Settings,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

interface DashboardTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSections = [
  {
    icon: LayoutDashboard,
    title: '1. Analytics Overview',
    badge: 'Dashboard',
    description:
      'View real-time conversation volume, lead capture rates, AI resolution speed, and top visitor questions.',
    highlights: [
      'Track total visitor chats & leads captured daily',
      'Monitor AI self-service resolution vs human requests',
      'Follow your 3-Step Setup Checklist to get live fast',
    ],
  },
  {
    icon: Database,
    title: '2. Knowledge Base',
    badge: 'AI Training',
    description:
      'Train your AI on your company data so it answers customer questions accurately 24/7.',
    highlights: [
      'Crawl your website automatically with 1-click',
      'Upload PDFs, text files, or write custom Q&A rules',
      'Run RAG search tests to preview what your AI knows',
    ],
  },
  {
    icon: Palette,
    title: '3. Widget Customizer',
    badge: 'Branding',
    description:
      'Match your chatbot to your exact website brand colors, fonts, launcher style, and greetings.',
    highlights: [
      'Custom primary & background colors + dark mode',
      'Set bot avatar, launcher icon, & floating position',
      'Configure automated lead capture contact form',
    ],
  },
  {
    icon: MessageSquareText,
    title: '4. Live Support Inbox',
    badge: 'Live Operations',
    description:
      'Monitor visitor chats live, view AI responses in real-time, and take over whenever a human is needed.',
    highlights: [
      'Filter by Active, Pending, AI Handled, or Resolved',
      '1-click Human Takeover mode to chat directly with visitors',
      'Real-time sound alerts & auto-assignment features',
    ],
  },
  {
    icon: Users,
    title: '5. Leads & CRM',
    badge: 'Customer Growth',
    description:
      'Review and export lead contacts captured by the AI during visitor conversations.',
    highlights: [
      'View visitor name, email, company, and original chat transcript',
      'Export lead contacts to CSV in 1-click',
      'Track lead conversion performance',
    ],
  },
  {
    icon: Cpu,
    title: '6. AI & Guardrails',
    badge: 'AI Safety',
    description:
      'Control the AI model, system prompt guidelines, tone, temperature, and fallback rules.',
    highlights: [
      'Set custom instructions & restricted topics',
      'Adjust AI creativity / temperature level',
      'Enable automated human escalation rules',
    ],
  },
  {
    icon: Code2,
    title: '7. Embed Snippet',
    badge: 'Deployment',
    description:
      'Copy a single lightweight JavaScript tag to install the AI chatbot on any website in seconds.',
    highlights: [
      'Works with standard HTML, Next.js, React, Vue, & WordPress',
      'Zero impact on website load performance',
      'Domain security verification included',
    ],
  },
];

export function DashboardTourModal({ isOpen, onClose }: DashboardTourModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  const current = tourSections[activeTab];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden z-10 my-8">
        {/* Top Header */}
        <div className="bg-[#FFFFE0] text-slate-900 p-6 relative border-b border-amber-200">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-500 hover:text-slate-900 p-1.5 rounded-xl hover:bg-amber-200/50 transition"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-brand-600" /> Platform Cheat Sheet & Quick Tour
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            How Flowdexx AI Front Desk Works
          </h2>
          <p className="text-slate-600 text-xs mt-1 font-medium">
            Explore the main features below to understand how your automated AI assistant operates.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50 px-4 py-2 gap-1 scrollbar-none">
          {tourSections.map((sec, idx) => {
            const SecIcon = sec.icon;
            const isActive = idx === activeTab;
            return (
              <button
                key={sec.title}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <SecIcon className="w-3.5 h-3.5" />
                <span>{sec.title.split('.')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-900">{current.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 uppercase">
                  {current.badge}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{current.description}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Key Capabilities
            </h4>
            <div className="space-y-2">
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Step {activeTab + 1} of {tourSections.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
              disabled={activeTab === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {activeTab < tourSections.length - 1 ? (
              <button
                onClick={() => setActiveTab((prev) => Math.min(tourSections.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-1 shadow-sm"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
              >
                Got It, Let's Start!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
