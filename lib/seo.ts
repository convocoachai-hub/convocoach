// lib/seo.ts — ConvoCoach SEO metadata factory
import type { Metadata } from 'next';

const SITE = {
  name: 'ConvoCoach',
  url: 'https://convocoach.ai',
  tagline: 'AI Conversation Coach — Improve Your Texting Game',
  defaultOgImage: '/og-image.png',
  twitterHandle: '@convocoach',
};

export function buildMetadata({
  title,
  description,
  path = '/',
  ogImage = SITE.defaultOgImage,
  noIndex = false,
  jsonLd,
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: object;
}): Metadata {
  const url = `${SITE.url}${path}`;
  const fullTitle = title.includes('ConvoCoach') ? title : `${title} | ConvoCoach`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1 },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: SITE.name,
      title: fullTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE.twitterHandle,
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

// JSON-LD helpers
export const jsonLd = {
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: 'AI-powered conversation coaching platform for improving texting, dating conversations, and professional communication.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }),

  softwareApp: () => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web',
    url: SITE.url,
    description: 'Upload chat screenshots, get AI-powered conversation analysis with attraction scores, signal detection, and smart coaching. Practice with AI personalities.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '69.99',
      priceCurrency: 'USD',
      offerCount: '4',
    },
    featureList: [
      'AI Conversation Analysis',
      'Attraction Signal Detection',
      'Conversation Quality Scoring',
      'Smart Reply Suggestions',
      'Practice Mode with AI Personalities',
      'Guided Coaching System',
      'Rizz Link Anonymous Feedback',
      'Professional Communication Practice',
    ].join(', '),
  }),

  faqPage: (faqs: { q: string; a: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }),
};

export { SITE };
