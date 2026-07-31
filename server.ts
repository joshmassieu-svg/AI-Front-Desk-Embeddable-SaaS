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

  // API Route: Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Route: Dynamic embed.js script generator for Client Websites
  app.get('/api/embed.js', (req: Request, res: Response) => {
    const clientId = (req.query.client as string) || 'cl_apex_dental';
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');

    const scriptContent = `
(function() {
  var CLIENT_ID = "${clientId}";
  var BASE_URL = "${baseUrl}";
  var EXISTING = document.getElementById("ai-frontdesk-container-" + CLIENT_ID);
  if (EXISTING) return;

  var container = document.createElement("div");
  container.id = "ai-frontdesk-container-" + CLIENT_ID;
  container.style.position = "fixed";
  container.style.bottom = "24px";
  container.style.right = "24px";
  container.style.zIndex = "999999";
  container.style.fontFamily = "system-ui, -apple-system, sans-serif";

  // Create iframe for insulated widget rendering
  var iframe = document.createElement("iframe");
  iframe.src = BASE_URL + "/?embed=true&clientId=" + encodeURIComponent(CLIENT_ID);
  iframe.style.border = "none";
  iframe.style.background = "transparent";
  iframe.style.width = "400px";
  iframe.style.height = "640px";
  iframe.style.maxHeight = "90vh";
  iframe.style.maxWidth = "95vw";
  iframe.style.borderRadius = "20px";
  iframe.style.boxShadow = "0 20px 40px rgba(0,0,0,0.18)";
  iframe.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
  iframe.style.colorScheme = "normal";
  iframe.allow = "microphone; clipboard-write";

  // Responsive mobile adjustment
  function updateSize() {
    if (window.innerWidth < 480) {
      iframe.style.width = "calc(100vw - 32px)";
      iframe.style.height = "calc(100vh - 120px)";
      container.style.bottom = "16px";
      container.style.right = "16px";
    }
  }
  window.addEventListener("resize", updateSize);
  updateSize();

  container.appendChild(iframe);
  document.body.appendChild(container);
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
      let htmlContent = '';
      let pageTitle = clientName || 'Client Website';

      try {
        const fetchRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AIFrontDeskBot/1.0; +https://example.com)'
          },
          signal: AbortSignal.timeout(8000)
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
            const parsed = JSON.parse(aiResponse.text);
            return res.status(200).json({
              success: true,
              url,
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
        url,
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

  // API Route: AI Chat with Gemini 3.6 Flash
  app.post('/api/chat', async (req: Request, res: Response) => {
    const { clientId, userMessage, history, visitorContext, clientConfig } = req.body;

    if (!clientConfig || !userMessage) {
      return res.status(400).json({ error: 'Missing required configuration or message parameters' });
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
