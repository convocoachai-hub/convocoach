import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analysis Results',
  description: 'View your conversation analysis results with attraction score, signal detection, and personalized improvement tips.',
  openGraph: {
    title: 'Analysis Results | ConvoCoach',
    description: 'View your conversation analysis results with attraction score, signal detection, and personalized improvement tips.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analysis Results | ConvoCoach',
    description: 'View your conversation analysis results with attraction score, signal detection, and personalized improvement tips.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
