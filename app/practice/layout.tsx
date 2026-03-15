import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practice Mode — AI Conversation Simulator with Live Coaching',
  description: 'Practice texting with 14 realistic AI personalities. Choose Guided Mode for live message coaching, quality scores, and smart reply suggestions. Master dating, professional, and social conversations.',
  alternates: { canonical: 'https://convocoach.ai/practice' },
  openGraph: {
    title: 'Practice Mode — AI Conversation Simulator | ConvoCoach',
    description: 'Practice talking to AI personalities that react like real people. Get live coaching after every message in Guided Mode — scores, insights, and smarter alternatives.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ConvoCoach Practice Mode' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Practice Conversations with AI Personalities | ConvoCoach',
    description: 'Get live coaching on your messages from an AI coach. Practice dating, social, and professional conversations with realistic AI personalities.',
  },
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
