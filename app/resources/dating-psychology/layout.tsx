import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dating Psychology',
  description: 'Understand attraction signals, attachment styles, and the psychology behind great conversations.',
  openGraph: {
    title: 'Dating Psychology | ConvoCoach',
    description: 'Understand attraction signals, attachment styles, and the psychology behind great conversations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dating Psychology | ConvoCoach',
    description: 'Understand attraction signals, attachment styles, and the psychology behind great conversations.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
