// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'ConvoCoach — AI Texting Coach & Conversation Analyzer',
    template: '%s | ConvoCoach',
  },
  description: 'Upload chat screenshots for AI-powered conversation analysis. Get attraction scores, red flag detection, and smart reply coaching. Practice texting with realistic AI personalities.',
  keywords: [
    'AI texting coach', 'conversation analyzer', 'chat analysis AI', 'improve texting skills',
    'rizz score', 'dating app advice', 'text message analyzer', 'conversation practice simulator',
    'attraction signal detector', 'ConvoCoach',
  ],
  metadataBase: new URL('https://convocoach.ai'),
  alternates: { canonical: 'https://convocoach.ai' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://convocoach.ai',
    siteName: 'ConvoCoach',
    title: 'ConvoCoach — AI Texting Coach & Conversation Analyzer',
    description: 'Upload your conversations for AI-powered analysis. Discover attraction signals, texting mistakes, and get smart reply coaching. Practice with AI personalities.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ConvoCoach — AI Conversation Coaching Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@convocoach',
    title: 'ConvoCoach — AI Texting Coach',
    description: 'Upload your chats. Get AI conversation analysis with attraction scores, coaching insights, and smart reply suggestions.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  other: { 'theme-color': '#0F0C09' },
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
        {/* JSON-LD: SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'ConvoCoach',
            applicationCategory: 'CommunicationApplication',
            operatingSystem: 'Web',
            url: 'https://convocoach.ai',
            description: 'AI-powered conversation analysis with attraction scores, signal detection, and smart reply suggestions.',
            offers: { '@type': 'AggregateOffer', lowPrice: '0', highPrice: '69.99', priceCurrency: 'USD', offerCount: '4' },
            featureList: 'Conversation Analysis, Attraction Score, Signal Detection, AI Reply Rewrites, Practice Mode, Roast Mode',
          }) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-void)] text-white">
        <Providers>
          <Navbar />
          {/* 🔥 FIXED: Removed the pb-20 class that was causing the weird gap */}
          <main>
            {children}
          </main>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}