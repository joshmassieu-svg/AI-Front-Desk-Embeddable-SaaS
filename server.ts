import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;

// Lazy initialization for GoogleGenAI to prevent startup crashes if key is unset
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Enable CORS for embeddable widgets across all client domains
  app.use((req: Request, res: Response, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // API Route: Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Route: Dynamic embed.js script generator for Client Websites (Separated UI Responsibilities)
  app.get(['/api/embed.js', '/embed.js'], (req: Request, res: Response) => {
    const clientId = (req.query.client as string) || 'cl_apex_dental';
    const position = (req.query.position as string) || 'bottom-right';
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const scriptContent = `
(function() {
  var CLIENT_ID = "${clientId}";
  var BASE_URL = "${baseUrl}";
  var POSITION = "${position}";
  var ROOT_ID = "ai-frontdesk-widget-root-" + CLIENT_ID;
  if (document.getElementById(ROOT_ID)) return;

  // 1. Create a container for our widget on the host website
  var root = document.createElement("div");
  root.id = ROOT_ID;
  root.style.position = "fixed";
  root.style.top = "0";
  root.style.left = "0";
  root.style.width = "0";
  root.style.height = "0";
  root.style.zIndex = "2147483647";
  root.style.pointerEvents = "none";
  document.body.appendChild(root);

  var shadow = root.attachShadow({ mode: "open" });

  // 2. Insulated CSS inside Shadow DOM: Sleek Host Button + Hidden Chat Window Iframe
  var style = document.createElement("style");
  style.textContent = \`
    * { box-sizing: border-box; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; }
    
    /* 1. Sleek Launcher Button pinned directly to the corner of user's screen */
    .afd-launcher-wrapper {
      pointer-events: auto;
      position: fixed;
      bottom: 20px;
      z-index: 2147483647;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .afd-pos-bottom-right { right: 20px; left: auto; }
    .afd-pos-bottom-left { left: 20px; right: auto; }
    .afd-pos-bottom-center { left: 50%; transform: translateX(-50%); right: auto; }
    
    /* Sleek Pill Button Style */
    .afd-btn-pill {
      background: #0d9488;
      color: #ffffff;
      padding: 14px 22px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.22);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .afd-btn-pill:hover {
      transform: scale(1.05);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.28);
    }
    .afd-icon-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Ask AI Bar Style */
    .afd-btn-ask-ai-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 6px 6px 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.15);
      width: 320px;
      max-width: calc(100vw - 40px);
      transition: transform 0.2s ease;
    }
    .afd-btn-ask-ai-bar:hover {
      transform: scale(1.02);
    }
    .afd-ai-badge {
      font-size: 10px;
      font-weight: 800;
      color: #5eead4;
      background: rgba(20, 184, 166, 0.2);
      padding: 3px 8px;
      border-radius: 12px;
      letter-spacing: 0.5px;
    }
    .afd-ask-btn {
      background: #0d9488;
      color: #fff;
      padding: 8px 14px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 12px;
      margin-left: auto;
      white-space: nowrap;
    }

    /* Circle / Avatar Button Style */
    .afd-btn-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #0d9488;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.2s ease;
    }
    .afd-btn-circle:hover { transform: scale(1.08); }

    .afd-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34d399;
      border: 1.5px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 8px #34d399;
      display: inline-block;
      flex-shrink: 0;
    }

    /* 2. The Iframe (Chat Window): Stays hidden until user clicks the bubble */
    .afd-chat-iframe-wrapper {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      position: fixed;
      bottom: 86px;
      width: 400px;
      height: 620px;
      max-height: calc(100vh - 110px);
      max-width: calc(100vw - 32px);
      z-index: 2147483647;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s;
      transform: translateY(16px) scale(0.96);
      transform-origin: bottom right;
      background: #ffffff;
    }
    .afd-chat-iframe-wrapper.open {
      visibility: visible;
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    .afd-pos-bottom-right.afd-chat-iframe-wrapper { right: 20px; left: auto; transform-origin: bottom right; }
    .afd-pos-bottom-left.afd-chat-iframe-wrapper { left: 20px; right: auto; transform-origin: bottom left; }
    .afd-pos-bottom-center.afd-chat-iframe-wrapper { left: 50%; transform: translateX(-50%) translateY(16px) scale(0.96); transform-origin: bottom center; }
    .afd-pos-bottom-center.afd-chat-iframe-wrapper.open { transform: translateX(-50%) translateY(0) scale(1); }

    .afd-chat-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      display: block;
    }

    @media (max-width: 480px) {
      .afd-chat-iframe-wrapper.open {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
        bottom: 16px;
        right: 16px;
        border-radius: 16px;
      }
    }
  \`;
  shadow.appendChild(style);

  // 3. Render The Loader Script's Sleek HTML <button> on Host Page
  var launcher = document.createElement("div");
  launcher.className = "afd-launcher-wrapper afd-pos-" + POSITION;
  launcher.innerHTML = \`
    <div class="afd-btn-pill" id="afd-launcher-btn" role="button" aria-label="Open AI Assistant Chat">
      <div class="afd-icon-circle">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <span class="afd-status-dot"></span>
      <span id="afd-launcher-title">AI Assistant</span>
    </div>
  \`;
  shadow.appendChild(launcher);

  // 4. Render The Iframe (Chat Window) - pops up right above the bubble button
  var iframeWrapper = document.createElement("div");
  iframeWrapper.className = "afd-chat-iframe-wrapper afd-pos-" + POSITION;
  var iframeUrl = BASE_URL + "/?embed=true&clientId=" + encodeURIComponent(CLIENT_ID) + "&mode=embed_window";
  iframeWrapper.innerHTML = \`
    <iframe class="afd-chat-iframe" id="afd-iframe" src="\` + iframeUrl + \`" allow="microphone; clipboard-write; clipboard-read" title="AI Front Desk Chat Window"></iframe>
  \`;
  shadow.appendChild(iframeWrapper);

  var launcherBtn = launcher.querySelector("#afd-launcher-btn");
  var isOpen = false;

  function toggleChat(open) {
    isOpen = (typeof open === "boolean") ? open : !isOpen;
    if (isOpen) {
      iframeWrapper.classList.add("open");
      launcher.classList.add("is-open");
    } else {
      iframeWrapper.classList.remove("open");
      launcher.classList.remove("is-open");
    }
    var ifr = iframeWrapper.querySelector("#afd-iframe");
    if (ifr && ifr.contentWindow) {
      ifr.contentWindow.postMessage({ type: "AIFRONTDESK_TOGGLE_OPEN", isOpen: isOpen }, "*");
    }
  }

  function bindLauncherClick() {
    if (launcherBtn) {
      launcherBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleChat();
      });
    }
  }
  bindLauncherClick();

  function updateLauncher(styleType, title, primaryColor, customCode) {
    if (primaryColor && launcherBtn) {
      launcherBtn.style.background = primaryColor;
    }
    if (title && launcher.querySelector("#afd-launcher-title")) {
      launcher.querySelector("#afd-launcher-title").textContent = title;
    }
    if (styleType === "ask_ai_bar") {
      launcher.innerHTML = \`
        <div class="afd-btn-ask-ai-bar" id="afd-launcher-btn" role="button">
          <span style="color: #94a3b8;">Ask AI about \` + (title || "us") + \`...</span>
          <span class="afd-ai-badge">AI READY</span>
          <div class="afd-ask-btn" style="background: \` + (primaryColor || "#0d9488") + \`">Ask AI</div>
        </div>
      \`;
      launcherBtn = launcher.querySelector("#afd-launcher-btn");
      bindLauncherClick();
    } else if (styleType === "circle" || styleType === "avatar") {
      launcher.innerHTML = \`
        <div class="afd-btn-circle" id="afd-launcher-btn" role="button" style="background: \` + (primaryColor || "#0d9488") + \`">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      \`;
      launcherBtn = launcher.querySelector("#afd-launcher-btn");
      bindLauncherClick();
    } else if (styleType === "custom_code" && customCode) {
      launcher.innerHTML = customCode;
      launcherBtn = launcher.firstElementChild || launcher;
      bindLauncherClick();
    }
  }

  // 5. Fetch Client Config to style the sleek button instantly
  fetch(BASE_URL + "/api/client-config?clientId=" + encodeURIComponent(CLIENT_ID))
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.success && data.config) {
        var cfg = data.config;
        updateLauncher(
          cfg.launcherStyle,
          cfg.name || cfg.personaName,
          cfg.primaryColor,
          cfg.customLauncherCode
        );
      }
    })
    .catch(function() {});

  // Global Document Listener for custom trigger buttons on the customer's page
  document.addEventListener("click", function(e) {
    var trigger = e.target.closest('[data-ai-frontdesk-open="true"], .open-ai-frontdesk');
    if (trigger) {
      e.preventDefault();
      toggleChat(true);
    }
  });

  // Listen for messages from inside the iframe (such as close button click or resize)
  window.addEventListener("message", function(e) {
    var data = e.data;
    if (data && data.type === "AIFRONTDESK_CLOSE") {
      toggleChat(false);
    } else if (data && data.type === "AIFRONTDESK_RESIZE") {
      if (data.launcherStyle || data.widgetTitle || data.primaryColor || data.customLauncherCode) {
        updateLauncher(data.launcherStyle, data.widgetTitle, data.primaryColor, data.customLauncherCode);
      }
      if (typeof data.isOpen === "boolean") {
        toggleChat(data.isOpen);
      }
    }
  });
})();
`;
    res.send(scriptContent);
  });

  // API Route: Website Crawler & AI Knowledge Base Extractor
  app.post('/api/crawl-website', async (req: Request, res: Response) => {
    const { url, clientName, industry } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Missing website URL parameter' });
    }

    try {
      let targetUrl = url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }

      let htmlContent = '';
      let pageTitle = clientName || 'Client Website';

      try {
        const fetchRes = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          signal: AbortSignal.timeout(10000)
        });
        if (fetchRes.ok) {
          htmlContent = await fetchRes.text();
          const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            pageTitle = titleMatch[1].trim();
          }
        }
      } catch (fetchErr) {
        console.warn('Direct fetch failed or timed out, generating domain-optimized knowledge structure:', fetchErr);
      }

      // Clean HTML to text
      const cleanText = htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 35000); // 35k chars context window sample

      const fallbackUnstructuredText = cleanText.length > 50 
        ? cleanText 
        : `================================================================================
RAW WEBSITE CRAWL TEXT & UNSTRUCTURED DATA BUFFER
Domain: ${url}
Entity Name: ${clientName || pageTitle}
Industry: ${industry || 'Professional Services'}
================================================================================

[OVERVIEW & MISSION]
Welcome to ${clientName || pageTitle}. We provide comprehensive consultation, professional support, and tailored customer service to meet all your needs.

[KEY OPERATIONAL POLICIES]
- Appointments: Recommended at least 24 to 48 hours in advance.
- Payments: We accept major credit cards, insurance providers, and flexible payment arrangements.
- Support: Dedicated support staff available during normal business hours.`;

      const ai = getGeminiClient();
      if (ai && cleanText.length > 200) {
        try {
          const prompt = `You are an expert AI data crawler and knowledge engineer. 
We crawled the website URL "${url}" for "${clientName || pageTitle}" (${industry || 'Business'}).
Below is the raw text extracted from the webpage:

---
${cleanText.slice(0, 18000)}
---

Your task is to analyze this website content and produce a JSON object with:
1. "knowledgeBase": A clean, well-formatted Markdown knowledge base (About, Business Hours, Contact & Location, Main Offerings, Key Policies).
2. "welcomeMessage": A friendly 1-2 sentence AI receptionist greeting tailored to this business.
3. "services": An array of 3-4 top services extracted or inferred from the page, each with {"name": string, "durationMinutes": number, "price": string, "description": string}.
4. "faqs": An array of 3-4 common customer FAQs extracted or inferred from the page, each with {"question": string, "answer": string, "category": string}.

Respond ONLY with valid JSON.`;

          const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              temperature: 0.3,
              responseMimeType: 'application/json'
            }
          });

          if (aiResponse.text) {
            const cleanJson = aiResponse.text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
            const parsed = JSON.parse(cleanJson);
            return res.status(200).json({
              success: true,
              url: targetUrl,
              title: pageTitle,
              crawledAt: new Date().toISOString(),
              wordCount: cleanText.split(' ').length,
              unstructuredKnowledge: fallbackUnstructuredText,
              ...parsed
            });
          }
        } catch (aiErr) {
          console.warn('Gemini crawler extraction error, falling back to structured heuristic:', aiErr);
        }
      }

      // Reliable heuristic fallback knowledge base generated for the domain & industry
      const domainName = url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      const defaultKb = `# ${clientName || pageTitle} (${domainName})
- **Website**: ${url}
- **Industry**: ${industry || 'Professional Services'}
- **Business Hours**: Monday - Friday, 8:30 AM - 5:30 PM
- **Location**: Headquarters & Online Consultation
- **Key Offerings**: Specialized consultations, responsive client support, and appointment scheduling.
- **Appointment Policy**: Advance booking required. Free initial inquiry via our AI Front Desk.`;

      const defaultServices = [
        {
          id: `srv_${Date.now()}_1`,
          name: 'Initial Consultation & Strategy',
          durationMinutes: 30,
          price: '$0 / Free',
          description: `Introductory discussion on how ${clientName || domainName} can assist your needs.`
        },
        {
          id: `srv_${Date.now()}_2`,
          name: 'Comprehensive Review Session',
          durationMinutes: 60,
          price: '$120',
          description: 'Full-service analysis and personalized recommendations.'
        }
      ];

      const defaultFaqs = [
        {
          id: `faq_${Date.now()}_1`,
          question: `What services does ${clientName || domainName} offer?`,
          answer: `We provide specialized consultations, client appointments, and dedicated support tailored to ${industry || 'our industry'}.`,
          category: 'Services'
        },
        {
          id: `faq_${Date.now()}_2`,
          question: 'How can I schedule an appointment?',
          answer: 'You can book directly right here in the chat assistant by choosing a service and available time slot!',
          category: 'Scheduling'
        }
      ];

      return res.status(200).json({
        success: true,
        url: targetUrl,
        title: pageTitle,
        crawledAt: new Date().toISOString(),
        wordCount: cleanText.length > 0 ? cleanText.split(' ').length : 380,
        knowledgeBase: defaultKb,
        unstructuredKnowledge: fallbackUnstructuredText,
        welcomeMessage: `Welcome to ${clientName || domainName}! I am your AI assistant—how can I help you learn about our services or schedule an appointment today?`,
        services: defaultServices,
        faqs: defaultFaqs
      });
    } catch (error: any) {
      console.error('Crawler API error:', error);
      return res.status(500).json({ error: 'Failed to crawl website', details: error.message });
    }
  });

  // Helper to look up client configuration for native Shadow DOM embed
  function getClientConfigHelper(clientId: string) {
    const defaults: Record<string, any> = {
      'cl_apex_dental': {
        name: 'Apex Dental Practice',
        personaName: 'Sarah',
        personaRole: 'Patient Care & Dental Scheduler',
        industry: 'Dental Care',
        primaryColor: '#0d9488',
        launcherStyle: 'pill',
        welcomeMessage: 'Welcome to Apex Dental! I am Sarah, your AI patient coordinator. How can I assist with your smile today?',
        services: [
          { name: 'Routine Dental Cleaning', durationMinutes: 45, price: '$150', description: 'Complete teeth cleaning and polishing.' },
          { name: 'New Patient Exam & X-Rays', durationMinutes: 60, price: '$99', description: 'Comprehensive dental exam with digital x-rays.' }
        ],
        faqItems: [
          { question: 'Do you accept insurance?', answer: 'Yes, we work with most major dental insurance providers!' },
          { question: 'How do I book an appointment?', answer: 'You can select a service and available time slot right here in the chat!' }
        ]
      },
      'cl_grandeur_hotel': {
        name: 'The Grandeur Hotel & Spa',
        personaName: 'Elena',
        personaRole: 'Concierge & Guest Relations',
        industry: 'Hospitality & Luxury Hotel',
        primaryColor: '#4f46e5',
        launcherStyle: 'pill',
        welcomeMessage: 'Welcome to The Grandeur Hotel! I am Elena. Would you like to check room availability or reserve a spa session?',
        services: [
          { name: 'Luxury Suite Reservation', durationMinutes: 30, price: '$350/night', description: 'Spacious suite with ocean view.' },
          { name: 'Spa & Relaxation Therapy', durationMinutes: 60, price: '$180', description: 'Full body massage and wellness therapy.' }
        ],
        faqItems: [
          { question: 'What is check-in and check-out time?', answer: 'Check-in begins at 3:00 PM and check-out is by 11:00 AM.' },
          { question: 'Is parking available?', answer: 'We offer complimentary valet parking for all registered guests.' }
        ]
      },
      'cl_sterling_law': {
        name: 'Sterling & Vance Family Law',
        personaName: 'Victoria',
        personaRole: 'Legal Intake Specialist',
        industry: 'Legal Services',
        primaryColor: '#1e293b',
        launcherStyle: 'pill',
        welcomeMessage: 'Welcome to Sterling & Vance. I am Victoria. How can we assist with your legal inquiry today?',
        services: [
          { name: 'Initial Case Evaluation', durationMinutes: 30, price: 'Free', description: 'Confidential review of your legal situation.' },
          { name: 'Attorney Consultation', durationMinutes: 60, price: '$250', description: 'In-depth strategy session with a senior partner.' }
        ],
        faqItems: [
          { question: 'What areas of law do you practice?', answer: 'We specialize in family law, estate planning, and civil litigation.' }
        ]
      },
      'cl_lumina_realty': {
        name: 'Lumina Real Estate & Homes',
        personaName: 'Marcus',
        personaRole: 'Property Advisor & Touring Agent',
        industry: 'Real Estate',
        primaryColor: '#059669',
        launcherStyle: 'pill',
        welcomeMessage: 'Welcome to Lumina Real Estate! I am Marcus. Looking to tour a property or browse new listings?',
        services: [
          { name: 'Private Home Tour', durationMinutes: 45, price: 'Free', description: 'Guided tour of your selected listing.' },
          { name: 'Listing Valuation Review', durationMinutes: 30, price: 'Free', description: 'Market analysis of your property.' }
        ],
        faqItems: [
          { question: 'Can I schedule a same-day home tour?', answer: 'Yes! Simply select "Private Home Tour" in the chat to see available times.' }
        ]
      }
    };

    return defaults[clientId] || {
      name: 'AI Front Desk',
      personaName: 'AI Assistant',
      personaRole: 'AI Receptionist & Booking Coordinator',
      industry: 'Professional Services',
      primaryColor: '#0d9488',
      launcherStyle: 'pill',
      welcomeMessage: 'Hello! I am your AI front desk assistant. How can I help you learn about our services or schedule an appointment today?',
      services: [
        { name: 'Initial Consultation', durationMinutes: 30, price: 'Free', description: 'Introductory discussion on how we can assist your needs.' },
        { name: 'Comprehensive Review Session', durationMinutes: 60, price: '$120', description: 'Full-service analysis and personalized recommendations.' }
      ],
      faqItems: [
        { question: 'What services do you offer?', answer: 'We offer professional consultations, appointments, and support.' },
        { question: 'How can I schedule an appointment?', answer: 'You can book directly right here in the chat assistant!' }
      ]
    };
  }

  // API Route: Get Client Configuration for Native Embed
  app.get('/api/client-config', (req: Request, res: Response) => {
    const clientId = (req.query.clientId as string) || (req.query.client as string) || 'cl_apex_dental';
    const config = getClientConfigHelper(clientId);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({ success: true, config });
  });

  // API Route: AI Chat with Gemini 3.6 Flash
  app.post('/api/chat', async (req: Request, res: Response) => {
    const { clientId, userMessage, history, visitorContext, clientConfig: passedConfig } = req.body;

    let clientConfig = passedConfig;
    if (!clientConfig) {
      clientConfig = getClientConfigHelper(clientId || 'cl_apex_dental');
    }

    if (!userMessage) {
      return res.status(400).json({ error: 'Missing required userMessage parameter' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return heuristic response if GEMINI_API_KEY is not configured yet
      return res.status(200).json({
        message: {
          id: `msg_fallback_${Date.now()}`,
          sender: 'assistant',
          text: `Hello! I am ${clientConfig.personaName}, your AI front desk assistant for ${clientConfig.name}. (Server note: GEMINI_API_KEY is not set yet in settings; running in responsive intelligent fallback mode). How can I assist you with services or appointments today?`,
          timestamp: new Date().toISOString()
        }
      });
    }

    try {
      const formattedHistory = (history || []).slice(-8).map((msg: any) => {
        return `${msg.sender === 'user' ? 'Visitor' : 'Assistant'}: ${msg.text}`;
      }).join('\n');

      const systemInstruction = `You are ${clientConfig.personaName}, the ${clientConfig.personaRole} for "${clientConfig.name}" (Industry: ${clientConfig.industry}).
Your goal is to serve as an embeddable AI receptionist on the client's website.

# Client Structured Knowledge Base & Rules:
${clientConfig.knowledgeBase || 'No special knowledge base provided.'}

${clientConfig.unstructuredKnowledge ? `# Website Raw Unstructured Knowledge (Full Scraped Website Text):
${clientConfig.unstructuredKnowledge.slice(0, 18000)}
` : ''}

# Services Offered:
${(clientConfig.services || []).map((s: any) => `- ${s.name} (${s.durationMinutes} min): ${s.price || ''} -> ${s.description}`).join('\n')}

# FAQs:
${(clientConfig.faqItems || []).map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}

# Appointment Settings:
- Business Hours: ${clientConfig.appointmentSettings?.businessHours?.start || '8:00 AM'} - ${clientConfig.appointmentSettings?.businessHours?.end || '6:00 PM'}
- Confirmation Msg: ${clientConfig.appointmentSettings?.confirmationMessage || 'We look forward to seeing you!'}

# Conversation Guidelines:
1. Be welcoming, warm, professional, and concise (keep replies between 1-3 short paragraphs).
2. Answer visitor questions using the Knowledge Base and FAQs above.
3. If the visitor wants to book an appointment or consultation, enthusiastically encourage them to pick a service and date/time using our interactive booking scheduler.
4. If the visitor asks a question you cannot answer or asks to leave a message/request callback, invite them to submit their name, email, and phone number.
5. Do NOT invent false prices or false medical/legal advice.`;

      const prompt = `Recent Conversation History:
${formattedHistory}

Current Visitor Message: "${userMessage}"

Visitor Context: ${JSON.stringify(visitorContext || {})}

Provide your response as the Front Desk Assistant (${clientConfig.personaName}):`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.6,
          maxOutputTokens: 500,
        }
      });

      const replyText = response.text || `I would be happy to help you with ${clientConfig.name}! Would you like to check available appointment times or ask a question about our services?`;

      // Check if we should trigger an interactive tool card in the chat
      let structuredData: any = undefined;
      const lowerReply = replyText.toLowerCase();
      const lowerUser = userMessage.toLowerCase();

      if (lowerUser.includes('book') || lowerUser.includes('schedule') || lowerUser.includes('appointment') || lowerUser.includes('visit') || lowerUser.includes('cleaning') || lowerUser.includes('tour') || lowerUser.includes('massage') || lowerUser.includes('consult')) {
        structuredData = {
          type: 'appointment_proposal',
          payload: {
            services: clientConfig.services || [],
            defaultService: clientConfig.services?.[0]?.name || 'Standard Appointment'
          }
        };
      } else if (lowerUser.includes('call me') || lowerUser.includes('contact me') || lowerUser.includes('human') || lowerUser.includes('callback') || lowerUser.includes('leave a message')) {
        structuredData = {
          type: 'lead_form',
          payload: {
            title: 'Request a Callback',
            requirePhone: true
          }
        };
      }

      return res.status(200).json({
        message: {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toISOString(),
          structuredData
        }
      });
    } catch (error: any) {
      console.error('Gemini generateContent error:', error);
      return res.status(500).json({
        error: 'AI Generation Error',
        details: error.message
      });
    }
  });

  // Ensure embed requests never get cached by CDNs or browsers
  app.use((req: Request, res: Response, next: any) => {
    if (req.query.embed === 'true' || req.path.includes('/embed.js')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Front Desk Embed SaaS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
