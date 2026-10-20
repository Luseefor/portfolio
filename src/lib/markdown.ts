import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import hljs from 'highlight.js/lib/common';

export type ContentsEntry = { id: string; title: string; level: number };

/** Repository-authored Markdown, rendered on the server. Raw HTML is disabled. */
export function renderMarkdown(source: string) {
  const contents: ContentsEntry[] = [];
  const ids = new Set<string>(['sources']);
  const markdown = new MarkdownIt({
    html: false,
    linkify: false,
    highlight(code, language) {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
      }
      return '';
    },
  }).use(footnote);

  markdown.renderer.rules.heading_open = (tokens, index, options, env, renderer) => {
    const level = Number(tokens[index].tag.slice(1));
    if (level < 2) throw new Error('Article bodies start at h2; the page supplies the title.');
    const inline = tokens[index + 1];
    const title = (inline.children ?? [])
      .filter((token) => token.type === 'text' || token.type === 'code_inline')
      .map((token) => token.content)
      .join('');
    const base =
      title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '') || 'section';
    let id = base;
    for (let suffix = 2; ids.has(id); suffix++) id = `${base}-${suffix}`;
    ids.add(id);
    tokens[index].attrSet('id', id);
    if (level <= 3) contents.push({ id, title, level });
    return renderer.renderToken(tokens, index, options);
  };
  markdown.renderer.rules.table_open = () =>
    '<div class="article-table" tabindex="0" role="region" aria-label="Scrollable table"><table>';
  markdown.renderer.rules.table_close = () => '</table></div>\n';
  const image = markdown.renderer.rules.image!;
  markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
    tokens[index].attrSet('loading', 'lazy');
    tokens[index].attrSet('decoding', 'async');
    return image(tokens, index, options, env, renderer);
  };

  const html = markdown.render(source);
  const words = source
    .replace(/```[\s\S]*?```/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return { html, contents, readingMinutes: Math.max(1, Math.ceil(words / 220)) };
}
