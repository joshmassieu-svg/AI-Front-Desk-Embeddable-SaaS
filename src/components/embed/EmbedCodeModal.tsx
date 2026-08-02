import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Code2, 
  Globe, 
  Layers, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Terminal,
  Play
} from 'lucide-react';
import { ClientWebsite } from '../../types';
import { ApiService } from '../../services/api';

interface EmbedCodeModalProps {
  client: ClientWebsite;
  onClose: () => void;
  onLaunchSimulator: () => void;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({
  client,
  onClose,
  onLaunchSimulator
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'iframe' | 'react' | 'wordpress'>('script');
  const [copied, setCopied] = useState(false);

  const snippets = ApiService.getEmbedCode(client.id, client.widgetPosition);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'script': return snippets.scriptTag;
      case 'iframe': return snippets.iframeSnippet;
      case 'react': return snippets.reactSnippet;
      case 'wordpress': return snippets.wordpressShortcode;
    }
  };

  const handleCopy = () => {
    const code = getActiveCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Embed & Installation Snippets</h3>
              <p className="text-xs text-slate-300">
                Client: <span className="text-teal-300 font-semibold">{client.name}</span> ({client.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Instructions Banner */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-sm text-teal-900">
              <div className="flex items-center gap-2">
                <p className="font-semibold">Ready for production on any website</p>
                <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sleek Button + Popup Iframe
                </span>
              </div>
              <p className="text-xs text-teal-800 mt-1">
                Copy and paste this snippet into your client's HTML <code className="bg-teal-100 px-1 rounded-sm">&lt;head&gt;</code> or footer before the closing <code className="bg-teal-100 px-1 rounded-sm">&lt;/body&gt;</code> tag. Separates UI responsibilities: a sleek HTML button on the host page and an isolated popup iframe chat window that opens when clicked.
              </p>
            </div>
          </div>

          {/* Snippet Tabs */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('script')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'script'
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Terminal className="w-4 h-4" />
                JavaScript SDK (&lt;script&gt;)
              </button>
              <button
                onClick={() => setActiveTab('iframe')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'iframe'
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                HTML / JS (&lt;div&gt; Embed)
              </button>
              <button
                onClick={() => setActiveTab('react')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'react'
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                React / Next.js
              </button>
              <button
                onClick={() => setActiveTab('wordpress')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'wordpress'
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                WordPress / CMS
              </button>
            </div>

            {/* Code Display Box */}
            <div className="mt-3 relative">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {getActiveCode()}
              </pre>

              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Config Summary Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Position</span>
              <span className="text-sm font-semibold text-slate-800">{client.widgetPosition}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Persona</span>
              <span className="text-sm font-semibold text-slate-800">{client.personaName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Primary Color</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-3 h-3 rounded-full border border-slate-300"
                  style={{ backgroundColor: client.primaryColor }}
                />
                <span className="text-xs font-mono font-semibold text-slate-800">{client.primaryColor}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Sound Effects</span>
              <span className="text-sm font-semibold text-emerald-700">
                {client.enableSoundEffects ? 'Enabled' : 'Muted'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Need custom CSS styling or webhooks? Contact enterprise support.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onLaunchSimulator();
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              Test in Website Simulator
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
