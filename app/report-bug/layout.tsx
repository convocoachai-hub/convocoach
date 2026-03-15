import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report a Bug',
  description: 'Found a bug in ConvoCoach? Report it and help us improve.',
  openGraph: {
    title: 'Report a Bug | ConvoCoach',
    description: 'Found a bug in ConvoCoach? Report it and help us improve.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Report a Bug | ConvoCoach',
    description: 'Found a bug in ConvoCoach? Report it and help us improve.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
