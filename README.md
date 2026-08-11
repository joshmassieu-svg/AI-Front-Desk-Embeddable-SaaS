# FlowDexx AI Assistant Platform SaaS (demo.flowdexx.com)

An enterprise-grade, production-ready SaaS platform that allows businesses to embed an AI website assistant using a single JavaScript snippet.

Features isolated **Shadow DOM** widget rendering, Next.js 14 dashboard, **Google Gemini RAG engine**, **Firebase Admin SDK integration**, real-time **live support agent handoff**, customizable **leads CRM**, and subscription tier management.

---

## 📌 Production Website Embed Tag (`demo.flowdexx.com`)

Paste this 1-line script snippet before the closing `</body>` tag on any host website (HTML, React, Next.js, Vue, WordPress, Shopify, Wix, Webflow):

```html
<script src="https://demo.flowdexx.com/widget.js" data-website-id="site_acme_123" async></script>
```

---

## 🔥 Firebase Admin SDK Setup

Firebase Admin SDK is initialized in `src/lib/firebase-admin.ts` using the requested service account pattern:

```js
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### Production Vercel Deployment with Firebase:

1. Place `serviceAccountKey.json` in the root directory OR add the environment variable `FIREBASE_SERVICE_ACCOUNT_KEY` on Vercel containing the raw JSON content of your service account key.
2. In Vercel Environment Variables, set:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `NEXT_PUBLIC_APP_URL`: `https://demo.flowdexx.com`
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: `{ ...json content of serviceAccountKey.json... }`

---

## 🚀 Deploying to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy directly to demo.flowdexx.com
vercel --prod
```
