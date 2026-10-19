import type { ReactNode } from 'react';
import Link from 'next/link';
import { portfolioData } from '@/content/portfolio';
import PortfolioShell from './PortfolioShell';
import styles from './portfolio.module.css';

export default function DetailShell({ children }: { children: ReactNode }) {
  return (
    <PortfolioShell resumeHref={portfolioData.contact.resumeHref}>
      <main id="content" className={styles.detail}>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          ← Rijan Ghimire / Portfolio
        </Link>
        <article className="mt-8 space-y-8">{children}</article>
      </main>
    </PortfolioShell>
  );
}
