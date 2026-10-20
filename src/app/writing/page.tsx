import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import styles from '@/components/portfolio/editorial.module.css';
import { portfolioData } from '@/content/portfolio';
import { getWritingPosts } from '@/lib/writing';

export const metadata: Metadata = {
  title: 'Writing | Rijan Ghimire',
  description:
    'Engineering notes on mathematical software, developer tools, and the decisions behind them.',
  alternates: { canonical: '/writing', types: { 'application/rss+xml': '/writing/feed.xml' } },
};

export default function WritingIndex() {
  const posts = getWritingPosts();
  return (
    <PortfolioShell resumeHref={portfolioData.contact.resumeHref}>
      <main id="content" className={styles.archive}>
        <header className={styles.masthead}>
          <p className={styles.eyebrow}>Rijan Ghimire / Engineering notebook</p>
          <h1>Writing</h1>
          <p>
            Notes on the software I build. Design decisions, implementation details, and the limits
            of each approach.
          </p>
        </header>
        <div className={`${styles.edition} ${styles.eyebrow}`}>
          <span>Mathematics · Software · Systems</span>
          <span>
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} ·{' '}
            <a href="/writing/feed.xml">RSS ↗</a>
          </span>
        </div>
        <div className={styles.stories}>
          {posts.map((post) => (
            <article key={post.slug} className={styles.story}>
              <span className={styles.eyebrow}>
                {post.dateLabel} ·{' '}
                {post.hasBody ? `${post.readingMinutes} min read` : 'Post planned'}
              </span>
              <h2>
                <Link href={post.href}>{post.title}</Link>
              </h2>
              <p>{post.summary}</p>
              <Link href={post.href} className={styles.readLink}>
                Read article <span aria-hidden="true">&nbsp;→</span>
              </Link>
            </article>
          ))}
        </div>
        <footer className={styles.archiveFooter}>
          <Image
            src="/images/profile/rijan-ghimire.png"
            alt="Rijan Ghimire"
            width={64}
            height={64}
            sizes="64px"
          />
          <div>
            <p>Written by Rijan Ghimire</p>
            <p>Computer Engineering and Mathematics at Southern Miss.</p>
            <Link href="/" className={styles.readLink}>
              Explore my work →
            </Link>
          </div>
        </footer>
      </main>
    </PortfolioShell>
  );
}
