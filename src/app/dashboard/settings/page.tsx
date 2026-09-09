'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, CreditCard, Shield, Globe, Bell, Save, Check } from 'lucide-react';
import { useWebsite } from '@/context/website-context';

export default function SettingsPage() {
  const { currentSite } = useWebsite();
  const [orgName, setOrgName] = useState('Acme Technologies');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [leadAlerts, setLeadAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" /> Account & Workspace Settings
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Configure your workspace preferences, general organization profile, and notification rules.
        </p>
      </div>

      {/* Subscription Billing Quick Link Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50/50 via-white to-purple-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-600 text-white shadow-sm shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Subscription Plans & Quota Limits</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Looking to upgrade your tier, check conversation usage, or review plan comparison feature tables?
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/billing"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0 text-center"
        >
          View Plans & Billing →
        </Link>
      </div>

      {/* Account Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Workspace Identity */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-600" /> Organization & Active Site
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Active Website Context</label>
              <input
                type="text"
                readOnly
                value={currentSite ? `${currentSite.name} (${currentSite.domain})` : 'Default Workspace'}
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Alert Preferences */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" /> Email & Alert Notifications
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-slate-800">Weekly Analytics Report</div>
                <div className="text-[11px] text-slate-500">Receive a weekly summary of AI chat volume and visitor engagement.</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-slate-800">Instant Lead Alert Emails</div>
                <div className="text-[11px] text-slate-500">Get notified instantly when a visitor completes a lead capture form.</div>
              </div>
              <input
                type="checkbox"
                checked={leadAlerts}
                onChange={(e) => setLeadAlerts(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </label>
          </div>
        </div>

        {/* Security & Access */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" /> Security & Support Inquiries
          </h3>

          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-800">Two-Factor Authentication (2FA)</div>
              <div className="text-slate-500 text-[11px]">Enforce 2FA for all workspace team members.</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
              Disabled
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs flex justify-between items-center">
            <div>
              <span className="font-semibold text-slate-800">General Support & Account Inquiries</span>
              <div className="text-slate-500 text-[11px]">Email our dedicated helpdesk team directly.</div>
            </div>
            <a
              href="mailto:info@flowdexx.com"
              className="text-brand-600 hover:underline font-bold text-xs"
            >
              info@flowdexx.com
            </a>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Settings updated successfully
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
