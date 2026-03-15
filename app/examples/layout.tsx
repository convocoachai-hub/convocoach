import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversation Examples',
  description: 'See real conversation analysis examples. Learn what good and bad texting looks like with AI-powered breakdowns.',
  openGraph: {
    title: 'Conversation Examples | ConvoCoach',
    description: 'See real conversation analysis examples. Learn what good and bad texting looks like with AI-powered breakdowns.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversation Examples | ConvoCoach',
    description: 'See real conversation analysis examples. Learn what good and bad texting looks like with AI-powered breakdowns.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
