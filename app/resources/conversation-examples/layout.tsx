import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversation Examples',
  description: 'Study real conversation examples with AI analysis.',
  openGraph: {
    title: 'Conversation Examples | ConvoCoach',
    description: 'Study real conversation examples with AI analysis.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversation Examples | ConvoCoach',
    description: 'Study real conversation examples with AI analysis.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
