import type { MetadataRoute } from 'next';
import { portfolioData } from '@/content/portfolio';
import { getWritingPosts } from '@/lib/writing';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/writing',
    '/interactive',
    ...portfolioData.projects.map((p) => `/projects/${p.slug}`),
    ...getWritingPosts().map((p) => p.href),
  ].map((pathname) => ({ url: new URL(pathname, 'https://www.rijan.sh').href }));
}
