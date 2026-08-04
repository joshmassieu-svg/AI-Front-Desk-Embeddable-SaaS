'use client';

import React, { useState } from 'react';
import { Cpu, Shield, Sliders, Save, Check, AlertTriangle, Globe, Sparkles } from 'lucide-react';

export default function AISettingsPage() {
  const [model, setModel] = useState<'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash'>('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(512);
  const [systemPrompt, setSystemPrompt] = useState(
    `You are Acme Copilot, an expert AI Customer Support & Sales Assistant for Acme SaaS Platform.
Your tone is professional, warm, concise, and helpful.
Guidelines:
1. Answer visitor questions clearly using the provided Knowledge Base context.
2. If asked about pricing or custom demos, offer to capture their contact details.
3. If a user expresses frustration or asks for human support, politely suggest transferring them to a live support agent.`
  );
  const [restrictedTopics, setRestrictedTopics] = useState('Competitor financial details, Internal server passwords, Unreleased roadmap secrets');
  const [allowedDomains, setAllowedDomains] = useState('acme.com, localhost, 127.0.0.1');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/v1/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'site_acme_123',
          model,
          temperature,
          maxTokens,
          systemPrompt,
          restrictedTopics: restrictedTopics.split(',').map(s => s.trim()),
          allowedDomains: allowedDomains.split(',').map(s => s.trim()),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-400" /> AI Model & Guardrails Config
          </h2>
          <p className="text-slate-400 text-xs">
            Configure system persona, model selection, temperature, and topic guardrails.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 rounded-xl shadow-glow transition flex items-center gap-2"
        >
          {saved ? '✓ Guardrails Saved' : <><Save className="w-4 h-4" /> Save Configuration</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model & Parameters */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-brand-400" /> Model Parameters
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">AI Model Engine</label>
            <select
              value={model}
              onChange={(e: any) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra Fast & Efficient)</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Reasoning & Complex RAG)</option>
              <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Next-Gen Low Latency)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Temperature (Creativity)</span>
              <span className="text-brand-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-brand-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.0 (Strict & Factual)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Max Tokens per Response</span>
              <span className="text-brand-400">{maxTokens} tokens</span>
            </div>
            <input
              type="range"
              min="128"
              max="2048"
              step="64"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-brand-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Security & Restricted Topics */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-purple-400" /> Topic Guardrails & Security
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Restricted Topics (Comma separated)</label>
            <textarea
              rows={3}
              value={restrictedTopics}
              onChange={(e) => setRestrictedTopics(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
            />
            <span className="text-[10px] text-slate-500">The AI will refuse to answer or divert questions matching these topics.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Allowed Website Domains</label>
            <input
              type="text"
              value={allowedDomains}
              onChange={(e) => setAllowedDomains(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-500">Domains authorized to load the widget script snippet.</span>
          </div>
        </div>
      </div>

      {/* System Prompt Editor */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-brand-400" /> System Prompt & Personality Engine
        </h3>
        <textarea
          rows={8}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-brand-500 resize-none"
        />
      </div>
    </div>
  );
}
