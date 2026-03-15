// app/sitemap.ts
import { MetadataRoute } from 'next';

const BASE_URL = 'https://convocoach.ai';

const EXAMPLE_SLUGS = ['flirty-texting', 'dry-texting', 'ghosting', 'high-attraction'];
const RESOURCE_SLUGS = ['dating-psychology', 'texting-guides', 'attraction-signals', 'flirting-over-text', 'stop-dry-texting', 'conversation-examples'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/upload`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/practice`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/examples`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const examplePages: MetadataRoute.Sitemap = EXAMPLE_SLUGS.map(slug => ({
    url: `${BASE_URL}/examples/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const resourcePages: MetadataRoute.Sitemap = RESOURCE_SLUGS.map(slug => ({
    url: `${BASE_URL}/resources/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...examplePages, ...resourcePages];
}
