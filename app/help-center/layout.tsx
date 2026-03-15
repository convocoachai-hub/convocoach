import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers to common questions, learn how to use ConvoCoach features, and get support.',
  openGraph: {
    title: 'Help Center | ConvoCoach',
    description: 'Find answers to common questions, learn how to use ConvoCoach features, and get support.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | ConvoCoach',
    description: 'Find answers to common questions, learn how to use ConvoCoach features, and get support.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
