import 'server-only';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { portfolioData } from '@/content/portfolio';
import { renderMarkdown } from './markdown';

export function getWritingPosts() {
  const slugs = new Set<string>();
  return portfolioData.writing
    .filter((post) => !post.draft)
    .map((post) => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || slugs.has(post.slug)) {
        throw new Error(`Invalid or duplicate writing slug: ${post.slug}`);
      }
      slugs.add(post.slug);
      if (post.href !== `/writing/${post.slug}`) {
        throw new Error(`Writing href must match its slug: ${post.slug}`);
      }
      if (
        post.publishedAt &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt) ||
          Number.isNaN(Date.parse(post.publishedAt)) ||
          new Date(post.publishedAt).toISOString().slice(0, 10) !== post.publishedAt)
      ) {
        throw new Error(`Use a valid YYYY-MM-DD publication date: ${post.slug}`);
      }
      const file = path.join(process.cwd(), 'src/content/writing', `${post.slug}.md`);
      const body = existsSync(file) ? readFileSync(file, 'utf8') : '';
      return { ...post, ...renderMarkdown(body), hasBody: Boolean(body.trim()) };
    });
}

export function getWritingPost(slug: string) {
  return getWritingPosts().find((post) => post.slug === slug);
}
