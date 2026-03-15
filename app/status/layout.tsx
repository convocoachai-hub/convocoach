import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Check the current operational status of ConvoCoach services.',
  openGraph: {
    title: 'System Status | ConvoCoach',
    description: 'Check the current operational status of ConvoCoach services.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'System Status | ConvoCoach',
    description: 'Check the current operational status of ConvoCoach services.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
