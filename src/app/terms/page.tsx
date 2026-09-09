'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-semibold mb-4">
            <FileText className="w-3.5 h-3.5" /> Platform Governance
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mb-3">
            Terms of Service
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            Last updated: August 18, 2026
          </p>
        </div>

        {/* Legal Body Document */}
        <article className="prose prose-stone max-w-none space-y-8 text-stone-700 text-sm sm:text-base leading-relaxed">
          
          <p className="text-stone-600 font-medium">
            These Terms of Service (&ldquo;Terms&rdquo;) govern access to and use of Flowdexx AI&apos;s website, dashboard, APIs, and embeddable chat widget (collectively, the &ldquo;Service&rdquo;), operated by Flowdexx AI Inc. (&ldquo;Flowdexx,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). By creating an account or using the Service, you (&ldquo;Customer,&rdquo; &ldquo;you&rdquo;) agree to these Terms.
          </p>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">1. Eligibility & Account Registration</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              You must be at least 18 years old and able to form a binding contract to use the Service. You are responsible for maintaining the confidentiality of your account credentials and API keys, and for all activity that occurs under your account.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">2. The Service</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Flowdexx provides tools to create, customize, and embed an AI-powered chat widget on Customer websites, including a dashboard for managing knowledge bases, leads, conversations, and settings. The Service uses third-party AI models (including Google&apos;s Gemini API) to generate automated responses. AI-generated responses may be inaccurate, incomplete, or inappropriate in some cases; you are responsible for reviewing your widget&apos;s configuration and monitoring its output.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">3. Customer Responsibilities</h2>
            <p className="text-xs sm:text-sm text-stone-600">You agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-stone-600">
              <li>Provide accurate account and billing information</li>
              <li>Use the Service only for lawful purposes</li>
              <li>Ensure you have necessary rights and consents to collect and process Visitor data through your widget, complying with applicable privacy laws (e.g., GDPR, CCPA)</li>
              <li>Not use the Service to transmit unlawful, defamatory, harassing, or infringing content</li>
              <li>Not attempt to reverse-engineer, resell, or misuse the Service or API beyond what is permitted by your plan</li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">4. Acceptable Use</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              You may not use the Service to: violate any law; infringe intellectual property rights; distribute malware; harvest data without consent; impersonate any person or entity; or interfere with the Service&apos;s operation or security (including circumventing rate limits or accessing accounts without authorization).
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">5. Fees & Billing</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Paid plans are billed in advance on a recurring basis as described at checkout or in your plan details. Fees are non-refundable except as required by law or expressly stated otherwise. We may change pricing with reasonable advance notice; continued use after a price change takes effect constitutes acceptance.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">6. Data Ownership</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              <strong>Customer Content:</strong> You retain ownership of content you upload (knowledge base articles, branding assets, widget configuration) and of Visitor conversation data collected through your widget, subject to our right to process it to provide the Service.
            </p>
            <p className="text-xs sm:text-sm text-stone-600">
              <strong>Flowdexx IP:</strong> We retain all rights to the Service itself, including its software, design, and underlying technology. Nothing in these Terms grants you rights to our trademarks or proprietary technology beyond what&apos;s needed to use the Service.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">7. Third-Party AI Processing</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              You acknowledge that chat content is transmitted to third-party AI providers (including Google&apos;s Gemini API) to generate responses, and that such providers&apos; own terms and processing practices apply to that processing. Do not submit data through the widget that you are not permitted to share with such providers unless you&apos;ve confirmed this is permitted under your applicable compliance obligations.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">8. Service Availability</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              We aim to keep the Service available but do not guarantee uninterrupted or error-free operation. We may perform maintenance, updates, or modifications that temporarily affect availability, with notice where practicable for planned downtime.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">9. Termination</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              You may cancel your account at any time via the dashboard. We may suspend or terminate your account if you breach these Terms, fail to pay fees due, or engage in conduct that we reasonably believe harms the Service, other users, or third parties. Upon termination, your right to use the Service ends.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">10. Disclaimers</h2>
            <p className="text-xs sm:text-sm font-mono text-stone-600 uppercase">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT AI-GENERATED RESPONSES WILL BE ACCURATE, COMPLETE, OR SUITABLE FOR YOUR PURPOSES.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">11. Limitation of Liability</h2>
            <p className="text-xs sm:text-sm font-mono text-stone-600 uppercase">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLOWDEXX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">12. Indemnification</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              You agree to indemnify and hold Flowdexx harmless from claims, damages, and expenses arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party (including Visitor privacy rights).
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">13. Governing Law & Disputes</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              These Terms are governed by the laws of the State of California, United States, without regard to conflict-of-law principles. Any disputes shall be resolved in the state or federal courts located in San Francisco County, California.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">14. Changes to These Terms</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              We may modify these Terms from time to time. We will provide notice of material changes via the dashboard or email. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">15. Contact</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Questions about these Terms can be directed to: <a href="mailto:legal@flowdexx.com" className="text-rose-700 underline font-medium">legal@flowdexx.com</a>
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
            <Link href="/privacy" className="hover:text-stone-200 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-stone-200 hover:text-white font-medium">Terms of Service</Link>
            <Link href="/" className="hover:text-stone-200 transition-colors">Home</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
