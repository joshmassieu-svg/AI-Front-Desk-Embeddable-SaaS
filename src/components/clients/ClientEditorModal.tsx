import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Bot, 
  BookOpen, 
  HelpCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Palette, 
  Globe,
  Sparkles,
  FileText,
  Database
} from 'lucide-react';
import { 
  ClientWebsite, 
  IndustryType, 
  ServiceItem, 
  FaqItem, 
  WidgetPosition,
  WidgetTemplateType,
  LauncherStyleType
} from '../../types';

interface ClientEditorModalProps {
  client?: ClientWebsite | null;
  onClose: () => void;
  onSave: (client: ClientWebsite) => void;
}

export const ClientEditorModal: React.FC<ClientEditorModalProps> = ({
  client,
  onClose,
  onSave
}) => {
  const isEditing = !!client;

  const [name, setName] = useState(client?.name || 'New Client Business');
  const [workspaceName, setWorkspaceName] = useState(
    client?.workspaceName || client?.name || 'New Website Workspace'
  );
  const [widgetTemplate, setWidgetTemplate] = useState<WidgetTemplateType>(
    client?.widgetTemplate || 'modern_soft'
  );
  const [launcherStyle, setLauncherStyle] = useState<LauncherStyleType>(
    client?.launcherStyle || 'pill'
  );
  const [widgetRadius, setWidgetRadius] = useState<'rounded-none' | 'rounded-lg' | 'rounded-2xl' | 'rounded-3xl'>(
    client?.widgetRadius || 'rounded-2xl'
  );
  const [industry, setIndustry] = useState<IndustryType>(client?.industry || 'healthcare_dental');
  const [websiteUrl, setWebsiteUrl] = useState(client?.websiteUrl || 'https://example-client.com');
  const [logoText, setLogoText] = useState(client?.logoText || 'Client Brand');
  const [primaryColor, setPrimaryColor] = useState(client?.primaryColor || '#0d9488');
  const [secondaryColor, setSecondaryColor] = useState(client?.secondaryColor || '#0f766e');
  const [widgetPosition, setWidgetPosition] = useState<WidgetPosition>(client?.widgetPosition || 'bottom-right');
  const [personaName, setPersonaName] = useState(client?.personaName || 'Chloe');
  const [personaRole, setPersonaRole] = useState(client?.personaRole || 'Virtual Front Desk Coordinator');
  const [welcomeMessage, setWelcomeMessage] = useState(
    client?.welcomeMessage || 'Hello! I am Chloe, your virtual assistant. How can I help you today?'
  );
  const [knowledgeBase, setKnowledgeBase] = useState(
    client?.knowledgeBase || `# About Our Business
- **Hours**: Monday to Friday, 9:00 AM - 5:00 PM
- **Location**: Downtown Office
- **Services**: Consultations, Appointments, and General Support`
  );
  const [unstructuredKnowledge, setUnstructuredKnowledge] = useState<string>(
    client?.unstructuredKnowledge || ''
  );
  const [knowledgeTab, setKnowledgeTab] = useState<'structured' | 'unstructured'>('structured');

  const [services, setServices] = useState<ServiceItem[]>(
    client?.services || [
      {
        id: 'srv_1',
        name: 'Standard Consultation',
        durationMinutes: 30,
        price: '$50',
        description: '30-minute initial consultation and review.'
      }
    ]
  );

  const [faqItems, setFaqItems] = useState<FaqItem[]>(
    client?.faqItems || [
      {
        id: 'faq_1',
        question: 'What are your hours of operation?',
        answer: 'We are open Monday through Friday from 9:00 AM to 5:00 PM.',
        category: 'General'
      }
    ]
  );

  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState<string | null>(null);

  const handleCrawlWebsite = async () => {
    if (!websiteUrl) {
      setCrawlStatus('Please enter a valid Website URL first.');
      return;
    }
    setIsCrawling(true);
    setCrawlStatus('Crawling website HTML & extracting Knowledge Base with AI...');
    try {
      const res = await fetch('/api/crawl-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl,
          clientName: name,
          industry
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.knowledgeBase) setKnowledgeBase(data.knowledgeBase);
        if (data.unstructuredKnowledge) setUnstructuredKnowledge(data.unstructuredKnowledge);
        if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
        if (data.services && Array.isArray(data.services)) setServices(data.services);
        if (data.faqs && Array.isArray(data.faqs)) setFaqItems(data.faqs);
        setCrawlStatus(`✓ Successfully crawled ${data.wordCount || 450} words from ${websiteUrl}. Structured & Unstructured KB updated!`);
      } else {
        setCrawlStatus(`Crawl error: ${data.error || 'Could not access target domain'}`);
      }
    } catch (err: any) {
      console.error('Crawl request error:', err);
      setCrawlStatus(`Crawl error: ${err.message || 'Server temporarily restarting or network unreachable. Please try again in a few seconds.'}`);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAddService = () => {
    const newSrv: ServiceItem = {
      id: `srv_${Date.now()}`,
      name: 'New Service Item',
      durationMinutes: 30,
      price: '$100',
      description: 'Describe the service...'
    };
    setServices([...services, newSrv]);
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: `faq_${Date.now()}`,
      question: 'New Question?',
      answer: 'Provide answer here...',
      category: 'General'
    };
    setFaqItems([...faqItems, newFaq]);
  };

  const handleRemoveFaq = (id: string) => {
    setFaqItems(faqItems.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrUpdated: ClientWebsite = {
      id: client?.id || `cl_${Date.now()}`,
      name,
      industry,
      websiteUrl,
      logoText,
      primaryColor,
      secondaryColor,
      widgetPosition,
      workspaceName,
      widgetTemplate,
      launcherStyle,
      widgetRadius,
      widgetTitle: 'Front Desk Assistant',
      personaName,
      personaRole,
      welcomeMessage,
      quickQuestions: faqItems.slice(0, 3).map(f => f.question),
      systemPrompt: `You are ${personaName}, the AI front desk assistant for ${name}. Assist visitors with questions and appointments.`,
      knowledgeBase,
      unstructuredKnowledge,
      faqItems,
      services,
      appointmentSettings: client?.appointmentSettings || {
        enabled: true,
        businessHours: { start: '08:00', end: '17:00', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        slotDurationMinutes: 30,
        requirePhone: true,
        requireReason: true,
        confirmationMessage: 'Your appointment has been booked!'
      },
      enableSoundEffects: true,
      enableLeadCapture: true,
      createdAt: client?.createdAt || new Date().toISOString()
    };

    onSave(newOrUpdated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isEditing ? `Edit Client: ${client.name}` : 'Create New Client Website Assistant'}
              </h3>
              <p className="text-xs text-slate-300">
                Configure persona, knowledge base markdown, services & appointment rules
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Basic Business Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-600" />
              1. Business Website Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Type
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as IndustryType)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="healthcare_dental">Healthcare & Dental</option>
                  <option value="hospitality_hotel">Hospitality & Hotels</option>
                  <option value="legal_law">Legal & Law Firm</option>
                  <option value="real_estate">Real Estate & Property</option>
                  <option value="saas_tech">SaaS & Tech</option>
                  <option value="agency">Agency & Consulting</option>
                  <option value="custom">Custom Industry</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Website URL *
                  </label>
                  <button
                    type="button"
                    onClick={handleCrawlWebsite}
                    disabled={isCrawling}
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isCrawling ? 'Crawling...' : 'Auto-Crawl KB'}</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand Color & Position
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <select
                    value={widgetPosition}
                    onChange={(e) => setWidgetPosition(e.target.value as WidgetPosition)}
                    className="flex-1 text-sm bg-white border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="bottom-right">Bottom Right Corner</option>
                    <option value="bottom-left">Bottom Left Corner</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website Workspace Name *
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Apex Dental Practice Workspace"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium"
                required
              />
            </div>
          </div>

          {/* Section 2: Widget Appearance & Theme Template */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                2. Widget Appearance &amp; Theme Template (Custom per Website)
              </h4>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Live Preview in Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Pick the aesthetic template and launcher button style that best matches this client website&apos;s brand.
            </p>

            {/* Template Card Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                {
                  id: 'modern_soft' as WidgetTemplateType,
                  title: 'Modern Soft',
                  desc: 'Soft shadows, friendly welcoming cards',
                  previewColor: 'bg-teal-500'
                },
                {
                  id: 'executive_clean' as WidgetTemplateType,
                  title: 'Executive Clean',
                  desc: 'Crisp borders, minimal sleek header',
                  previewColor: 'bg-slate-800'
                },
                {
                  id: 'friendly_rounded' as WidgetTemplateType,
                  title: 'Friendly Rounded',
                  desc: 'Playful curves, vibrant greeting banner',
                  previewColor: 'bg-emerald-500'
                },
                {
                  id: 'dark_minimal' as WidgetTemplateType,
                  title: 'Dark Minimalist',
                  desc: 'Sleek dark header, high contrast slate',
                  previewColor: 'bg-slate-900'
                },
                {
                  id: 'glass_morphism' as WidgetTemplateType,
                  title: 'Glass & Light',
                  desc: 'Frosted acrylic header, translucent badge',
                  previewColor: 'bg-indigo-600'
                }
              ].map((tpl) => {
                const active = widgetTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setWidgetTemplate(tpl.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`w-3.5 h-3.5 rounded-full ${tpl.previewColor}`} />
                        {active && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900">{tpl.title}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{tpl.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Launcher Style & Corner Radius Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Launcher Button Style
                </label>
                <select
                  value={launcherStyle}
                  onChange={(e) => setLauncherStyle(e.target.value as LauncherStyleType)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium"
                >
                  <option value="pill">Floating Pill Button (Title + Icon)</option>
                  <option value="circle">Circle Icon Button</option>
                  <option value="avatar">Assistant Avatar Circle Button</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Widget Border Radius
                </label>
                <select
                  value={widgetRadius}
                  onChange={(e) => setWidgetRadius(e.target.value as any)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium"
                >
                  <option value="rounded-lg">Sharp / Contemporary (8px)</option>
                  <option value="rounded-2xl">Standard Smooth (16px)</option>
                  <option value="rounded-3xl">Extra Rounded (24px)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: AI Front Desk Persona */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-600" />
              2. AI Front Desk Assistant Persona
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Persona Name
                </label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="e.g. Claire, Marco, Elena"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Persona Title / Role
                </label>
                <input
                  type="text"
                  value={personaRole}
                  onChange={(e) => setPersonaRole(e.target.value)}
                  placeholder="e.g. Patient Intake & Appointment Specialist"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Welcome Greeting Message
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={2}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3"
                required
              />
            </div>
          </div>

          {/* Section 3: AI Knowledge Structuring */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    3. AI Knowledge Structuring
                  </h4>
                  <p className="text-xs text-slate-500">
                    Manage both structured rules and complete unstructured website text
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCrawlWebsite}
                disabled={isCrawling}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 self-start sm:self-auto"
                title="Fetch site content and extract business hours, services, and FAQ items automatically"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isCrawling ? 'Crawling Website...' : 'Crawl Website & Sync KB'}</span>
              </button>
            </div>

            {crawlStatus && (
              <div className={`p-2.5 rounded-lg text-xs font-medium border ${
                crawlStatus.includes('error') || crawlStatus.includes('failed')
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                {crawlStatus}
              </div>
            )}

            {/* Tab Switcher: Structured vs Unstructured */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg w-fit text-xs font-semibold">
              <button
                type="button"
                onClick={() => setKnowledgeTab('structured')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  knowledgeTab === 'structured'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Structured Knowledge Base</span>
              </button>
              <button
                type="button"
                onClick={() => setKnowledgeTab('unstructured')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  knowledgeTab === 'unstructured'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Unstructured Knowledge</span>
                {unstructuredKnowledge.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px]">
                    {unstructuredKnowledge.split(' ').length} words
                  </span>
                )}
              </button>
            </div>

            {knowledgeTab === 'structured' ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  The Gemini AI assistant uses this Markdown guide to answer questions about hours, policies, insurance, and pricing.
                </p>
                <textarea
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  rows={6}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-3 leading-relaxed focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter markdown facts about the business..."
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200/70 text-xs text-teal-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Complete Website Text Repository
                  </p>
                  <p className="text-teal-800">
                    All text found on the website upon adding the link of the client website is stored here. Our AI Front Desk assistant searches this unstructured knowledge to answer deep or specific customer questions not covered by the structured summary.
                  </p>
                </div>
                <textarea
                  value={unstructuredKnowledge}
                  onChange={(e) => setUnstructuredKnowledge(e.target.value)}
                  rows={8}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-3 leading-relaxed focus:ring-2 focus:ring-teal-500"
                  placeholder="Crawl a website above to automatically extract and populate all website text..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Characters: {unstructuredKnowledge.length.toLocaleString()} / 35,000</span>
                  <span>Words: {unstructuredKnowledge.split(/\s+/).filter(Boolean).length.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Services Offered */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                4. Bookable Services / Offerings
              </h4>
              <button
                type="button"
                onClick={handleAddService}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Service
              </button>
            </div>
            <div className="space-y-3">
              {services.map((srv, index) => (
                <div key={srv.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    value={srv.name}
                    onChange={(e) => {
                      const copy = [...services];
                      copy[index].name = e.target.value;
                      setServices(copy);
                    }}
                    placeholder="Service Name"
                    className="flex-1 text-xs border border-slate-300 rounded-md px-2 py-1.5 font-semibold"
                  />
                  <input
                    type="text"
                    value={srv.price || ''}
                    onChange={(e) => {
                      const copy = [...services];
                      copy[index].price = e.target.value;
                      setServices(copy);
                    }}
                    placeholder="Price ($99)"
                    className="w-24 text-xs border border-slate-300 rounded-md px-2 py-1.5"
                  />
                  <input
                    type="number"
                    value={srv.durationMinutes}
                    onChange={(e) => {
                      const copy = [...services];
                      copy[index].durationMinutes = parseInt(e.target.value) || 30;
                      setServices(copy);
                    }}
                    placeholder="Min"
                    className="w-16 text-xs border border-slate-300 rounded-md px-2 py-1.5 text-center"
                    title="Duration in minutes"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveService(srv.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                    title="Remove Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: FAQs */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                5. Frequently Asked Questions
              </h4>
              <button
                type="button"
                onClick={handleAddFaq}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add FAQ
              </button>
            </div>
            <div className="space-y-3">
              {faqItems.map((faq, idx) => (
                <div key={faq.id} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Q:</span>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const copy = [...faqItems];
                        copy[idx].question = e.target.value;
                        setFaqItems(copy);
                      }}
                      className="flex-1 text-xs font-semibold border border-slate-300 rounded-md px-2 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(faq.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">A:</span>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const copy = [...faqItems];
                        copy[idx].answer = e.target.value;
                        setFaqItems(copy);
                      }}
                      rows={2}
                      className="flex-1 text-xs border border-slate-300 rounded-md p-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Client Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
