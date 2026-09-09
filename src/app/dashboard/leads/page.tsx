'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Download,
  Search,
  Mail,
  Phone,
  Building,
  Globe,
  Calendar,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { useWebsite } from '@/context/website-context';

export default function LeadsPage() {
  const { currentSiteId } = useWebsite();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [leadsError, setLeadsError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [currentSiteId]);

  const fetchLeads = async () => {
    if (!currentSiteId) return;
    try {
      const res = await fetch(`/api/v1/leads?websiteId=${currentSiteId}`);
      if (!res.ok) throw new Error(`Failed to load leads (${res.status})`);
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
      setLeadsError(null);
    } catch (err) {
      console.error(err);
      setLeadsError('Could not load your leads. Please refresh the page.');
    }
  };

  const loadSampleLeads = () => {
    const samples: Lead[] = [
      {
        id: 'lead_demo_1',
        websiteId: currentSiteId || 'site_default',
        name: 'Jordan Belfort',
        email: 'jordan@stratton.com',
        company: 'Stratton Oakmont',
        phone: '+1 (555) 019-2834',
        sourceUrl: '/pricing',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'lead_demo_2',
        websiteId: currentSiteId || 'site_default',
        name: 'Elena Rostova',
        email: 'elena.rostova@techsolutions.io',
        company: 'TechSolutions Global',
        phone: '+1 (555) 438-9921',
        sourceUrl: '/features',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'lead_demo_3',
        websiteId: currentSiteId || 'site_default',
        name: 'Marcus Vance',
        email: 'marcus@vancemedia.co',
        company: 'Vance Media Group',
        phone: '+1 (555) 882-1049',
        sourceUrl: '/demo',
        createdAt: new Date().toISOString(),
      },
    ];
    setLeads(samples);
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {leadsError && (
        <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {leadsError}
        </div>
      )}
      {/* Informative Lead Capture Banner */}
      <div className="bg-purple-50/70 border border-purple-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0 mt-0.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">How Lead Capture Works</h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              When visitors chat with your AI assistant widget, it prompts for contact details (Name, Email, Company, Phone) before routing complex requests. All leads appear here instantly and can be exported to CSV.
            </p>
          </div>
        </div>

        {leads.length === 0 && (
          <button
            onClick={loadSampleLeads}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Leads
          </button>
        )}
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" /> Leads CRM & Visitor Capture
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Qualified contacts gathered automatically by your website AI assistant widget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/v1/leads/export?websiteId=${currentSiteId}`}
            download
            className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Total Captured Leads</div>
          <div className="text-2xl font-bold text-slate-900">{leads.length}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Verified contacts</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Top Lead Source</div>
          <div className="text-2xl font-bold text-slate-900">
            {leads.length > 0
              ? Object.entries(
                  leads.reduce((acc, l) => {
                    const src = l.sourceUrl || 'Direct Chat';
                    acc[src] = (acc[src] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1])[0][0]
              : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {leads.length > 0 ? 'Highest conversion source' : 'No leads captured yet'}
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or company..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white transition"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-bold">Lead Name</th>
                <th className="px-6 py-3.5 font-bold">Email Address</th>
                <th className="px-6 py-3.5 font-bold">Company</th>
                <th className="px-6 py-3.5 font-bold">Phone</th>
                <th className="px-6 py-3.5 font-bold">Source Page</th>
                <th className="px-6 py-3.5 font-bold">Date Captured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px]">
                      {lead.name.charAt(0)}
                    </div>
                    {lead.name}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-purple-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {lead.company ? (
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" /> {lead.company}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {lead.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                      <Globe className="w-3.5 h-3.5 text-brand-600 shrink-0" /> {lead.sourceUrl || '/'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-[11px] font-medium">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
