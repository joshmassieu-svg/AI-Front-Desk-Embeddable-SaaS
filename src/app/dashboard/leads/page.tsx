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
} from 'lucide-react';
import { Lead } from '@/lib/types';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/v1/leads?websiteId=site_acme_123');
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> Leads CRM & Visitor Capture
          </h2>
          <p className="text-slate-400 text-xs">
            Qualified contacts gathered automatically by your website AI assistant widget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/v1/leads/export?websiteId=site_acme_123"
            download
            className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition shadow-glow flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Total Captured Leads</div>
          <div className="text-2xl font-bold text-white">{leads.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">100% verified emails</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Lead Conversion Rate</div>
          <div className="text-2xl font-bold text-white">14.2%</div>
          <div className="text-[11px] text-slate-400 mt-1">From visitor chat prompts</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Top Converting Page</div>
          <div className="text-2xl font-bold text-white">/pricing</div>
          <div className="text-[11px] text-slate-400 mt-1">62% of leads originated here</div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or company..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="text-xs text-slate-400">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Lead Name</th>
                <th className="px-6 py-3.5 font-semibold">Email Address</th>
                <th className="px-6 py-3.5 font-semibold">Company</th>
                <th className="px-6 py-3.5 font-semibold">Phone</th>
                <th className="px-6 py-3.5 font-semibold">Source Page</th>
                <th className="px-6 py-3.5 font-semibold">Date Captured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[11px]">
                      {lead.name.charAt(0)}
                    </div>
                    {lead.name}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-purple-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {lead.company ? (
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" /> {lead.company}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {lead.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <span className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                      <Globe className="w-3.5 h-3.5 text-brand-400 shrink-0" /> {lead.sourceUrl || '/'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-[11px]">
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
