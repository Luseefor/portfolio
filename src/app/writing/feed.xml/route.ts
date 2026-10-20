import { getWritingPosts } from '@/lib/writing';
export const dynamic = 'force-static';
function xml(text: string) {
  return text.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
}
export function GET() {
  const items = getWritingPosts()
    .map(
      (post) =>
        `<item><title>${xml(post.title)}</title><link>https://www.rijan.sh${post.href}</link><guid isPermaLink="true">https://www.rijan.sh${post.href}</guid><description>${xml(post.summary)}</description>${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}</item>`,
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Rijan Ghimire / Writing</title><link>https://www.rijan.sh/writing</link><description>Engineering notes on mathematical software and developer tools.</description><language>en-us</language>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
}
