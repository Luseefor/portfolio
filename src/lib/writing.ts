import 'server-only';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { portfolioData } from '@/content/portfolio';
import { renderMarkdown } from './markdown';

export function getWritingPosts() {
  return portfolioData.writing
    .filter((post) => !post.draft)
    .map((post) => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
        throw new Error(`Invalid writing slug: ${post.slug}`);
      }
      const file = path.join(process.cwd(), 'src/content/writing', `${post.slug}.md`);
      const body = existsSync(file) ? readFileSync(file, 'utf8') : '';
      return { ...post, ...renderMarkdown(body), hasBody: Boolean(body.trim()) };
    });
}

export function getWritingPost(slug: string) {
  return getWritingPosts().find((post) => post.slug === slug);
}
