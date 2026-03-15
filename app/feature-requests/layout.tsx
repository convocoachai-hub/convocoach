import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feature Requests',
  description: 'Suggest a feature for ConvoCoach. Your feedback shapes our product.',
  openGraph: {
    title: 'Feature Requests | ConvoCoach',
    description: 'Suggest a feature for ConvoCoach. Your feedback shapes our product.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feature Requests | ConvoCoach',
    description: 'Suggest a feature for ConvoCoach. Your feedback shapes our product.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
