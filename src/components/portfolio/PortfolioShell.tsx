'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import styles from './portfolio.module.css';

const MODE_KEY = 'portfolio-reading-mode';
const MODE_EVENT = 'portfolio-reading-mode-change';

function readMode(): 'light' | 'dark' {
  try {
    return localStorage.getItem(MODE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(MODE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(MODE_EVENT, onChange);
  };
}

let temporaryMode: 'light' | 'dark' | undefined;
const getMode = () => temporaryMode ?? readMode();
const getServerMode = () => 'light' as const;

export function usePortfolioMode() {
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);

  function toggleMode() {
    const next = mode === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(MODE_KEY, next);
      temporaryMode = undefined;
    } catch {
      temporaryMode = next;
    }
    window.dispatchEvent(new Event(MODE_EVENT));
  }

  return { mode, toggleMode };
}

export default function PortfolioShell({
  children,
  resumeHref,
  wide = false,
  immersive = false,
}: {
  children: ReactNode;
  resumeHref: string;
  wide?: boolean;
  immersive?: boolean;
}) {
  const { mode, toggleMode } = usePortfolioMode();
  if (immersive)
    return (
      <div className={`${styles.site} ${styles.playground}`} data-portfolio-theme={mode}>
        <a className={styles.skipLink} href="#content">
          Skip to playground
        </a>
        <Link href="/" className={styles.playgroundHome}>
          rijan.sh
        </Link>
        {children}
      </div>
    );
  return (
    <div className={`${styles.site} ${wide ? '' : styles.paperGrid}`} data-portfolio-theme={mode}>
      <div className={`${styles.container} ${wide ? styles.wideContainer : ''}`}>
        <a className={styles.skipLink} href="#content">
          Skip to content
        </a>
        <header className={styles.topbar}>
          <Link href="/" className={styles.wordmark}>
            rijan.sh<span aria-hidden="true"> /</span>
          </Link>
          <nav aria-label="Primary" className={styles.nav}>
            <Link href="/#projects">Projects</Link>
            <Link href="/writing">Writing</Link>
            <a href={resumeHref} download="Rijan-Ghimire-Resume.pdf">
              Resume ↗
            </a>
          </nav>
          <button
            type="button"
            onClick={toggleMode}
            className={styles.themeToggle}
            aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={mode === 'light' ? 'Dark engineering paper' : 'Light engineering paper'}
          >
            {mode === 'light' ? (
              <Moon size={17} aria-hidden="true" />
            ) : (
              <Sun size={17} aria-hidden="true" />
            )}
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
