import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import styles from '@/components/portfolio/editorial.module.css';
import { portfolioData } from '@/content/portfolio';
import { getWritingPost, getWritingPosts } from '@/lib/writing';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getWritingPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getWritingPost((await params).slug);
  if (!post) notFound();
  const title = `${post.title} | Rijan Ghimire`;
  return {
    title,
    description: post.summary,
    alternates: { canonical: post.href },
    authors: [{ name: portfolioData.hero.name }],
    openGraph: {
      title,
      description: post.summary,
      type: 'article',
      url: post.href,
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
    },
    twitter: { card: 'summary_large_image', title, description: post.summary },
  };
}

export default async function WritingPage({ params }: Props) {
  const post = getWritingPost((await params).slug);
  if (!post) notFound();
  const next = getWritingPosts().find((entry) => entry.slug !== post.slug);
  return (
    <PortfolioShell resumeHref={portfolioData.contact.resumeHref}>
      <main id="content" className={styles.article}>
        <Link href="/writing" className={styles.back}>
          ← All writing
        </Link>
        <article>
          <header className={styles.articleHeader}>
            <p className={styles.eyebrow}>{post.dateLabel}</p>
            <h1>{post.title}</h1>
            <p className={styles.dek}>{post.summary}</p>
            <div className={styles.byline}>
              <Image
                src="/images/profile/rijan-ghimire.png"
                alt=""
                width={36}
                height={36}
                sizes="36px"
              />
              <Link href="/">Rijan Ghimire</Link>
              <span>{post.readingMinutes} min read</span>
              {post.publishedAt ? (
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    timeZone: 'UTC',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              ) : null}
            </div>
          </header>
          <div className={styles.readingLayout}>
            <aside className={styles.contents}>
              {post.contents.length ? (
                <details open>
                  <summary>On this page</summary>
                  <nav aria-label="Article contents">
                    <ol>
                      {post.contents.map((entry) => (
                        <li key={entry.id} data-level={entry.level}>
                          <a href={`#${entry.id}`}>{entry.title}</a>
                        </li>
                      ))}
                      {post.sources?.length ? (
                        <li>
                          <a href="#sources">Sources</a>
                        </li>
                      ) : null}
                    </ol>
                  </nav>
                </details>
              ) : null}
            </aside>
            <div className={styles.prose}>
              {post.hasBody ? (
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
              ) : (
                <p>Full post coming soon</p>
              )}
              {post.sources?.length ? (
                <section className={styles.sources} aria-labelledby="sources">
                  <h2 id="sources">Sources</h2>
                  <ul>
                    {post.sources.map((source) => (
                      <li key={source.href}>
                        <a href={source.href} target="_blank" rel="noreferrer">
                          {source.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>
          <footer className={styles.articleFooter}>
            <Link href="/writing">← All writing</Link>
            {next ? <Link href={next.href}>Next: {next.title} →</Link> : null}
          </footer>
        </article>
      </main>
    </PortfolioShell>
  );
}
