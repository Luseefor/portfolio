import styles from './paper.module.css';

export default function StepFigure() {
  const h = 0.73;
  const x = 180 + 220 * Math.cos(h);
  const y = 240 - 220 * Math.sin(h);
  return (
    <figure className={styles.stepFigure}>
      <svg
        viewBox="0 0 640 280"
        role="img"
        aria-labelledby="step-title"
        aria-describedby="step-description"
      >
        <title id="step-title">A tangent step overshoots the circle</title>
        <desc id="step-description">
          Starting at the right side of the circle, Euler moves straight upward. The exact path
          bends left, so the estimate ends outside the circle.
        </desc>
        <path d="M110 240 H560 M180 260 V28" className={styles.axis} />
        <path d="M180 240 H400 V79.4" className={styles.construction} />
        <path d="M400 240 A220 220 0 0 0 290 49.5" className={styles.exactLine} />
        <path d="M400 240 V79.4" className={styles.eulerLine} />
        <path d={`M${x} ${y} L400 79.4`} className={styles.construction} />
        <circle cx="400" cy="240" r="5" className={styles.dot} />
        <circle cx={x} cy={y} r="5" className={styles.dot} />
        <rect x="395" y="74.4" width="10" height="10" className={styles.eulerDot} />
        <text x="414" y="246" className={styles.svgLabel}>
          start (1, 0)
        </text>
        <text x="420" y="81" className={styles.svgLabel}>
          Euler estimate
        </text>
        <text x="205" y="91" className={styles.svgLabel}>
          exact turn
        </text>
        <text x="420" y="165" className={styles.svgLabel}>
          one straight step
        </text>
      </svg>
      <figcaption>
        A straight step leaves the circle immediately. Shown with a time step of 0.73.
      </figcaption>
    </figure>
  );
}
