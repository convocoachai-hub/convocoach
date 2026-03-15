import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flirting Over Text',
  description: 'Learn how to flirt effectively over text with proven techniques and real examples.',
  openGraph: {
    title: 'Flirting Over Text | ConvoCoach',
    description: 'Learn how to flirt effectively over text with proven techniques and real examples.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flirting Over Text | ConvoCoach',
    description: 'Learn how to flirt effectively over text with proven techniques and real examples.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
