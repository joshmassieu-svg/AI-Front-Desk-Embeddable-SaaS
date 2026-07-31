import React, { useState } from 'react';
import { 
  Inbox, 
  Calendar, 
  MessageSquare, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Tag, 
  ExternalLink,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  ClientWebsite, 
  LeadItem, 
  AppointmentItem, 
  Conversation,
  LeadStatus,
  AppointmentStatus
} from '../../types';

interface InboxViewProps {
  clients: ClientWebsite[];
  leads: LeadItem[];
  appointments: AppointmentItem[];
  conversations: Conversation[];
  selectedClientId: string;
  onUpdateLeadStatus: (id: string, status: LeadStatus) => void;
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  clients,
  leads,
  appointments,
  conversations,
  selectedClientId,
  onUpdateLeadStatus,
  onUpdateAppointmentStatus
}) => {
  const [subTab, setSubTab] = useState<'leads' | 'appointments' | 'transcripts'>('leads');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    if (filterClient !== 'all' && l.clientId !== filterClient) return false;
    if (
      searchTerm &&
      !l.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !l.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !l.reasonOrInquiry.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (filterClient !== 'all' && a.clientId !== filterClient) return false;
    if (
      searchTerm &&
      !a.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !a.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filtered Conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterClient !== 'all' && c.clientId !== filterClient) return false;
    if (
      searchTerm &&
      !c.summary.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.visitorName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.name || id;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">New Lead</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Contacted</span>;
      case 'qualified':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Qualified</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Confirmed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Inbox Header & Search/Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-amber-600" />
            CRM Inbox & Captured Inquiries
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time leads, booked appointments, and AI chat transcripts across your embeddable widgets.
          </p>
        </div>

        {/* Client Filter & Search bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <label htmlFor="inbox-search-input" className="sr-only">Search leads or appointments</label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="inbox-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search visitors or notes..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm w-60 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <label htmlFor="inbox-client-filter" className="sr-only">Filter by client website</label>
            <select
              id="inbox-client-filter"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="all">All Client Websites ({clients.length})</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setSubTab('leads')}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'leads'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Captured Leads</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
            {filteredLeads.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('appointments')}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'appointments'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Booked Appointments</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {filteredAppointments.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('transcripts')}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'transcripts'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Chat Transcripts</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-bold">
            {filteredConversations.length}
          </span>
        </button>
      </div>

      {/* Tab 1: CAPTURED LEADS LIST */}
      {subTab === 'leads' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No leads match your filter criteria</p>
              <p className="text-xs mt-1">Visitors who submit contact forms or request callbacks in the widget appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-slate-900 text-base">{lead.visitorName}</span>
                      {getStatusBadge(lead.status)}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {getClientName(lead.clientId)}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {new Date(lead.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      &quot;{lead.reasonOrInquiry}&quot;
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-teal-600">
                        <Mail className="w-3.5 h-3.5" />
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-teal-600">
                          <Phone className="w-3.5 h-3.5" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.notes && (
                        <span className="text-slate-400 italic">Notes: {lead.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Status Dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor={`lead-status-select-${lead.id}`} className="sr-only">Update lead status for {lead.visitorName}</label>
                    <select
                      id={`lead-status-select-${lead.id}`}
                      value={lead.status}
                      onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden"
                    >
                      <option value="new">Mark as New</option>
                      <option value="contacted">Mark Contacted</option>
                      <option value="qualified">Mark Qualified</option>
                      <option value="booked">Mark Booked</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: BOOKED APPOINTMENTS */}
      {subTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No appointments booked yet</p>
              <p className="text-xs mt-1">Visitors who book services through the AI Front Desk widget will be listed here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-slate-900 text-base">{apt.visitorName}</span>
                      {getStatusBadge(apt.status)}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                        {apt.serviceName} ({apt.durationMinutes}m)
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {getClientName(apt.clientId)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-bold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        {new Date(apt.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        {apt.time} AM/PM
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <a href={`mailto:${apt.visitorEmail}`} className="flex items-center gap-1 hover:text-teal-600">
                        <Mail className="w-3.5 h-3.5" />
                        {apt.visitorEmail}
                      </a>
                      {apt.visitorPhone && (
                        <a href={`tel:${apt.visitorPhone}`} className="flex items-center gap-1 hover:text-teal-600">
                          <Phone className="w-3.5 h-3.5" />
                          {apt.visitorPhone}
                        </a>
                      )}
                      {apt.notes && (
                        <span className="text-slate-400 italic">{apt.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Appointment Status select */}
                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor={`apt-status-select-${apt.id}`} className="sr-only">Update appointment status for {apt.visitorName}</label>
                    <select
                      id={`apt-status-select-${apt.id}`}
                      value={apt.status}
                      onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                      className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="rescheduled">Rescheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: CHAT TRANSCRIPTS */}
      {subTab === 'transcripts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredConversations.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No chat transcripts found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredConversations.map((conv) => (
                <div key={conv.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900">{conv.visitorName || 'Anonymous Visitor'}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {getClientName(conv.clientId)}
                      </span>
                      {conv.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(conv.lastActive).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    💡 <strong className="text-slate-900">Summary:</strong> {conv.summary}
                  </p>

                  <div className="space-y-1.5 pl-3 border-l-2 border-slate-200">
                    {conv.messages.map((m) => (
                      <p key={m.id} className="text-xs text-slate-600">
                        <strong className={m.sender === 'user' ? 'text-slate-900' : 'text-teal-700'}>
                          {m.sender === 'user' ? 'Visitor' : 'Assistant'}:
                        </strong>{' '}
                        {m.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
