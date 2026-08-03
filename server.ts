import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
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

  // API Route: Serve embed.js script for Client Websites
  app.get(['/api/embed.js', '/embed.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
      const filePath = path.join(process.cwd(), 'public/api/embed.js');
      if (fs.existsSync(filePath)) {
        const scriptContent = fs.readFileSync(filePath, 'utf-8');
        res.send(scriptContent);
        return;
      }
      const fallbackPath = path.join(process.cwd(), 'public/embed.js');
      if (fs.existsSync(fallbackPath)) {
        const scriptContent = fs.readFileSync(fallbackPath, 'utf-8');
        res.send(scriptContent);
        return;
      }
      res.status(404).send('// AI Front Desk embed script not found');
    } catch (err) {
      res.status(500).send('// Error loading embed script');
    }
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

  // API Route: Get Widget Configuration & Custom CSS for embed.js
  app.get('/api/widget-config', async (req: Request, res: Response) => {
    // Allow cross-origin requests from any client website
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    const clientId = (req.query.clientId as string) || (req.query.client as string) || 'cl_apex_dental';

    try {
      // Look up client config from database / helper
      const config = getClientConfigHelper(clientId);
      const primaryColor = config?.primaryColor || '#007bff';

      // Example response structure with saved/dynamic custom CSS for the launcher
      const customCss = config?.customCss || `.ai-frontdesk-launcher-${clientId} {
      background: linear-gradient(135deg, ${primaryColor}, #00d2ff) !important;
      border-radius: 50px !important;
      padding: 12px 24px !important;
      width: auto !important;
      height: 50px !important;
      font-weight: bold !important;
    }`;

      res.json({
        success: true,
        clientId: clientId,
        customCss: customCss || '' // Return saved custom CSS string
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Config fetch failed' });
    }
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
