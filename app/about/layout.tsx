import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about ConvoCoach - the AI-powered conversation coach that helps you text better, read signals, and level up every conversation.',
  openGraph: {
    title: 'About | ConvoCoach',
    description: 'Learn about ConvoCoach - the AI-powered conversation coach that helps you text better, read signals, and level up every conversation.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | ConvoCoach',
    description: 'Learn about ConvoCoach - the AI-powered conversation coach that helps you text better, read signals, and level up every conversation.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
