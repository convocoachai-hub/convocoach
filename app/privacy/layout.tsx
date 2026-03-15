import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how ConvoCoach handles your data. We never store your conversations.',
  openGraph: {
    title: 'Privacy Policy | ConvoCoach',
    description: 'Learn how ConvoCoach handles your data. We never store your conversations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | ConvoCoach',
    description: 'Learn how ConvoCoach handles your data. We never store your conversations.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
