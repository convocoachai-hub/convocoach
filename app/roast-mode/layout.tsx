import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roast Mode',
  description: 'Get brutally honest feedback on your texting. ConvoCoach Roast Mode pulls no punches.',
  openGraph: {
    title: 'Roast Mode | ConvoCoach',
    description: 'Get brutally honest feedback on your texting. ConvoCoach Roast Mode pulls no punches.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roast Mode | ConvoCoach',
    description: 'Get brutally honest feedback on your texting. ConvoCoach Roast Mode pulls no punches.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
