import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stop Dry Texting',
  description: 'Fix dry texting habits. Learn conversation starters and engagement techniques.',
  openGraph: {
    title: 'Stop Dry Texting | ConvoCoach',
    description: 'Fix dry texting habits. Learn conversation starters and engagement techniques.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stop Dry Texting | ConvoCoach',
    description: 'Fix dry texting habits. Learn conversation starters and engagement techniques.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
