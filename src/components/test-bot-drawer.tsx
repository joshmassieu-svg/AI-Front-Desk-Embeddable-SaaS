'use client';

import React from 'react';
import { X, Sparkles, RefreshCw, ExternalLink, Bot, CheckCircle } from 'lucide-react';
import { useWebsite } from '@/context/website-context';

interface TestBotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestBotDrawer({ isOpen, onClose }: TestBotDrawerProps) {
  const { currentSite, currentSiteId } = useWebsite();
  const [iframeKey, setIframeKey] = React.useState(0);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const widgetUrl = `/widget-frame?siteId=${encodeURIComponent(currentSiteId || 'site_default')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col justify-between relative z-10">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Live Bot Test Bench
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  Testing site: <span className="text-brand-400 font-semibold">{currentSite?.name || currentSiteId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Restart Chat Session"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Close Test Bench"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="bg-brand-950/60 border-b border-brand-900/50 px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-brand-200 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" />
              Responses use your live Knowledge Base & AI settings
            </span>
            <a
              href="/demo-embed"
              target="_blank"
              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              Full Demo Site <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Widget Container */}
          <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex flex-col">
            <iframe
              key={iframeKey}
              src={widgetUrl}
              className="w-full h-full rounded-2xl border border-slate-800 shadow-inner bg-slate-900"
              title="Live AI Assistant Preview"
            />
          </div>

          {/* Footer controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-time RAG & Lead Capture Active</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              Done Testing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
