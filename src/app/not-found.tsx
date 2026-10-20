import Link from 'next/link';
import type { Metadata } from 'next';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import { portfolioData } from '@/content/portfolio';
import styles from '@/components/portfolio/portfolio.module.css';

export const metadata: Metadata = {
  title: 'Page not found | Rijan Ghimire',
  description: "Find Rijan Ghimire's projects and engineering writing.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <PortfolioShell resumeHref={portfolioData.contact.resumeHref}>
      <main id="content" tabIndex={-1} className={styles.missingPage}>
        <p className={styles.eyebrow}>404 / Missing page</p>
        <h1>Page not found</h1>
        <p>The page may have moved, or the address may be incorrect.</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Back to home <span aria-hidden="true">→</span>
          </Link>
          <Link href="/#projects">View projects</Link>
          <Link href="/writing">Browse writing</Link>
        </div>
      </main>
    </PortfolioShell>
  );
}
