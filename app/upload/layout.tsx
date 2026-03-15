import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analyze Your Conversation — AI Chat Analysis & Coaching',
  description: 'Upload or paste any chat conversation and get instant AI-powered analysis. Discover attraction signals, texting mistakes, confidence levels, and receive smart reply suggestions tailored to your conversation.',
  alternates: { canonical: 'https://convocoach.ai/upload' },
  openGraph: {
    title: 'AI Chat Analysis — Upload & Get Instant Conversation Coaching | ConvoCoach',
    description: 'Paste your conversation and AI analyzes attraction signals, red flags, engagement quality, and texting patterns. Get a full score breakdown and smart reply rewrites.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ConvoCoach Chat Analysis' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Conversation Analysis | ConvoCoach',
    description: 'Upload your chat. Get attraction scores, signal detection, and smart coaching to improve your texting game.',
  },
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
