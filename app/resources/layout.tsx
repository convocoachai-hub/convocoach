import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources - Texting and Dating Guides',
  description: 'Expert guides on texting, dating psychology, attraction signals, and conversation mastery.',
  openGraph: {
    title: 'Resources - Texting and Dating Guides | ConvoCoach',
    description: 'Expert guides on texting, dating psychology, attraction signals, and conversation mastery.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resources - Texting and Dating Guides | ConvoCoach',
    description: 'Expert guides on texting, dating psychology, attraction signals, and conversation mastery.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
