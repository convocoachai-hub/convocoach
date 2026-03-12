// app/layout.tsx — REPLACE your entire existing file

import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ConvoCoach — Stop Sending Cringe Texts',
  description: 'AI-powered conversation analysis. Upload chat screenshots, get brutal honest feedback, practice with AI personalities.',
  keywords: 'conversation coach, texting tips, dating app, chat analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-void)] text-white">
        <Providers>
          <Navbar />
          <main className="pb-20 md:pb-0">
            {children}
          </main>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}


// ─── ALSO CREATE: app/providers.tsx ──────────────────────────────────────────
// Create this new file at app/providers.tsx