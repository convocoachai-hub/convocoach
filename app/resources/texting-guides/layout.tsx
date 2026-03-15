import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Texting Guides',
  description: 'Master the art of texting with expert guides on timing, tone, and conversation flow.',
  openGraph: {
    title: 'Texting Guides | ConvoCoach',
    description: 'Master the art of texting with expert guides on timing, tone, and conversation flow.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Texting Guides | ConvoCoach',
    description: 'Master the art of texting with expert guides on timing, tone, and conversation flow.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
