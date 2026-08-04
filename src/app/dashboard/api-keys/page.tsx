'use client';

import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Shield, Eye, EyeOff, Radio, Check, Save } from 'lucide-react';
import { ApiKey, Webhook } from '@/lib/types';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://api.techflow.io/webhooks/acme-leads');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Seed initial data
    setKeys([
      {
        id: 'key_1',
        websiteId: 'site_acme_123',
        name: 'Production Server Key',
        key: 'ak_live_998877665544332211',
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      }
    ]);
    setWebhooks([
      {
        id: 'wh_1',
        websiteId: 'site_acme_123',
        url: 'https://api.techflow.io/webhooks/acme-leads',
        secret: 'whsec_secret99887766',
        events: ['lead.captured', 'handoff.requested'],
        active: true,
        createdAt: new Date().toISOString(),
      }
    ]);
  }, []);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      websiteId: 'site_acme_123',
      name: newKeyName,
      key: `ak_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
    };
    setKeys([...keys, newKey]);
    setNewKeyName('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-400" /> API Keys & Webhooks Dispatcher
        </h2>
        <p className="text-slate-400 text-xs">
          Manage REST API authentication credentials and outgoing real-time webhook endpoints.
        </p>
      </div>

      {/* API Keys Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" /> Active REST API Keys
          </h3>
        </div>

        <form onSubmit={handleCreateKey} className="flex gap-3">
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. Staging Integration Key"
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="px-5 py-2 font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition shadow-glow flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Generate New Key
          </button>
        </form>

        <div className="divide-y divide-slate-800">
          {keys.map((k) => (
            <div key={k.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">{k.name}</div>
                <div className="font-mono text-slate-400 mt-1 flex items-center gap-2">
                  <span>{showKey[k.id] ? k.key : 'ak_live_••••••••••••••••••••'}</span>
                  <button
                    onClick={() => setShowKey({ ...showKey, [k.id]: !showKey[k.id] })}
                    className="text-slate-500 hover:text-slate-200"
                  >
                    {showKey[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="text-slate-500 text-[11px]">
                Created {new Date(k.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Radio className="w-4 h-4 text-purple-400" /> Webhook Integration Events
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Webhook Target Endpoint URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">Trigger Events</span>
          <div className="space-y-2 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-purple-500 rounded" />
              <span><code>lead.captured</code> — Dispatched whenever a website visitor submits contact details.</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-purple-500 rounded" />
              <span><code>handoff.requested</code> — Dispatched when visitor requests live human agent support.</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
