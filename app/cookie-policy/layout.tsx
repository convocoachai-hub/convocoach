import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'ConvoCoach cookie policy and tracking information.',
  openGraph: {
    title: 'Cookie Policy | ConvoCoach',
    description: 'ConvoCoach cookie policy and tracking information.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | ConvoCoach',
    description: 'ConvoCoach cookie policy and tracking information.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
