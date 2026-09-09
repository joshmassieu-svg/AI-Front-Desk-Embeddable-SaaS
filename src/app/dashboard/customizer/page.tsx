'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  X,
  Copy,
  Terminal,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Play,
} from 'lucide-react';
import { useWebsite } from '@/context/website-context';
import { TestBotDrawer } from '@/components/test-bot-drawer';

const colorPresets = ['#536df4', '#10b981', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#3b82f6'];

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

function RotatingPlaceholderPreview({
  placeholders,
  effect = 'random',
  speed = 3500,
  fallback = 'Ask AI anything...',
}: {
  placeholders?: string[];
  effect?: string;
  speed?: number;
  fallback?: string;
}) {
  const list = placeholders && placeholders.length > 0 ? placeholders : [fallback];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(list[0] || fallback);
  const [animClass, setAnimClass] = useState('');
  const [isTypingCaret, setIsTypingCaret] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setDisplayText(list[0] || fallback);
  }, [list.join('||')]);

  useEffect(() => {
    if (effect === 'none' || list.length <= 1) {
      setDisplayText(list[0] || fallback);
      setAnimClass('');
      return;
    }

    const allEffects = ['typewriter', 'dissolve', 'break', 'clip', 'vertical-slide'];
    let timer: NodeJS.Timeout;

    const runNext = () => {
      const activeEffect = effect === 'random' ? allEffects[Math.floor(Math.random() * allEffects.length)] : effect;
      const nextIdx = (currentIndex + 1) % list.length;
      const targetText = list[nextIdx] || fallback;

      if (activeEffect === 'typewriter') {
        const currText = list[currentIndex] || fallback;
        let charIdx = currText.length;
        setIsTypingCaret(true);

        const typeDelete = () => {
          if (charIdx > 0) {
            charIdx--;
            setDisplayText(currText.substring(0, charIdx));
            timer = setTimeout(typeDelete, 30);
          } else {
            let addIdx = 0;
            const typeAdd = () => {
              if (addIdx <= targetText.length) {
                setDisplayText(targetText.substring(0, addIdx));
                addIdx++;
                timer = setTimeout(typeAdd, 45);
              } else {
                setCurrentIndex(nextIdx);
                setTimeout(() => setIsTypingCaret(false), 300);
                timer = setTimeout(runNext, speed);
              }
            };
            typeAdd();
          }
        };
        typeDelete();
      } else {
        setAnimClass('ph-effect-dissolve-out');
        timer = setTimeout(() => {
          setCurrentIndex(nextIdx);
          setDisplayText(targetText);
          setAnimClass('ph-effect-dissolve-in');
          timer = setTimeout(() => {
            setAnimClass('');
            timer = setTimeout(runNext, speed);
          }, 400);
        }, 400);
      }
    };

    timer = setTimeout(runNext, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, list, effect, speed]);

  return (
    <span className={`truncate flex-1 text-[11px] relative z-10 text-slate-700 ${animClass}`}>
      {displayText}
      {isTypingCaret && <span className="inline-block w-0.5 h-3 bg-brand-600 ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

export default function CustomizerPage() {
  const { currentSite, currentSiteId, updateWebsite } = useWebsite();
  const [activeTab, setActiveTab] = useState<'appearance' | 'launcher' | 'behavior' | 'identity' | 'leadForm'>('appearance');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [showTestBench, setShowTestBench] = useState(false);

  const [config, setConfig] = useState({
    name: 'Flowdexx Assistant',
    theme: 'dark' as 'dark' | 'light' | 'auto',
    primaryColor: '#536df4',
    welcomeMessage: '👋 Welcome to Flowdexx! How can I assist your business today?',
    botName: 'Flowdexx Copilot',
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
    launcherPlaceholders: [
      'Ask me anything...',
      'How do I get started?',
      'What are your pricing plans?',
      'Book a live product demo...'
    ],
    placeholderEffect: 'random' as 'typewriter' | 'dissolve' | 'break' | 'clip' | 'vertical-slide' | 'random' | 'none',
    placeholderSpeed: 3500,
    onlineStatus: 'online' as 'online' | 'offline' | 'away',
    offlineMessage: 'We are currently offline. Leave your email and our team will follow up!',
    leadFormEnabled: true,
    leadFormTitle: 'Want personalized onboarding?',
    customCss: '',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (currentSite && currentSite.id) {
      setConfig(prev => ({
        ...prev,
        ...currentSite
      }));
    }
  }, [currentSite]);

  const handleSave = async () => {
    if (!currentSiteId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateWebsite(config as any);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      // PAIN POINT (fixed): previously failed completely silently — the
      // spinner would just stop with no sign the widget wasn't actually
      // updated.
      setSaveError('Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyEmbedSnippet = () => {
    const snippet = `<script src="${window.location.origin}/embed.js" data-website-id="${currentSiteId || 'site_default'}" async></script>`;
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-600" /> Widget Customizer
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Design your embeddable AI assistant widget and preview changes live across 3 dedicated columns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfig({
              name: 'Flowdexx Assistant',
              theme: 'dark',
              primaryColor: '#536df4',
              welcomeMessage: '👋 Welcome to Flowdexx! How can I assist your business today?',
              botName: 'Flowdexx Copilot',
              launcherStyle: 'bar',
              launcherText: 'Ask AI anything...',
              launcherTheme: 'solid',
              launcherAnimation: 'none',
              enableParticleTrail: false,
              enableLoadingWaves: false,
              borderRadius: 16,
              launcherIcon: 'sparkles',
              botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
              position: 'bottom-right',
              launcherPlaceholder: 'Type a question...',
              launcherPlaceholders: ['Ask me anything...', 'How do I get started?', 'What are your pricing plans?'],
              placeholderEffect: 'random',
              placeholderSpeed: 3500,
              onlineStatus: 'online',
              offlineMessage: 'We are currently offline. Leave your email and our team will follow up!',
              leadFormEnabled: true,
              leadFormTitle: 'Want personalized onboarding?',
              customCss: '',
            })}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={copyEmbedSnippet}
            className="px-3.5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {copiedSnippet ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Code!</> : <><Code2 className="w-3.5 h-3.5" /> Copy Snippet</>}
          </button>

          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              {saving ? 'Saving...' : savedSuccess ? '✓ Saved Live!' : <><Save className="w-4 h-4" /> Save & Publish</>}
            </button>
            {saveError && (
              <span className="text-[11px] font-semibold text-rose-600">{saveError}</span>
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= COLUMN 1: LEFT NAV (3 COLS) ================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* Section Navigation Tabs */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 mb-1">
              Customize Sections
            </div>
            {[
              { id: 'appearance', label: 'Appearance & Colors', icon: Palette },
              { id: 'launcher', label: 'Launcher & Effects', icon: Layout },
              { id: 'behavior', label: 'Online Behavior', icon: Sliders },
              { id: 'identity', label: 'Bot Identity & Text', icon: Bot },
              { id: 'leadForm', label: 'Lead Capture Form', icon: Sparkles },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                    isActive
                      ? 'bg-[#FFFFE0] text-amber-900 border border-amber-300 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-amber-800' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= COLUMN 2: CENTER HERO LIVE PREVIEW CANVAS (5 COLS) ================= */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col items-center">
            {/* Viewport Header Bar */}
            <div className="w-full flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Preview Canvas</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Real-time Sync
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setPreviewTab('desktop')}
                  className={`p-1.5 rounded-md transition ${previewTab === 'desktop' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewTab('mobile')}
                  className={`p-1.5 rounded-md transition ${previewTab === 'mobile' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Host Webpage Viewport */}
            <div
              className={`w-full transition-all duration-300 relative rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden flex flex-col justify-between ${
                previewTab === 'mobile' ? 'max-w-[320px] h-[550px]' : 'h-[550px]'
              }`}
            >
              {/* Simulated Browser Bar */}
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-slate-100 px-3 py-1 rounded-md text-[11px] text-slate-500 text-center truncate border border-slate-200 font-mono">
                  https://flowdexx.com/demo
                </div>
              </div>

              {/* Host Website Background Mock */}
              <div className="p-6 space-y-4 opacity-40 select-none">
                <div className="h-6 w-1/3 bg-slate-300 rounded-md" />
                <div className="h-4 w-2/3 bg-slate-200 rounded-md" />
                <div className="h-24 w-full bg-slate-200/60 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-slate-200/80 rounded-lg" />
                  <div className="h-16 bg-slate-200/80 rounded-lg" />
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
                  className="w-[310px] h-[410px] mb-3 flex flex-col overflow-hidden shadow-2xl border transition-all"
                  style={{
                    backgroundColor: config.theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: config.theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderColor: config.theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: `${config.borderRadius}px`,
                  }}
                >
                  {/* Header */}
                  <div
                    className="p-3 border-b flex items-center justify-between"
                    style={{
                      backgroundColor: config.theme === 'dark' ? '#1e293b' : '#f8fafc',
                      borderColor: config.theme === 'dark' ? '#334155' : '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={config.botAvatar}
                        alt="Avatar"
                        className="w-7 h-7 rounded-full object-cover border-2"
                        style={{ borderColor: config.primaryColor }}
                      />
                      <div>
                        <div className="text-xs font-bold">{config.botName}</div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> AI Online
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Thread */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
                    <div
                      className="p-3 rounded-xl max-w-[88%] border text-xs leading-relaxed"
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
                          className="w-full px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[10px]"
                        />
                        <button
                          className="w-full py-1 rounded font-bold text-[11px] text-white shadow-xs"
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
                      className="flex-1 px-3 py-1 rounded-full border text-xs bg-slate-100"
                    />
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-xs shrink-0"
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
                      className={`w-[270px] h-10 rounded-full bg-white text-slate-800 border border-slate-200 px-3 flex items-center gap-2 text-xs shadow-sm relative overflow-hidden`}
                      style={{
                        borderColor: config.launcherTheme === 'solid' ? config.primaryColor : undefined,
                      }}
                    >
                      <ParticleTrailCanvas theme={config.launcherTheme} primaryColor={config.primaryColor} enabled={config.enableParticleTrail} />
                      <Sparkles className="w-4 h-4 text-brand-600 shrink-0 relative z-10" />
                      <RotatingPlaceholderPreview
                        placeholders={config.launcherPlaceholders}
                        effect={config.placeholderEffect}
                        speed={config.placeholderSpeed}
                        fallback={config.launcherPlaceholder || 'Ask me anything...'}
                      />
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] relative z-10 shrink-0"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        ➔
                      </div>
                    </div>
                  ) : config.launcherStyle === 'pill' ? (
                    <div
                      className={`px-4 py-2 rounded-full text-white font-semibold text-xs flex items-center gap-2 shadow-sm cursor-pointer relative overflow-hidden`}
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <Sparkles className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{config.launcherText || 'Ask AI'}</span>
                    </div>
                  ) : config.launcherStyle === 'tab' ? (
                    <div
                      className={`px-4 py-1.5 rounded-t-xl text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer relative overflow-hidden`}
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <Sparkles className="w-3.5 h-3.5 relative z-10" />
                      <span className="relative z-10">{config.launcherText || 'Need Help?'}</span>
                    </div>
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer relative overflow-hidden`}
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <Sparkles className="w-5 h-5 relative z-10" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: SELECTED SETTINGS PANEL (4 COLS) ================= */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
            {/* Header Title reflecting activeTab */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-0.5">
                Selected Settings Panel
              </span>
              <h3 className="text-base font-bold text-slate-900 capitalize flex items-center gap-2">
                {activeTab === 'appearance' && <><Palette className="w-4 h-4 text-brand-600" /> Appearance & Colors</>}
                {activeTab === 'launcher' && <><Layout className="w-4 h-4 text-brand-600" /> Launcher & Placeholders</>}
                {activeTab === 'behavior' && <><Sliders className="w-4 h-4 text-brand-600" /> Online Behavior</>}
                {activeTab === 'identity' && <><Bot className="w-4 h-4 text-brand-600" /> Bot Identity & Greeting</>}
                {activeTab === 'leadForm' && <><Sparkles className="w-4 h-4 text-purple-600" /> Lead Capture Settings</>}
              </h3>
            </div>

            {/* TAB 1: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                {/* Primary Brand Color */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Primary Brand Color</label>
                  <div className="flex items-center gap-2.5 mb-3">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        onClick={() => setConfig({ ...config, primaryColor: c })}
                        className={`w-7 h-7 rounded-full border-2 transition flex items-center justify-center ${
                          config.primaryColor === c ? 'border-brand-600 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
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
                    className="w-full h-8 bg-white border border-slate-200 rounded-lg cursor-pointer px-1"
                  />
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Widget Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setConfig({ ...config, theme: 'dark' })}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        config.theme === 'dark'
                          ? 'bg-[#FFFFE0] border-amber-300 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-brand-600" /> Dark Mode
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, theme: 'light' })}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        config.theme === 'light'
                          ? 'bg-[#FFFFE0] border-amber-300 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode
                    </button>
                  </div>
                </div>

                {/* Corner Roundness */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Corner Roundness</span>
                    <span className="text-brand-600 font-mono font-bold">{config.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="24"
                    value={config.borderRadius}
                    onChange={(e) => setConfig({ ...config, borderRadius: parseInt(e.target.value) })}
                    className="w-full accent-brand-600 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: LAUNCHER */}
            {activeTab === 'launcher' && (
              <div className="space-y-5">
                {/* Launcher Type */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Launcher Type</label>
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
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                          config.launcherStyle === st.id
                            ? 'bg-[#FFFFE0] border-amber-300 text-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Placeholders if Bar */}
                {config.launcherStyle === 'bar' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Rotating Placeholders</label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {(config.launcherPlaceholders || []).length} items
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add placeholder..."
                        value={newPlaceholder}
                        onChange={(e) => setNewPlaceholder(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newPlaceholder.trim()) {
                            e.preventDefault();
                            setConfig({ ...config, launcherPlaceholders: [...(config.launcherPlaceholders || []), newPlaceholder.trim()] });
                            setNewPlaceholder('');
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600"
                      />
                      <button
                        onClick={() => {
                          if (newPlaceholder.trim()) {
                            setConfig({ ...config, launcherPlaceholders: [...(config.launcherPlaceholders || []), newPlaceholder.trim()] });
                            setNewPlaceholder('');
                          }
                        }}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {(config.launcherPlaceholders || []).map((ph, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FFFFE0] border border-amber-200 text-xs text-slate-800"
                        >
                          <span className="truncate pr-2 font-mono text-[11px]">{ph}</span>
                          <button
                            onClick={() => {
                              const updated = (config.launcherPlaceholders || []).filter((_, i) => i !== idx);
                              setConfig({ ...config, launcherPlaceholders: updated });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Position */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Screen Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'bottom-right', label: 'Bottom Right' },
                      { id: 'bottom-center', label: 'Center' },
                      { id: 'bottom-left', label: 'Bottom Left' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setConfig({ ...config, position: pos.id as any })}
                        className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition text-center ${
                          config.position === pos.id
                            ? 'bg-[#FFFFE0] border-amber-300 text-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Idle Animation */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Idle Animation</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'Static' },
                      { id: 'pulse', label: 'Soft Pulse' },
                      { id: 'glow', label: 'Glow' },
                      { id: 'bounce', label: 'Bounce' },
                      { id: 'float', label: 'Floating' },
                    ].map((an) => (
                      <button
                        key={an.id}
                        onClick={() => setConfig({ ...config, launcherAnimation: an.id as any })}
                        className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition text-center ${
                          config.launcherAnimation === an.id
                            ? 'bg-[#FFFFE0] border-amber-300 text-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {an.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BEHAVIOR */}
            {activeTab === 'behavior' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Online Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['online', 'offline', 'away'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setConfig({ ...config, onlineStatus: st })}
                        className={`px-2 py-2 rounded-xl border text-xs font-semibold capitalize transition text-center ${
                          config.onlineStatus === st
                            ? 'bg-[#FFFFE0] border-amber-300 text-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Offline Fallback Message</label>
                  <textarea
                    rows={4}
                    value={config.offlineMessage}
                    onChange={(e) => setConfig({ ...config, offlineMessage: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: IDENTITY */}
            {activeTab === 'identity' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Assistant Name</label>
                  <input
                    type="text"
                    value={config.botName}
                    onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Welcome Greeting</label>
                  <textarea
                    rows={4}
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Avatar Image URL</label>
                  <input
                    type="text"
                    value={config.botAvatar}
                    onChange={(e) => setConfig({ ...config, botAvatar: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 font-mono text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: LEAD FORM */}
            {activeTab === 'leadForm' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-800">Enable Lead Capture Form</span>
                  <input
                    type="checkbox"
                    checked={config.leadFormEnabled}
                    onChange={(e) => setConfig({ ...config, leadFormEnabled: e.target.checked })}
                    className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                  />
                </div>

                {config.leadFormEnabled && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Lead Form Card Title</label>
                    <input
                      type="text"
                      value={config.leadFormTitle}
                      onChange={(e) => setConfig({ ...config, leadFormTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 font-medium"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
