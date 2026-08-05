'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Bot,
  MessageSquare,
  Layout,
  Sliders,
  Check,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  Code2,
} from 'lucide-react';

const colorPresets = ['#536df4', '#10b981', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#3b82f6'];

export default function CustomizerPage() {
  const [config, setConfig] = useState({
    botName: 'Acme Copilot',
    welcomeMessage: "👋 Hi there! I'm Acme's AI Assistant. How can I help you today?",
    primaryColor: '#536df4',
    theme: 'dark',
    position: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'bottom-center',
    launcherStyle: 'bar' as 'circle' | 'pill' | 'bar' | 'tab',
    launcherText: 'Ask AI anything...',
    launcherPlaceholder: 'Type a question...',
    borderRadius: 16,
    launcherIcon: 'sparkles',
    botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    leadFormEnabled: true,
    leadFormTitle: 'Want personalized onboarding?',
    customCss: `/* Scoped Shadow DOM custom CSS */
.chat-header { backdrop-filter: blur(12px); }`,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/v1/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'site_acme_123',
          ...config,
        })
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Visual Widget Customizer</h2>
          <p className="text-slate-400 text-xs">
            Customize branding, colors, launcher icons, welcome text, and lead forms in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfig({
              botName: 'Acme Copilot',
              welcomeMessage: "👋 Hi there! I'm Acme's AI Assistant. How can I help you today?",
              primaryColor: '#536df4',
              theme: 'dark',
              position: 'bottom-right',
              launcherStyle: 'bar',
              launcherText: 'Ask AI anything...',
              launcherPlaceholder: 'Type a question...',
              borderRadius: 16,
              launcherIcon: 'sparkles',
              botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
              leadFormEnabled: true,
              leadFormTitle: 'Want personalized onboarding?',
              customCss: '',
            })}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-700/70 rounded-xl transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-glow transition flex items-center gap-2"
          >
            {saving ? 'Saving...' : savedSuccess ? '✓ Saved Live!' : <><Save className="w-4 h-4" /> Save & Publish</>}
          </button>
        </div>
      </div>

      {/* Main Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Controls Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Theme Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Palette className="w-4 h-4 text-brand-400" /> Branding & Theme
            </h3>

            {/* Primary Color Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Primary Brand Color</label>
              <div className="flex items-center gap-2.5 mb-3">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    onClick={() => setConfig({ ...config, primaryColor: c })}
                    className={`w-7 h-7 rounded-full border-2 transition flex items-center justify-center ${
                      config.primaryColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {config.primaryColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer px-1"
              />
            </div>

            {/* Theme Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Widget Theme</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfig({ ...config, theme: 'dark' })}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                    config.theme === 'dark'
                      ? 'bg-slate-900 border-brand-500 text-brand-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark Mode
                </button>
                <button
                  onClick={() => setConfig({ ...config, theme: 'light' })}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                    config.theme === 'light'
                      ? 'bg-slate-900 border-brand-500 text-brand-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light Mode
                </button>
              </div>
            </div>

            {/* Border Radius Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Corner Roundness</span>
                <span className="text-brand-400">{config.borderRadius}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                value={config.borderRadius}
                onChange={(e) => setConfig({ ...config, borderRadius: parseInt(e.target.value) })}
                className="w-full accent-brand-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Launcher Variant & Positioning Settings */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layout className="w-4 h-4 text-brand-400" /> Launcher Style & Position
            </h3>

            {/* Style Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Launcher Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bar', label: '✨ Ask AI Bar' },
                  { id: 'circle', label: '⚪ Circle Icon' },
                  { id: 'pill', label: '💊 Pill Button' },
                  { id: 'tab', label: '🔖 Side Tab' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setConfig({ ...config, launcherStyle: st.id as any })}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition text-center ${
                      config.launcherStyle === st.id
                        ? 'bg-slate-900 border-brand-500 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Label or Placeholder */}
            {config.launcherStyle === 'bar' ? (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Input Bar Placeholder</label>
                <input
                  type="text"
                  value={config.launcherPlaceholder}
                  onChange={(e) => setConfig({ ...config, launcherPlaceholder: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            ) : config.launcherStyle !== 'circle' ? (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Launcher Label Text</label>
                <input
                  type="text"
                  value={config.launcherText}
                  onChange={(e) => setConfig({ ...config, launcherText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            ) : null}

            {/* Position Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Screen Position</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bottom-right', label: 'Bottom Right' },
                  { id: 'bottom-center', label: 'Bottom Center' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setConfig({ ...config, position: pos.id as any })}
                    className={`px-2 py-2 rounded-xl border text-[11px] font-medium transition text-center ${
                      config.position === pos.id
                        ? 'bg-slate-900 border-brand-500 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bot Content & Identity */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bot className="w-4 h-4 text-brand-400" /> Bot Identity & Greeting
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Assistant Name</label>
              <input
                type="text"
                value={config.botName}
                onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Welcome Greeting</label>
              <textarea
                rows={3}
                value={config.welcomeMessage}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Avatar Image URL</label>
              <input
                type="text"
                value={config.botAvatar}
                onChange={(e) => setConfig({ ...config, botAvatar: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Lead Capture Settings */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Lead Capture Form
              </h3>
              <input
                type="checkbox"
                checked={config.leadFormEnabled}
                onChange={(e) => setConfig({ ...config, leadFormEnabled: e.target.checked })}
                className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            {config.leadFormEnabled && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Form Title</label>
                <input
                  type="text"
                  value={config.leadFormTitle}
                  onChange={(e) => setConfig({ ...config, leadFormTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Live Preview Frame */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
            {/* Viewport Header Bar */}
            <div className="w-full flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Preview Canvas</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                  Real-time Sync
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setPreviewTab('desktop')}
                  className={`p-1.5 rounded-md transition ${previewTab === 'desktop' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewTab('mobile')}
                  className={`p-1.5 rounded-md transition ${previewTab === 'mobile' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Host Webpage Viewport */}
            <div
              className={`w-full transition-all duration-300 relative rounded-2xl border border-slate-800 bg-[#090d16] overflow-hidden flex flex-col justify-between ${
                previewTab === 'mobile' ? 'max-w-[340px] h-[580px]' : 'h-[580px]'
              }`}
            >
              {/* Simulated Browser Bar */}
              <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 bg-slate-950 px-3 py-1 rounded-md text-[11px] text-slate-400 text-center truncate border border-slate-800">
                  https://acme.com/demo
                </div>
              </div>

              {/* Host Website Background Mock */}
              <div className="p-6 space-y-4 opacity-40 select-none">
                <div className="h-6 w-1/3 bg-slate-700 rounded-md" />
                <div className="h-4 w-2/3 bg-slate-800 rounded-md" />
                <div className="h-24 w-full bg-slate-800/40 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-slate-800/50 rounded-lg" />
                  <div className="h-16 bg-slate-800/50 rounded-lg" />
                </div>
              </div>

              {/* Widget Frame Component Mock inside Host Viewport */}
              <div
                className={`absolute bottom-4 ${
                  config.position === 'bottom-left'
                    ? 'left-4 items-start'
                    : config.position === 'bottom-center'
                    ? 'left-1/2 -translate-x-1/2 items-center'
                    : 'right-4 items-end'
                } flex flex-col`}
              >
                {/* Chat Panel Box */}
                <div
                  className="w-[330px] h-[440px] mb-3 flex flex-col overflow-hidden shadow-2xl border transition-all"
                  style={{
                    backgroundColor: config.theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: config.theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderColor: config.theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: `${config.borderRadius}px`,
                  }}
                >
                  {/* Header */}
                  <div
                    className="p-3.5 border-b flex items-center justify-between"
                    style={{
                      backgroundColor: config.theme === 'dark' ? '#1e293b' : '#f8fafc',
                      borderColor: config.theme === 'dark' ? '#334155' : '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={config.botAvatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover border-2"
                        style={{ borderColor: config.primaryColor }}
                      />
                      <div>
                        <div className="text-xs font-bold">{config.botName}</div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> AI Online
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Thread */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
                    <div
                      className="p-3 rounded-xl max-w-[85%] border"
                      style={{
                        backgroundColor: config.theme === 'dark' ? '#1e293b' : '#f1f5f9',
                        borderColor: config.theme === 'dark' ? '#334155' : '#cbd5e1',
                      }}
                    >
                      {config.welcomeMessage}
                    </div>

                    {config.leadFormEnabled && (
                      <div
                        className="p-3 rounded-xl border space-y-2"
                        style={{
                          backgroundColor: config.theme === 'dark' ? '#1e293b' : '#f8fafc',
                          borderColor: `${config.primaryColor}55`,
                        }}
                      >
                        <div className="font-semibold text-[11px]">{config.leadFormTitle}</div>
                        <input
                          disabled
                          placeholder="Your Email Address..."
                          className="w-full px-2 py-1 rounded bg-slate-900/50 border border-slate-700 text-[10px]"
                        />
                        <button
                          className="w-full py-1.5 rounded font-bold text-[11px] text-white"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          Submit Info
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Input Footer */}
                  <div
                    className="p-2 border-t flex gap-2"
                    style={{
                      backgroundColor: config.theme === 'dark' ? '#1e293b' : '#f8fafc',
                      borderColor: config.theme === 'dark' ? '#334155' : '#e2e8f0',
                    }}
                  >
                    <input
                      disabled
                      placeholder="Ask a question..."
                      className="flex-1 px-3 py-1.5 rounded-full border text-xs bg-slate-900/30"
                    />
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Floating Launcher Variant Mock */}
                {config.launcherStyle === 'bar' ? (
                  <div className="w-[280px] h-10 rounded-full bg-slate-900 border border-slate-700/80 px-3 flex items-center gap-2 text-xs shadow-glow">
                    <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                    <span className="text-slate-400 truncate flex-1 text-[11px]">
                      {config.launcherPlaceholder || 'Ask AI anything...'}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      ➔
                    </div>
                  </div>
                ) : config.launcherStyle === 'pill' ? (
                  <div
                    className="px-4 py-2.5 rounded-full text-white font-semibold text-xs flex items-center gap-2 shadow-glow cursor-pointer"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{config.launcherText || 'Ask AI'}</span>
                  </div>
                ) : config.launcherStyle === 'tab' ? (
                  <div
                    className="px-4 py-1.5 rounded-t-xl text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{config.launcherText || 'Need Help?'}</span>
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-glow cursor-pointer"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
