import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Flowdexx — Turn Website Visitors Into Customers with AI',
  description: 'Flowdexx AI Ask Bar answers visitor questions, understands intent, qualifies leads, and guides website visitors toward conversion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X1T90VR04E"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X1T90VR04E');
          `}
        </Script>
      </head>
      <body className="bg-[#FAF8F5] text-stone-900 min-h-screen antialiased selection:bg-rose-100 selection:text-rose-950">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}



