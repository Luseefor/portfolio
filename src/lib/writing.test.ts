// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('node:fs', () => ({
  existsSync: (p: string) => p.endsWith('ready.md'),
  readFileSync: () => '## A section\n\nA complete article.',
}));
vi.mock('@/content/portfolio', () => ({
  portfolioData: {
    writing: [
      {
        slug: 'ready',
        title: 'Ready',
        href: '/writing/ready',
        dateLabel: 'Essay',
        summary: 'Published body',
      },
      {
        slug: 'stub',
        title: 'Stub',
        href: '/writing/stub',
        dateLabel: 'Note',
        summary: 'No body yet',
      },
      {
        slug: 'private-draft',
        title: 'Draft',
        href: '/writing/private-draft',
        dateLabel: 'Essay',
        summary: 'Hidden',
        draft: true,
      },
    ],
  },
}));
import { getWritingPosts, getWritingPost } from './writing';

describe('published writing', () => {
  it('excludes drafts from both discovery and direct lookup', () => {
    expect(getWritingPosts().map((p) => p.slug)).toEqual(['ready', 'stub']);
    expect(getWritingPost('private-draft')).toBeUndefined();
    expect(getWritingPost('../ready')).toBeUndefined();
  });
  it('renders full posts and preserves intentional stubs', () => {
    expect(getWritingPost('ready')?.html).toContain('A complete article.');
    expect(getWritingPost('ready')?.contents[0].id).toBe('a-section');
    expect(getWritingPost('stub')?.hasBody).toBe(false);
  });
});
