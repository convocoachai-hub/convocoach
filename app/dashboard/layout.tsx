import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Dashboard — Conversation Stats & Progress Tracker',
  description: 'View your conversation analysis history, skill progress, practice session results, and Rizz Link feedback. Track improvement over time with detailed AI-powered insights.',
  alternates: { canonical: 'https://convocoach.ai/dashboard' },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
  openGraph: {
    title: 'ConvoCoach Dashboard — Your Conversation Progress',
    description: 'Track your conversation skill growth, analysis history, practice sessions, and anonymous Rizz Link feedback in one place.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ConvoCoach Dashboard' }],
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
