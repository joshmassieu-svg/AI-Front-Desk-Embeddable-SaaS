'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Shield, Sliders, Save, Check, AlertTriangle, Globe, Sparkles, Brain } from 'lucide-react';
import { useWebsite } from '@/context/website-context';

export default function AISettingsPage() {
  const { currentSiteId, currentSite, updateWebsite } = useWebsite();
  const [model, setModel] = useState<'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash' | 'gemini-2.5-pro'>('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [systemPrompt, setSystemPrompt] = useState(
    `You are Flowdexx Copilot, an expert AI Customer Support & Sales Assistant for Flowdexx Platform.
Your tone is professional, warm, concise, and helpful.
Guidelines:
1. Answer visitor questions clearly using the provided Knowledge Base context.
2. If asked about pricing or custom demos, offer to capture their contact details.
3. If a user expresses frustration or asks for human support, politely suggest transferring them to a live support agent.`
  );
  const [restrictedTopics, setRestrictedTopics] = useState('Competitor financial details, Internal server passwords, Unreleased roadmap secrets');
  const [allowedDomains, setAllowedDomains] = useState('flowdexx.com, localhost, 127.0.0.1');
  const [enhancedIntelligence, setEnhancedIntelligence] = useState(false);

  // Load the site's saved settings so the page (and the toggle) show what is
  // really saved instead of hardcoded defaults.
  useEffect(() => {
    if (!currentSite) return;
    setEnhancedIntelligence(currentSite.enhancedIntelligence === true);
    if (currentSite.model) setModel(currentSite.model);
    if (typeof currentSite.temperature === 'number') setTemperature(currentSite.temperature);
    if (typeof currentSite.maxTokens === 'number') setMaxTokens(currentSite.maxTokens);
    if (currentSite.systemPrompt) setSystemPrompt(currentSite.systemPrompt);
    if (Array.isArray(currentSite.restrictedTopics)) setRestrictedTopics(currentSite.restrictedTopics.join(', '));
    if (Array.isArray(currentSite.allowedDomains)) setAllowedDomains(currentSite.allowedDomains.join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSite?.id]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!currentSiteId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateWebsite({
        model,
        temperature,
        maxTokens,
        systemPrompt,
        enhancedIntelligence,
        restrictedTopics: restrictedTopics.split(',').map(s => s.trim()),
        allowedDomains: allowedDomains.split(',').map(s => s.trim()),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      // PAIN POINT (fixed): this used to fail silently — the save spinner
      // would just stop with no indication anything went wrong.
      setSaveError('Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Guidance Banner */}
      <div className="bg-brand-50/70 border border-brand-100 p-5 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-brand-600 text-white rounded-xl shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Understanding AI Settings & Guardrails</h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            The <span className="font-semibold text-brand-700">System Prompt</span> instructs the AI on its personality, brand tone, and rules. <span className="font-semibold text-brand-700">Temperature</span> controls creativity (keep low for factual support), and <span className="font-semibold text-brand-700">Restricted Topics</span> block off-limit questions.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-600" /> AI Model & Guardrails Config
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Configure system persona, model selection, temperature, and topic guardrails.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            {saving ? 'Saving...' : saved ? '✓ Guardrails Saved' : <><Save className="w-4 h-4" /> Save Configuration</>}
          </button>
          {saveError && (
            <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {saveError}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model & Parameters */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-brand-600" /> Model Parameters
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">AI Model Engine</label>
            <select
              value={model}
              onChange={(e: any) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 cursor-pointer font-medium"
            >
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra Fast & Efficient)</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Reasoning & Complex RAG)</option>
              <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Next-Gen Low Latency)</option>
              <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Reasoning & Complex RAG)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Temperature (Creativity)</span>
              <span className="text-brand-600 font-mono font-bold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-brand-600 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
              <span>0.0 (Strict & Factual)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Max Tokens per Response</span>
              <span className="text-brand-600 font-mono font-bold">{maxTokens} tokens</span>
            </div>
            <input
              type="range"
              min="128"
              max="2048"
              step="64"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-brand-600 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Security & Restricted Topics */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-purple-600" /> Topic Guardrails & Security
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Restricted Topics (Comma separated)</label>
            <textarea
              rows={3}
              value={restrictedTopics}
              onChange={(e) => setRestrictedTopics(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white transition resize-none"
            />
            <span className="text-[10px] text-slate-400">The AI will refuse to answer or divert questions matching these topics.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Allowed Website Domains</label>
            <input
              type="text"
              value={allowedDomains}
              onChange={(e) => setAllowedDomains(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white transition font-mono"
            />
            <span className="text-[10px] text-slate-400">Domains authorized to load the widget script snippet.</span>
          </div>
        </div>
      </div>

      {/* Enhanced Intelligence */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand-600 text-white rounded-xl shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enhanced Intelligence</h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-xl">
              When on, your chatbot can also use the AI&apos;s general knowledge when your knowledge base doesn&apos;t have the answer.
              Business-specific details (prices, policies, hours) are never guessed. When off, it answers only from your knowledge base.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enhancedIntelligence}
          aria-label="Enhanced Intelligence"
          id="enhanced-intelligence-toggle"
          onClick={() => setEnhancedIntelligence(v => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition cursor-pointer ${enhancedIntelligence ? 'bg-brand-600' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${enhancedIntelligence ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* System Prompt Editor */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-4 h-4 text-brand-600" /> System Prompt & Personality Engine
        </h3>
        <textarea
          rows={8}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-brand-600 focus:bg-white transition resize-none"
        />
      </div>
    </div>
  );
}
