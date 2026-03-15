import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attraction Signals',
  description: 'Learn to read attraction signals in text conversations.',
  openGraph: {
    title: 'Attraction Signals | ConvoCoach',
    description: 'Learn to read attraction signals in text conversations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Attraction Signals | ConvoCoach',
    description: 'Learn to read attraction signals in text conversations.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
