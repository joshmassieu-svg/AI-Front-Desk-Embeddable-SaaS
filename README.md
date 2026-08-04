# Website AI Assistant Platform SaaS

An enterprise-grade, production-ready SaaS platform that allows businesses to embed an AI website assistant using a single JavaScript snippet.

Features isolated **Shadow DOM** widget rendering, Next.js 14 dashboard, **Google Gemini RAG engine**, real-time **live support agent handoff**, customizable **leads CRM**, and subscription tier management.

---

## 🚀 Deploying to Vercel

### Option A: 1-Click Git Import (Recommended)

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository.
3. Vercel will automatically detect Next.js and apply `vercel.json`.
4. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key from Google AI Studio.
   - `NEXT_PUBLIC_APP_URL`: `https://<your-app-name>.vercel.app`
5. Click **Deploy**.

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Production
vercel --prod
```

---

## 📌 Embedding on Host Websites

Paste this 1-line script tag before the closing `</body>` tag on any website (HTML, React, Next.js, Vue, WordPress, Shopify, Wix, Webflow):

```html
<script src="https://<your-app-name>.vercel.app/widget.js" data-website-id="site_acme_123" async></script>
```

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + Lucide Icons + Recharts
- **Embed Runtime**: Vanilla JavaScript with native Shadow DOM isolation (`public/widget.js`)
- **AI & RAG Engine**: Google Gemini API (`GEMINI_API_KEY`) + Vector retrieval matcher (`src/lib/rag.ts`)
- **Real-Time Handoff**: Support agent takeover inbox (`/dashboard/inbox`)
- **Deployment**: Vercel Serverless & Edge API Routes (`vercel.json`)
