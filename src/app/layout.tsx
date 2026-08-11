import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Acme AI Assistant Platform | Website Embed Assistant SaaS',
  description: 'Enterprise AI website assistant platform. Add custom Gemini-powered chat widgets to any website with a single JavaScript snippet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
