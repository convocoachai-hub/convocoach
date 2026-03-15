import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversation Score',
  description: 'Understand your Conversation Score and how ConvoCoach measures attraction, engagement, and texting quality.',
  openGraph: {
    title: 'Conversation Score | ConvoCoach',
    description: 'Understand your Conversation Score and how ConvoCoach measures attraction, engagement, and texting quality.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversation Score | ConvoCoach',
    description: 'Understand your Conversation Score and how ConvoCoach measures attraction, engagement, and texting quality.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
