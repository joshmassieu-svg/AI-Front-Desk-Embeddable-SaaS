'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-950">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-sm">
              <Search className="w-4 h-4 text-rose-300" />
            </div>
            <span className="font-bold text-lg tracking-tight text-stone-900">
              Flowdexx
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        
        {/* Title Header */}
        <div className="mb-12 text-left pb-8 border-b border-stone-200/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Legal & Transparency
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            Last updated: August 18, 2026
          </p>
        </div>

        {/* Legal Body Document */}
        <article className="prose prose-stone max-w-none space-y-8 text-stone-700 text-sm sm:text-base leading-relaxed">
          
          <p className="text-stone-600 font-medium">
            Flowdexx AI (&ldquo;Flowdexx,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides an embeddable AI-powered chat widget platform for websites (&ldquo;Service&rdquo;). This Privacy Policy explains how we collect, use, and protect information when you use our dashboard (&ldquo;Customers&rdquo;) and when end users interact with a Flowdexx chat widget embedded on a Customer&apos;s website (&ldquo;Visitors&rdquo;).
          </p>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">1. Information We Collect</h2>
            
            <div>
              <h3 className="font-bold text-stone-900 text-sm mb-2">From Customers (account holders):</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-stone-600">
                <li>Account information: name, email address, password (hashed), company/workplace name</li>
                <li>Billing information (processed via our payment provider; we do not store full card numbers)</li>
                <li>Website configuration data: domain names, widget customization settings, knowledge base content you upload</li>
                <li>Usage data: pages visited in the dashboard, feature usage, API key activity</li>
              </ul>
            </div>

            <div className="pt-3">
              <h3 className="font-bold text-stone-900 text-sm mb-2">From Visitors (end users of the embedded widget):</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-stone-600">
                <li>Chat messages and conversation content submitted to the widget</li>
                <li>Contact details voluntarily provided during a conversation (e.g., name, email, phone number) if the Customer&apos;s widget is configured to collect leads</li>
                <li>Technical data: IP address, browser type, device type, referring page, timestamp</li>
              </ul>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">2. How We Use Information</h2>
            <p className="text-xs sm:text-sm text-stone-600">We use collected information to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-stone-600">
              <li>Operate, maintain, and improve the Service</li>
              <li>Generate AI responses via third-party AI providers (see Section 3)</li>
              <li>Provide Customers with conversation transcripts, analytics, and lead data</li>
              <li>Send account-related communications (billing, security alerts, service updates)</li>
              <li>Detect, prevent, and address fraud, abuse, or technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">3. Third-Party Processing</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Chat messages are processed through Google&apos;s Gemini API to generate AI responses. Depending on the conversation memory mode a Customer configures for their site (stateful or stateless), conversation history may be retained temporarily to provide contextual responses, subject to retention limits set by the Customer or by default platform settings.
            </p>
            <p className="text-xs sm:text-sm text-stone-600">
              We also use cloud hosting and database infrastructure (Firebase/Firestore, Vercel), payment processing, email delivery, and analytics tools who process data on our behalf under their own data protection terms.
            </p>
            <p className="text-xs sm:text-sm font-semibold text-stone-900">
              We do not sell personal information to third parties.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">4. Data Retention</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Customer account data is retained for as long as the account is active, plus a reasonable period afterward for legal and backup purposes.
            </p>
            <p className="text-xs sm:text-sm text-stone-600">
              Visitor conversation data is retained according to the retention settings configured by the Customer for their site, or our default retention period if none is set. Customers are responsible for configuring retention in line with their own legal obligations to their Visitors.
            </p>
            <p className="text-xs sm:text-sm text-stone-600">
              Customers may request deletion of their account and associated data by contacting <a href="mailto:privacy@flowdexx.com" className="text-rose-700 underline font-medium">privacy@flowdexx.com</a>.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">5. Data Sharing</h2>
            <p className="text-xs sm:text-sm text-stone-600">We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-stone-600">
              <li>The Customer whose widget a Visitor interacted with (transcripts & leads visible in Customer dashboard)</li>
              <li>Service providers who process data on our behalf, under confidentiality and data protection obligations</li>
              <li>Authorities, where required by law, subpoena, or to protect rights, property, or safety</li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">6. Data Security</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              We implement industry-standard technical and organizational measures (encryption in transit, access controls, authenticated API access) to protect data. No system is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">7. Your Rights</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Depending on your jurisdiction, you may have rights to access, correct, delete, export, or restrict processing of your personal data. Customers can exercise most of these rights directly within the dashboard. Visitors who wish to exercise these rights regarding data submitted through a widget should contact the website operator (our Customer) directly, or contact us at <a href="mailto:privacy@flowdexx.com" className="text-rose-700 underline font-medium">privacy@flowdexx.com</a> and we will route the request accordingly.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">8. Children&apos;s Privacy</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              The Service is not directed at children under 13 (or the relevant minimum age in your jurisdiction), and we do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">9. International Data Transfers</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Data may be processed in countries other than your own, including the United States, where our infrastructure and sub-processors operate. Where required, we rely on appropriate safeguards for such transfers.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">10. Changes to This Policy</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              We may update this Privacy Policy from time to time. Material changes will be notified via the dashboard or by email to Customers. Continued use of the Service after changes take effect constitutes acceptance.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">11. Contact Us</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Questions about this Privacy Policy can be directed to: <a href="mailto:privacy@flowdexx.com" className="text-rose-700 underline font-medium">privacy@flowdexx.com</a>
            </p>
            <p className="text-xs font-mono text-stone-500 pt-2">
              Flowdexx AI Inc. • San Francisco, CA
            </p>
          </section>

        </article>

      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-stone-950 text-stone-400 border-t border-stone-800 text-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Flowdexx Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-stone-200 hover:text-white font-medium">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-stone-200 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-stone-200 transition-colors">Home</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
