import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upgrade to Premium — Unlimited AI Conversation Coaching',
  description: 'Unlock unlimited chat analysis, advanced coaching insights, full practice mode access, and priority AI responses. Premium plans from $1.99/month or ₹99/month.',
  alternates: { canonical: 'https://convocoach.ai/upgrade' },
  openGraph: {
    title: 'ConvoCoach Premium — Unlimited AI Conversation Coaching',
    description: 'Get unlimited conversation analysis, practice sessions, and advanced AI coaching. Monthly, yearly, and lifetime plans available worldwide.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ConvoCoach Premium' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upgrade ConvoCoach — Unlimited AI Coaching',
    description: 'Unlock unlimited conversation analysis, live coaching, and practice sessions. Plans from $1.99/month.',
  },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
