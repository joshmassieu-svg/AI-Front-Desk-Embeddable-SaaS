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

import { useRef } from 'react';
import { useWebsite } from '@/context/website-context';

function ParticleTrailCanvas({ theme, primaryColor, enabled }: { theme: string; primaryColor: string; enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: any[] = [];
    
    const parent = canvas.parentElement;
    if (!parent) return;

    const handleMouseMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (Math.random() < 0.3) {
        spawnParticle(x, y);
      }
    };
    
    parent.addEventListener('mousemove', handleMouseMove);

    const spawnParticle = (x: number, y: number) => {
      const colors = ['#ffffff'];
      if (theme === 'cosmic') colors.push('#6366f1', '#d946ef');
      else if (theme === 'sunset') colors.push('#f97316', '#ec4899');
      else if (theme === 'ocean') colors.push('#14b8a6', '#3b82f6');
      else if (theme === 'rainbow') colors.push('#ff007f', '#7f00ff', '#00f0ff');
      else colors.push(primaryColor || '#536df4');
      
      particles.push({
        x: x + 50,
        y: y + 50,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.6,
        size: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    };

    let lastSpawn = 0;
    const update = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const r = parent.getBoundingClientRect();
      if (canvas.width !== r.width + 100 || canvas.height !== r.height + 100) {
        canvas.width = r.width + 100;
        canvas.height = r.height + 100;
      }

      if (timestamp - lastSpawn > 250) {
        spawnParticle(Math.random() * r.width, Math.random() * r.height);
        lastSpawn = timestamp;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animationFrameId = requestAnimationFrame(update);
    };
    
    animationFrameId = requestAnimationFrame(update);

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, theme, primaryColor]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: '-50px',
        left: '-50px',
        width: 'calc(100% + 100px)',
        height: 'calc(100% + 100px)',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
}

export default function CustomizerPage() {
  const { currentSite, currentSiteId, updateWebsite } = useWebsite();
  const [config, setConfig] = useState({
    name: 'AI Front-Desk Platform',
    theme: 'dark' as 'dark' | 'light' | 'auto',
    primaryColor: '#536df4',
    welcomeMessage: '👋 Welcome! How can I assist you today?',
    botName: 'AI Copilot',
    launcherStyle: 'bar' as 'circle' | 'pill' | 'bar' | 'tab',
    launcherText: 'Ask AI anything...',
    launcherTheme: 'solid' as 'solid' | 'cosmic' | 'sunset' | 'ocean' | 'rainbow' | 'glass',
    launcherAnimation: 'none' as 'none' | 'pulse' | 'glow' | 'bounce' | 'float',
    enableParticleTrail: false,
    enableLoadingWaves: false,
    borderRadius: 16,
    launcherIcon: 'sparkles' as 'chat' | 'sparkles' | 'message' | 'headset',
    botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    position: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'bottom-center',
    launcherPlaceholder: 'Type a question...',
    leadFormEnabled: true,
    leadFormTitle: 'Want personalized onboarding?',
    customCss: `/* Scoped Shadow DOM custom CSS */
.chat-header { backdrop-filter: blur(12px); }`,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (currentSiteId) {
      fetch(`/api/v1/website?websiteId=${currentSiteId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setConfig(prev => ({
              ...prev,
              ...data
            }));
          }
        })
        .catch(err => console.error(err));
    }
  }, [currentSiteId]);

  // Save handler
  const handleSave = async () => {
    if (!currentSiteId) return;
    setSaving(true);
    try {
      await updateWebsite(config as any);
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
      <style>{`
        /* Mock animations */
        .mock-anim-pulse { animation: mock-pulse 2s infinite ease-in-out; }
        .mock-anim-glow { border-radius: 9999px; animation: mock-glow 2s infinite ease-in-out; }
        .mock-anim-bounce { animation: mock-bounce 2s infinite ease-in-out; }
        .mock-anim-float { animation: mock-float 4s infinite ease-in-out; }

        @keyframes mock-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes mock-glow {
          0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 8px var(--mock-glow-color, ${config.primaryColor})44; }
          50% { box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 20px var(--mock-glow-color, ${config.primaryColor})aa; }
        }
        @keyframes mock-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes mock-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }

        /* Gradient/Glass Mock Themes */
        .mock-theme-cosmic {
          background: linear-gradient(135deg, #6366f1, #d946ef) !important;
          --mock-glow-color: #d946ef;
          border: none !important;
        }
        .mock-theme-sunset {
          background: linear-gradient(135deg, #f97316, #ec4899) !important;
          --mock-glow-color: #ec4899;
          border: none !important;
        }
        .mock-theme-ocean {
          background: linear-gradient(135deg, #14b8a6, #3b82f6) !important;
          --mock-glow-color: #3b82f6;
          border: none !important;
        }
        .mock-theme-rainbow {
          background: linear-gradient(120deg, #ff007f, #7f00ff, #00f0ff, #ff007f) !important;
          background-size: 300% 300% !important;
          animation: mock-rainbow-gradient 4s ease infinite !important;
          --mock-glow-color: #7f00ff;
          border: none !important;
        }
        .mock-theme-glass {
          background: rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          --mock-glow-color: rgba(255, 255, 255, 0.4);
          color: #ffffff !important;
        }

        @keyframes mock-rainbow-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Apply gradient properties specifically inside mockup Bar layout */
        .mock-theme-bar-cosmic { border-color: #6366f1 !important; background: #0b0d19 !important; }
        .mock-theme-bar-cosmic .bar-submit-btn { background: linear-gradient(135deg, #6366f1, #d946ef) !important; }
        .mock-theme-bar-cosmic .icon-sparkle { color: #d946ef !important; }

        .mock-theme-bar-sunset { border-color: #f97316 !important; background: #130a0f !important; }
        .mock-theme-bar-sunset .bar-submit-btn { background: linear-gradient(135deg, #f97316, #ec4899) !important; }
        .mock-theme-bar-sunset .icon-sparkle { color: #ec4899 !important; }

        .mock-theme-bar-ocean { border-color: #14b8a6 !important; background: #050e18 !important; }
        .mock-theme-bar-ocean .bar-submit-btn { background: linear-gradient(135deg, #14b8a6, #3b82f6) !important; }
        .mock-theme-bar-ocean .icon-sparkle { color: #3b82f6 !important; }

        .mock-theme-bar-rainbow { border-color: #7f00ff !important; background: #0f0919 !important; }
        .mock-theme-bar-rainbow .bar-submit-btn {
          background: linear-gradient(120deg, #ff007f, #7f00ff, #00f0ff, #ff007f) !important;
          background-size: 300% 300% !important;
          animation: mock-rainbow-gradient 4s ease infinite !important;
        }
        .mock-theme-bar-rainbow .icon-sparkle { color: #ff007f !important; }

        .mock-theme-bar-glass {
          background: rgba(15, 23, 42, 0.4) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        .mock-theme-bar-glass .bar-submit-btn { background: rgba(255, 255, 255, 0.15) !important; color: #ffffff !important; }
        .mock-theme-bar-glass .icon-sparkle { color: rgba(255, 255, 255, 0.8) !important; }

        /* Mock Waves animation */
        .mock-waves {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: inherit;
          pointer-events: none;
          z-index: 1;
          opacity: 0.35;
        }
        .mock-waves svg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
        }
        .mock-wave1 {
          animation: mock-wave-move 8s linear infinite;
          fill: rgba(255, 255, 255, 0.3);
        }
        .mock-wave2 {
          animation: mock-wave-move 4s linear infinite;
          fill: rgba(255, 255, 255, 0.4);
        }
        @keyframes mock-wave-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
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
              name: 'AI Front-Desk Platform',
              botName: 'AI Copilot',
              welcomeMessage: "👋 Welcome! How can I assist you today?",
              primaryColor: '#536df4',
              theme: 'dark',
              position: 'bottom-right',
              launcherStyle: 'bar',
              launcherText: 'Ask AI anything...',
              launcherPlaceholder: 'Type a question...',
              launcherAnimation: 'none',
              launcherTheme: 'solid',
              enableParticleTrail: false,
              enableLoadingWaves: false,
              borderRadius: 16,
              launcherIcon: 'sparkles',
              botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
              leadFormEnabled: true,
              leadFormTitle: 'Want personalized onboarding?',
              customCss: '',
            } as any)}
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

          {/* Launcher Effects & Animations */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-brand-400" /> Launcher Themes & Effects
            </h3>

            {/* Launcher Themes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Visual Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'solid', label: 'Solid Color' },
                  { id: 'cosmic', label: 'Cosmic Gradient' },
                  { id: 'sunset', label: 'Sunset Gradient' },
                  { id: 'ocean', label: 'Ocean Gradient' },
                  { id: 'rainbow', label: 'Rainbow Shimmer' },
                  { id: 'glass', label: 'Frosted Glass' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setConfig({ ...config, launcherTheme: th.id as any })}
                    className={`px-2 py-2 rounded-xl border text-[11px] font-medium transition text-center ${
                      config.launcherTheme === th.id
                        ? 'bg-slate-900 border-brand-500 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Launcher Animations */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Idle Animation</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Static' },
                  { id: 'pulse', label: 'Soft Pulse' },
                  { id: 'glow', label: 'Glow Breathe' },
                  { id: 'bounce', label: 'Bounce Jump' },
                  { id: 'float', label: 'Floating Wave' },
                ].map((an) => (
                  <button
                    key={an.id}
                    onClick={() => setConfig({ ...config, launcherAnimation: an.id as any })}
                    className={`px-2 py-2 rounded-xl border text-[11px] font-medium transition text-center ${
                      config.launcherAnimation === an.id
                        ? 'bg-slate-900 border-brand-500 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {an.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles for Particle Trails & Loading Waves */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Particle Trails</span>
                <input
                  type="checkbox"
                  checked={config.enableParticleTrail}
                  onChange={(e) => setConfig({ ...config, enableParticleTrail: e.target.checked })}
                  className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Loading Waves</span>
                <input
                  type="checkbox"
                  checked={config.enableLoadingWaves}
                  onChange={(e) => setConfig({ ...config, enableLoadingWaves: e.target.checked })}
                  className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                />
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
                <div className={`launcher-animation-wrap mock-anim-${config.launcherAnimation || 'none'}`}>
                  {config.launcherStyle === 'bar' ? (
                    <div
                      className={`w-[280px] h-10 rounded-full bg-slate-900 border border-slate-700/80 px-3 flex items-center gap-2 text-xs shadow-glow relative overflow-hidden mock-theme-bar-${config.launcherTheme || 'solid'}`}
                      style={{
                        borderColor: config.launcherTheme === 'solid' ? config.primaryColor : undefined,
                      }}
                    >
                      {config.enableLoadingWaves && (
                        <div className="mock-waves">
                          <svg viewBox="0 0 120 28" preserveAspectRatio="none">
                            <path d="M0 15 Q 30 0, 60 15 T 120 15 L 120 28 L 0 28 Z" className="mock-wave1" />
                            <path d="M0 18 Q 30 5, 60 18 T 120 18 L 120 28 L 0 28 Z" className="mock-wave2" />
                          </svg>
                        </div>
                      )}
                      <ParticleTrailCanvas theme={config.launcherTheme} primaryColor={config.primaryColor} enabled={config.enableParticleTrail} />
                      <Sparkles className="w-4 h-4 text-brand-400 shrink-0 icon-sparkle relative z-10" />
                      <span className="text-slate-400 truncate flex-1 text-[11px] relative z-10">
                        {config.launcherPlaceholder || 'Ask AI anything...'}
                      </span>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] bar-submit-btn relative z-10"
                        style={{ backgroundColor: config.launcherTheme === 'solid' ? config.primaryColor : undefined }}
                      >
                        ➔
                      </div>
                    </div>
                  ) : config.launcherStyle === 'pill' ? (
                    <div
                      className={`px-4 py-2.5 rounded-full text-white font-semibold text-xs flex items-center gap-2 shadow-glow cursor-pointer relative overflow-hidden mock-theme-${config.launcherTheme || 'solid'}`}
                      style={{
                        backgroundColor: config.launcherTheme === 'solid' ? config.primaryColor : undefined,
                      }}
                    >
                      {config.enableLoadingWaves && (
                        <div className="mock-waves">
                          <svg viewBox="0 0 120 28" preserveAspectRatio="none">
                            <path d="M0 15 Q 30 0, 60 15 T 120 15 L 120 28 L 0 28 Z" className="mock-wave1" />
                            <path d="M0 18 Q 30 5, 60 18 T 120 18 L 120 28 L 0 28 Z" className="mock-wave2" />
                          </svg>
                        </div>
                      )}
                      <ParticleTrailCanvas theme={config.launcherTheme} primaryColor={config.primaryColor} enabled={config.enableParticleTrail} />
                      <Sparkles className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{config.launcherText || 'Ask AI'}</span>
                    </div>
                  ) : config.launcherStyle === 'tab' ? (
                    <div
                      className={`px-4 py-1.5 rounded-t-xl text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer relative overflow-hidden mock-theme-${config.launcherTheme || 'solid'}`}
                      style={{
                        backgroundColor: config.launcherTheme === 'solid' ? config.primaryColor : undefined,
                      }}
                    >
                      {config.enableLoadingWaves && (
                        <div className="mock-waves">
                          <svg viewBox="0 0 120 28" preserveAspectRatio="none">
                            <path d="M0 15 Q 30 0, 60 15 T 120 15 L 120 28 L 0 28 Z" className="mock-wave1" />
                            <path d="M0 18 Q 30 5, 60 18 T 120 18 L 120 28 L 0 28 Z" className="mock-wave2" />
                          </svg>
                        </div>
                      )}
                      <ParticleTrailCanvas theme={config.launcherTheme} primaryColor={config.primaryColor} enabled={config.enableParticleTrail} />
                      <Sparkles className="w-3.5 h-3.5 relative z-10" />
                      <span className="relative z-10">{config.launcherText || 'Need Help?'}</span>
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-glow cursor-pointer relative overflow-hidden mock-theme-${config.launcherTheme || 'solid'}`}
                      style={{
                        backgroundColor: config.launcherTheme === 'solid' ? config.primaryColor : undefined,
                      }}
                    >
                      {config.enableLoadingWaves && (
                        <div className="mock-waves">
                          <svg viewBox="0 0 120 28" preserveAspectRatio="none">
                            <path d="M0 15 Q 30 0, 60 15 T 120 15 L 120 28 L 0 28 Z" className="mock-wave1" />
                            <path d="M0 18 Q 30 5, 60 18 T 120 18 L 120 28 L 0 28 Z" className="mock-wave2" />
                          </svg>
                        </div>
                      )}
                      <ParticleTrailCanvas theme={config.launcherTheme} primaryColor={config.primaryColor} enabled={config.enableParticleTrail} />
                      <Sparkles className="w-6 h-6 relative z-10" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
