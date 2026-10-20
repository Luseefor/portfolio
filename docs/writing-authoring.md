# Publishing an article

The archive is `/writing`. Article pages render Markdown on the server and work without JavaScript. Metadata and ordering live in `src/content/portfolio.ts`; bodies live in `src/content/writing/`.

1. Add an entry to `portfolioData.writing`. Put it first if it should lead the archive and homepage.
2. Create `src/content/writing/<slug>.md`. Copy `docs/article-template.md` as a starting point.
3. Run `npm run lint`, `npm run build`, and `CI=1 npm test`. Preview `/writing/<slug>` in both reading modes and at phone width.
4. Remove `draft: true` when it is ready to publish. Commit and deploy through the normal Git workflow.

```ts
{
  slug: 'your-article-slug',
  title: 'The actual title',
  summary: 'One or two sentences explaining the question this article answers.',
  dateLabel: 'Essay', // Or 'Implementation note', 'Research note', etc.
  href: '/writing/your-article-slug',
  draft: true,
  // publishedAt: '2026-10-20', // Set the actual publication date when publishing.
  sources: [
    { label: 'Relevant source', href: 'https://example.com/source' },
  ],
},
```

A draft has no public page, archive entry, homepage card, sitemap URL, or RSS item. An unregistered Markdown file is also unpublished. A published entry without a body deliberately shows “Full post coming soon”. No empty example essay is published.

## Article formatting

- Start body headings at `##`. The page supplies the title. `##` and `###` generate a table of contents with unique links. Repeated headings get numbered IDs.
- Use fenced code blocks with a language such as `ts`, `rust`, `python`, or `sql`. Common languages receive server-rendered syntax highlighting; unknown languages remain escaped plain code. Long lines scroll within the code block.
- Tables, blockquotes, lists, links, images, and `[^footnotes]` work. Raw HTML is disabled. This is Markdown, not MDX; articles cannot run React or browser scripts.
- Put article images in `public/images/writing/`. Use descriptive alt text, then a separate italic caption with the source. Keep images reasonably sized. For example `![Surface plotted in the editor](/images/writing/surface.png)`.
- Keep citations in `sources` for a reference list, or use inline links and footnotes for specific claims. Pin repository links to commit hashes when describing implementation details.
- `publishedAt` is optional ISO `YYYY-MM-DD`. Existing notes intentionally have no invented publication date. Reading time is derived from the body word count at 220 words per minute, excluding fenced code.

The first three published entries appear on the homepage. The complete archive, RSS feed at `/writing/feed.xml`, article social images, and sitemap update from the same records. RSS provides summaries and links to the full articles.

Use the browser's Print command to export an article. Print styles remove navigation and contents links and use dark text on white paper.
