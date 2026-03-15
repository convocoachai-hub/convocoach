import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ConvoCoach terms of service and usage agreement.',
  openGraph: {
    title: 'Terms of Service | ConvoCoach',
    description: 'ConvoCoach terms of service and usage agreement.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | ConvoCoach',
    description: 'ConvoCoach terms of service and usage agreement.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
