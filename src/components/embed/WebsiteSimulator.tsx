import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  SlidersHorizontal, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ArrowRight, 
  Sparkles,
  Award,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { ClientWebsite, AppointmentItem, LeadItem } from '../../types';
import { FrontDeskWidget } from '../widget/FrontDeskWidget';

interface WebsiteSimulatorProps {
  client: ClientWebsite;
  onUpdateClient: (updated: ClientWebsite) => void;
  onAppointmentBooked?: (appointment: AppointmentItem) => void;
  onLeadCaptured?: (lead: LeadItem) => void;
}

export const WebsiteSimulator: React.FC<WebsiteSimulatorProps> = ({
  client,
  onUpdateClient,
  onAppointmentBooked,
  onLeadCaptured
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [embedMode, setEmbedMode] = useState<'floating' | 'inline'>('floating');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);

  // Editable customizer state
  const [editPrimaryColor, setEditPrimaryColor] = useState(client.primaryColor);
  const [editPersonaName, setEditPersonaName] = useState(client.personaName);
  const [editWelcomeMessage, setEditWelcomeMessage] = useState(client.welcomeMessage);
  const [editPosition, setEditPosition] = useState(client.widgetPosition);

  const handleApplyCustomizer = () => {
    const updated: ClientWebsite = {
      ...client,
      primaryColor: editPrimaryColor,
      personaName: editPersonaName,
      welcomeMessage: editWelcomeMessage,
      widgetPosition: editPosition
    };
    onUpdateClient(updated);
    setShowCustomizer(false);
    setWidgetKey(prev => prev + 1);
  };

  const getContainerWidthClass = () => {
    switch (device) {
      case 'desktop': return 'w-full max-w-6xl';
      case 'tablet': return 'w-[768px] max-w-full';
      case 'mobile': return 'w-[390px] max-w-full';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 overflow-hidden">
      {/* Simulator Control Toolbar */}
      <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">LIVE EMBED SANDBOX</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Simulating: <strong className="text-white">{client.name}</strong> ({client.websiteUrl})
          </span>
        </div>

        {/* Center: Device & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'desktop' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'tablet' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'mobile' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Embed mode toggle */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setEmbedMode('floating')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                embedMode === 'floating'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Floating Corner Bubble
            </button>
            <button
              onClick={() => setEmbedMode('inline')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                embedMode === 'inline'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inline Section Embed
            </button>
          </div>
        </div>

        {/* Right Actions: Reload Widget & Customize Drawer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWidgetKey(prev => prev + 1)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Reset & Reload Widget Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showCustomizer
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Widget Customizer
          </button>
        </div>
      </div>

      {/* Main Simulator Viewport + Optional Customizer Drawer */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-950 p-4 sm:p-6 justify-center overflow-y-auto">
        {/* Simulated Website Frame */}
        <div
          className={`${getContainerWidthClass()} bg-white text-slate-800 rounded-2xl shadow-2xl overflow-y-auto border border-slate-800 transition-all duration-300 relative flex flex-col [transform:translate3d(0,0,0)]`}
          style={{ minHeight: '100%' }}
        >
          {/* Simulated Browser URL bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1 text-xs text-slate-600 font-mono flex items-center justify-between">
              <span>{client.websiteUrl}</span>
              <span className="text-[10px] text-teal-600 font-bold uppercase">SSL Secured</span>
            </div>
          </div>

          {/* SIMULATED CLIENT WEBSITE BODY (Adapted to Client Industry) */}
          <div className="flex-1 flex flex-col">
            {/* 1. INDUSTRY: DENTAL PRACTICE (Apex Dental) */}
            {client.industry === 'healthcare_dental' && (
              <div className="flex-1 flex flex-col">
                {/* Dental Hero Header */}
                <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white px-6 sm:px-12 py-12 sm:py-16">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-4 border border-teal-500/30">
                      <Award className="w-3.5 h-3.5" />
                      Voted #1 Family Dental Practice in Austin
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                      Modern, Pain-Free Dental Care for Your Whole Family.
                    </h1>
                    <p className="mt-4 text-slate-200 text-sm sm:text-base leading-relaxed">
                      Experience state-of-the-art preventative cleaning, laser whitening, and Invisalign orthodontic care with zero stress.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {}}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl shadow-lg transition-colors"
                      >
                        Book Your $99 New Patient Exam
                      </button>
                      <span className="text-xs text-teal-200">
                        ✨ Or chat with Claire, our AI assistant in the corner!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dental Services Grid */}
                <div className="px-6 sm:px-12 py-10 bg-slate-50">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Our Core Dental Services</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {client.services.map((srv) => (
                      <div key={srv.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{srv.price}</span>
                        <h3 className="font-bold text-slate-900 mt-1">{srv.name}</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{srv.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline Embed Section (Rendered if mode === 'inline') */}
                {embedMode === 'inline' && (
                  <div className="px-6 sm:px-12 py-10 bg-white border-t border-slate-200">
                    <div className="max-w-2xl mx-auto">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Virtual Patient Intake & Booking Desk</h2>
                        <p className="text-sm text-slate-500">
                          Chat with {client.personaName} directly below to schedule your cleaning or ask insurance questions.
                        </p>
                      </div>
                      <div className="h-[580px]">
                        <FrontDeskWidget
                          key={`inline_${widgetKey}`}
                          client={client}
                          mode="inline"
                          onAppointmentBooked={onAppointmentBooked}
                          onLeadCaptured={onLeadCaptured}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. INDUSTRY: HOSPITALITY / HOTEL (The Grandeur Hotel) */}
            {client.industry === 'hospitality_hotel' && (
              <div className="flex-1 flex flex-col">
                <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-black text-white px-6 sm:px-12 py-14 sm:py-20">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-4 border border-amber-500/30">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      5-Star Luxury Manhattan Sanctuary
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight font-serif">
                      Timeless Elegance Overlooking Central Park.
                    </h1>
                    <p className="mt-4 text-amber-100 text-sm sm:text-base leading-relaxed">
                      Indulge in our rooftop sapphire dining, 24K gold cellular spa treatments, and private valet concierge.
                    </p>
                  </div>
                </div>

                {/* Hotel Amenities Grid */}
                <div className="px-6 sm:px-12 py-10 bg-amber-50/40">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Exclusive Guest Amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {client.services.map((srv) => (
                      <div key={srv.id} className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{srv.price}</span>
                        <h3 className="font-bold text-slate-900 mt-1">{srv.name}</h3>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{srv.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {embedMode === 'inline' && (
                  <div className="px-6 sm:px-12 py-10 bg-white border-t border-slate-200">
                    <div className="max-w-2xl mx-auto">
                      <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Concierge Desk & Reservations</h2>
                      <div className="h-[580px]">
                        <FrontDeskWidget
                          key={`inline_hotel_${widgetKey}`}
                          client={client}
                          mode="inline"
                          onAppointmentBooked={onAppointmentBooked}
                          onLeadCaptured={onLeadCaptured}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. OTHER INDUSTRIES (Law Firm, Real Estate, Custom) */}
            {client.industry !== 'healthcare_dental' && client.industry !== 'hospitality_hotel' && (
              <div className="flex-1 flex flex-col">
                <div
                  className="px-6 sm:px-12 py-14 text-white"
                  style={{ backgroundColor: client.primaryColor || '#1e40af' }}
                >
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
                      <Sparkles className="w-3.5 h-3.5" />
                      {client.name}
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                      {client.name} — Trusted Professional Services.
                    </h1>
                    <p className="mt-4 text-white/90 text-sm sm:text-base leading-relaxed">
                      Connect with our specialists for free consultations, property tours, or immediate answers to your questions.
                    </p>
                  </div>
                </div>

                <div className="px-6 sm:px-12 py-10 bg-slate-50">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Featured Services & Offerings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {client.services.map((srv) => (
                      <div key={srv.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{srv.price}</span>
                        <h3 className="font-bold text-slate-900 mt-1">{srv.name}</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{srv.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {embedMode === 'inline' && (
                  <div className="px-6 sm:px-12 py-10 bg-white border-t border-slate-200">
                    <div className="max-w-2xl mx-auto">
                      <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Interactive Customer Portal</h2>
                      <div className="h-[580px]">
                        <FrontDeskWidget
                          key={`inline_other_${widgetKey}`}
                          client={client}
                          mode="inline"
                          onAppointmentBooked={onAppointmentBooked}
                          onLeadCaptured={onLeadCaptured}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Simulated Website Footer */}
            <div className="bg-slate-900 text-slate-400 px-6 sm:px-12 py-8 mt-auto border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-white">{client.name}</p>
                <p className="mt-1">© 2026 {client.name}. All Rights Reserved.</p>
              </div>
              <div className="flex items-center gap-4">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Contact Us</span>
              </div>
            </div>
          </div>

          {/* 4. FLOATING CORNER WIDGET (Rendered if mode === 'floating') */}
          {embedMode === 'floating' && (
            <FrontDeskWidget
              key={`floating_${widgetKey}`}
              client={client}
              mode="floating"
              onAppointmentBooked={onAppointmentBooked}
              onLeadCaptured={onLeadCaptured}
              defaultOpen={false}
            />
          )}
        </div>

        {/* 5. OPTIONAL WIDGET CUSTOMIZER DRAWER */}
        {showCustomizer && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 overflow-y-auto z-40 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                Live Widget Customizer
              </h3>
              <button
                onClick={() => setShowCustomizer(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editPrimaryColor}
                    onChange={(e) => setEditPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                  />
                  <input
                    type="text"
                    value={editPrimaryColor}
                    onChange={(e) => setEditPrimaryColor(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Persona Name
                </label>
                <input
                  type="text"
                  value={editPersonaName}
                  onChange={(e) => setEditPersonaName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Welcome Greeting Message
                </label>
                <textarea
                  value={editWelcomeMessage}
                  onChange={(e) => setEditWelcomeMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Widget Position
                </label>
                <select
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="bottom-right">Bottom Right corner</option>
                  <option value="bottom-left">Bottom Left corner</option>
                  <option value="bottom-center">Bottom Center</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleApplyCustomizer}
              className="mt-6 w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
            >
              Apply Changes & Reload Sandbox
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
