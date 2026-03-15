import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Common questions about ConvoCoach pricing, privacy, features, and how our AI conversation analysis works.',
  openGraph: {
    title: 'Frequently Asked Questions | ConvoCoach',
    description: 'Common questions about ConvoCoach pricing, privacy, features, and how our AI conversation analysis works.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | ConvoCoach',
    description: 'Common questions about ConvoCoach pricing, privacy, features, and how our AI conversation analysis works.',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    { '@type': 'Question', name: 'What does ConvoCoach do?', acceptedAnswer: { '@type': 'Answer', text: 'ConvoCoach is an AI-powered conversation intelligence tool. Upload a screenshot of any text conversation and our AI analyzes 10 behavioral layers to tell you exactly what is happening beneath the surface.' } },
    { '@type': 'Question', name: 'Is my data private?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Screenshots are processed and deleted from our servers within 60 seconds. We never store conversation content.' } },
    { '@type': 'Question', name: 'How accurate is the AI analysis?', acceptedAnswer: { '@type': 'Answer', text: 'Our analysis combines principles from communication psychology with natural language processing, achieving approximately 94% correlation with self-reported interest levels.' } },
    { '@type': 'Question', name: 'What is Practice Mode?', acceptedAnswer: { '@type': 'Answer', text: 'Practice Mode lets you text with 10 AI personalities across different scenarios. Each character has unique traits and communication styles with real-time coaching.' } },
    { '@type': 'Question', name: 'Can I cancel anytime?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Cancel from your account settings at any time. Your subscription continues until the end of the current billing period.' } },
    { '@type': 'Question', name: 'How much does Premium cost?', acceptedAnswer: { '@type': 'Answer', text: 'We offer Monthly, Yearly, and Lifetime plans starting from $1.99/month. Check our pricing page for regional rates.' } },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
