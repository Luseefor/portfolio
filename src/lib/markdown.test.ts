import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('article rendering', () => {
  it('supports long-form structure, tables, highlighted code and footnotes', () => {
    const post = renderMarkdown(
      '## Contract\n\nA note.[^1]\n\n| Input | Output |\n| --- | --- |\n| a | b |\n\n```ts\nconst limit = 4;\n```\n\n> A boundary.\n\n[^1]: Source detail.',
    );
    expect(post.contents).toEqual([{ id: 'contract', title: 'Contract', level: 2 }]);
    expect(post.html).toContain('<table>');
    expect(post.html).toContain('hljs-keyword');
    expect(post.html).toContain('footnote-ref');
    expect(post.html).toContain('<blockquote>');
    expect(post.readingMinutes).toBe(1);
  });

  it('keeps repeated, formatted and non-Latin headings addressable', () => {
    const { contents } = renderMarkdown(
      '## A `boundary`\n\n## A boundary\n\n## 证明\n\n## Sources',
    );
    expect(contents.map((h) => h.id)).toEqual(['a-boundary', 'a-boundary-2', '证明', 'sources-2']);
    expect(() => renderMarkdown('# Duplicate page title')).toThrow('start at h2');
  });

  it('escapes raw HTML and blocks executable links while preserving code', () => {
    const { html } = renderMarkdown(
      '<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n\n```unknown\n<img src=x onerror=alert(1)>\n```',
    );
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('&lt;img');
  });

  it('keeps wide content in scrollable regions and lazy-loads images', () => {
    const { html } = renderMarkdown(
      '| a | b |\n| --- | --- |\n| 1 | 2 |\n\n![Surface](/images/projects/vinculum.png)',
    );
    expect(html).toContain('aria-label="Scrollable table"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Surface"');
  });
});
