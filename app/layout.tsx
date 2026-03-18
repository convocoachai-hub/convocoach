// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import Footer from '@/components/Footer';

// ─── NEXT.JS 14 VIEWPORT SETTINGS ─────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: '#FFD84D', // Viral yellow color for mobile browsers
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents weird zooming on mobile inputs
};

// ─── VIRAL & TOP-TIER SEO METADATA ────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://convocoach.xyz'),
  title: {
    default: 'Convo Coach | AI Text Analyzer & Dating Coach',
    template: '%s | Convo Coach',
  },
  description: 'Upload your chat screenshots and let AI reveal what they are really thinking. Get your Rizz Score, uncover hidden attraction signals, fix dry texting, and know exactly what to send next.',
  keywords: [
    'AI texting coach', 'analyze my chat', 'rizz score AI', 'text message analyzer',
    'chat screenshot analyzer', 'dating app AI advice', 'is he into me AI', 'friendzone test',
    'fix dry texting', 'attraction signal detector', 'how to reply to a text', 'Convo Coach'
  ],
  alternates: { canonical: 'https://convocoach.xyz' },
  
  // High-conversion Open Graph (for Discord, iMessage, WhatsApp shares)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://convocoach.xyz',
    siteName: 'Convo Coach',
    title: 'Analyze Your Chats. Uncover Hidden Signals. 🕵️‍♂️💬',
    description: 'Drop a screenshot. Our AI will tell you if they like you, roast your dry texting, and give you the perfect reply.',
    images: [{ 
      url: '/og-image.png', 
      width: 1200, 
      height: 630, 
      alt: 'Convo Coach — See what your matches are really thinking.' 
    }],
  },
  
  // Viral Twitter Card format
  twitter: {
    card: 'summary_large_image',
    site: '@convocoach',
    creator: '@convocoach',
    title: 'Is your texting game actually good? Let AI judge it.',
    description: 'Upload your chat screenshots. Get your Rizz Score, find out if you are in the friendzone, and get the perfect next message.',
    images: ['/og-image.png'],
  },
  
  robots: { 
    index: true, 
    follow: true, 
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: { 
    icon: '/favicon.ico', 
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ─── TOP TIER JSON-LD SCHEMA ────────────────────────────────────────────────
  // This helps Google show you as an App, a Brand, and adds a rich search snippet
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://convocoach.xyz',
        url: 'https://convocoach.xyz',
        name: 'ConvoCoach',
        description: 'AI-powered conversation analysis with attraction scores and smart replies.',
        publisher: { '@id': 'https://convocoach.xyz/about' },
      },
      {
        '@type': 'Organization',
        '@id': 'https://convocoach.xyz/about',
        name: 'Convo Coach',
        url: 'https://convocoach.xyz',
        logo: 'https://convocoach.xyz/logo.png',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://convocoach.xyz/#app',
        name: 'Convo Coach AI Analyzer',
        applicationCategory: 'CommunicationApplication',
        operatingSystem: 'Web, iOS, Android',
        url: 'https://convocoach.xyz',
        description: 'Upload screenshots of your texts to get AI-generated attraction scores, red flag detection, and reply rewrites.',
        offers: { 
          '@type': 'AggregateOffer', 
          lowPrice: '0', 
          highPrice: '69.99', 
          priceCurrency: 'USD', 
          offerCount: '3' 
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1284'
        },
        featureList: 'Chat Analysis, Rizz Score, Roast Mode, Attraction Signals, Live Reply Coach',
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-void)] text-white">
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}