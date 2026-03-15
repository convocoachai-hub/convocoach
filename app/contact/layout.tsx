import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ConvoCoach team. Questions, feedback, or partnership inquiries.',
  openGraph: {
    title: 'Contact Us | ConvoCoach',
    description: 'Get in touch with the ConvoCoach team. Questions, feedback, or partnership inquiries.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | ConvoCoach',
    description: 'Get in touch with the ConvoCoach team. Questions, feedback, or partnership inquiries.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
