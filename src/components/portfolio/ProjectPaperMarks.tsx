import styles from './portfolio.module.css';

export function ProjectCornerTicks() {
  return (
    <span className={styles.cornerTicks} aria-hidden="true">
      {[0, 1, 2, 3].map((corner) => (
        <svg key={corner} viewBox="0 0 18 18" fill="none" focusable="false">
          <path
            d="M2.1 15.5 2.8 3.2 15.7 2.4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

export function LiveDemoStamp({ href }: { href?: string }) {
  if (!href) return null;
  return (
    <span
      className={styles.liveStamp}
      data-live-stamp
      role="img"
      aria-label="Live demo link available"
      title="Live demo link available"
    >
      <span lang="zh-Hans" aria-hidden="true">
        证明
      </span>
      <span className={styles.stampCaption} aria-hidden="true">
        LIVE
      </span>
    </span>
  );
}
