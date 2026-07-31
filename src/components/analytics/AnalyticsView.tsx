import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles,
  Globe,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { AnalyticsSummary, ClientWebsite } from '../../types';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary;
  clients: ClientWebsite[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  clients
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            AI Front Desk SaaS Analytics & Performance
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Aggregated conversion rates, inquiry volume, and knowledge base insights across your embeddable widgets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Conversion Rate: +8.4% vs last month
          </span>
        </div>
      </div>

      {/* Top Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Embed Loads</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {analytics.totalEmbedLoads.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              99.98% widget uptime
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Active Conversations</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {analytics.totalConversations.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Avg {analytics.avgResponseTimeSeconds}s response time
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Captured Leads</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {analytics.totalLeadsCaptured.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              +14% lead form completion
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Booked Appointments</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {analytics.totalAppointmentsBooked.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 font-bold mt-1">
              {analytics.conversionRatePercent}% booking conversion
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid Section: Client Sites Breakdown & Top Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Client Site Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Client Websites Performance Breakdown</h2>
            <span className="text-xs text-slate-500">Sorted by total engagement</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <th className="py-3 px-6">Client Website</th>
                  <th className="py-3 px-4 text-right">Conversations</th>
                  <th className="py-3 px-4 text-right">Leads</th>
                  <th className="py-3 px-4 text-right">Appointments</th>
                  <th className="py-3 px-6 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {analytics.clientStats.map((stat) => {
                  const clientObj = clients.find(c => c.id === stat.clientId);
                  const convRate = stat.conversations > 0 
                    ? Math.round(((stat.leads + stat.appointments) / stat.conversations) * 100) 
                    : 0;
                  return (
                    <tr key={stat.clientId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: clientObj?.primaryColor || '#0d9488' }}
                          />
                          <div>
                            <p className="font-bold text-slate-900">{stat.clientName}</p>
                            <p className="text-xs text-slate-400 font-mono">{stat.clientId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                        {stat.conversations}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-amber-700">
                        {stat.leads}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        {stat.appointments}
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs">
                          {convRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Top Frequently Asked Questions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              Top Visitor FAQs
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              AI Insights
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Most frequent questions asked by visitors across your embedded widgets. Use this to optimize your client knowledge base markdown.
          </p>

          <div className="space-y-3 pt-2">
            {analytics.topQuestions.map((q, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-700">{q.category}</span>
                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {q.count} queries
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  &quot;{q.question}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
