'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Database,
  Palette,
  Code2,
  X,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { useWebsite } from '@/context/website-context';

interface OnboardingChecklistProps {
  knowledgeCount?: number;
  onOpenTestDrawer?: () => void;
}

export function OnboardingChecklist({
  knowledgeCount = 0,
  onOpenTestDrawer,
}: OnboardingChecklistProps) {
  const { currentSite } = useWebsite();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Determine completed steps based on current configuration
  const hasKnowledge = knowledgeCount > 0;
  const hasCustomized = Boolean(
    currentSite && (currentSite.botName !== 'AI Copilot' || currentSite.primaryColor !== '#536df4')
  );
  // Default to step 1 done if we have items
  const isStep1Done = hasKnowledge;
  const isStep2Done = hasCustomized;
  const isStep3Done = false; // user can test/embed anytime

  const completedCount = [isStep1Done, isStep2Done, isStep3Done].filter(Boolean).length;
  const progressPercent = Math.round(((completedCount || 1) / 3) * 100);

  const steps = [
    {
      id: 1,
      title: '1. Add Knowledge & Train AI',
      description: 'Crawl your website or upload company FAQs so your AI answers accurately.',
      href: '/dashboard/knowledge',
      icon: Database,
      completed: isStep1Done,
      cta: 'Add Knowledge Docs',
    },
    {
      id: 2,
      title: '2. Customize Widget Appearance',
      description: 'Match your brand color, bot avatar, welcome greeting, and lead form.',
      href: '/dashboard/customizer',
      icon: Palette,
      completed: isStep2Done,
      cta: 'Style Widget',
    },
    {
      id: 3,
      title: '3. Embed Code or Test Live',
      description: 'Test your bot live in 1-click or copy the JavaScript snippet for your website.',
      href: '/dashboard/embed',
      icon: Code2,
      completed: isStep3Done,
      cta: 'Get Snippet',
      customAction: onOpenTestDrawer,
      customCta: 'Test Bot Live',
    },
  ];

  return (
    <div className="bg-[#FFFFE0] text-slate-900 p-6 rounded-2xl shadow-sm border border-amber-200/90 relative overflow-hidden font-sans">
      {/* Background Soft Glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Close/Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-amber-800 hover:text-slate-900 p-1.5 rounded-lg hover:bg-amber-200/50 transition"
        title="Hide Quick Start Guide"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold border border-amber-300/80 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-800" /> First-Time Setup Checklist
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Launch your AI Front Desk in 3 Simple Steps
          </h3>
          <p className="text-slate-700 text-xs mt-1 font-medium">
            Follow this guide to train your bot, customize its look, and embed it live on your site.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/90 min-w-[210px] shrink-0 shadow-xs">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-slate-800">Setup Progress</span>
            <span className="text-brand-700">{completedCount} of 3 completed</span>
          </div>
          <div className="w-full bg-amber-100/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-brand-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                step.completed
                  ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-xs'
                  : 'bg-white/90 border-amber-200/90 hover:border-amber-400 text-slate-900 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">{step.title}</span>
                  </div>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                {step.customAction && (
                  <button
                    onClick={step.customAction}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    {step.customCta}
                  </button>
                )}
                <Link
                  href={step.href}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${
                    step.completed
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                      : step.customAction
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                  }`}
                >
                  <span>{step.cta}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
