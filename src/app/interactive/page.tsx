import type { Metadata } from 'next';
import Link from 'next/link';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import RotationExperiment from '@/components/paper/RotationExperiment';
import StepFigure from '@/components/paper/StepFigure';
import { integrateRotation, positionError } from '@/lib/integration';
import { portfolioData } from '@/content/portfolio';
import styles from '@/components/paper/paper.module.css';

const title = 'Small steps. Growing errors.';
const description =
  'An interactive paper on numerical approximation. Change the step size and see why Euler turns a circle into a spiral, then compare explicit midpoint.';
export const metadata: Metadata = {
  title: `${title} | Rijan Ghimire`,
  description,
  alternates: { canonical: '/interactive' },
  openGraph: { title, description, type: 'article', url: '/interactive' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function InteractivePaper() {
  return (
    <PortfolioShell resumeHref={portfolioData.contact.resumeHref}>
      <main id="content" tabIndex={-1} className={styles.paper}>
        <div className={styles.edition}>
          <Link href="/">← Portfolio</Link>
          <span>Interactive paper / 01</span>
        </div>
        <article>
          <header className={styles.masthead}>
            <p className={styles.kicker}>Numerical methods · An explorable explanation</p>
            <h1>
              Small steps.
              <br />
              Growing errors.
            </h1>
            <p className={styles.dek}>
              A circle should end where it began. Why does a computer draw a spiral instead?
            </p>
            <div className={styles.byline}>
              <span>Written and built by Rijan Ghimire</span>
              <a href="#experiment">Try the experiment ↓</a>
            </div>
          </header>
          <div className={styles.opening}>
            <p>
              To simulate motion, we often advance one step at a time. We know where a point is and
              which way it is moving. We estimate where it will be next, then repeat.
            </p>
            <p>That small decision has a shape. Let’s make it visible.</p>
          </div>
          <section className={styles.section} aria-labelledby="one-step">
            <p className={styles.kicker}>fig. 01 / The local decision</p>
            <h2 id="one-step">A tangent is not a turn.</h2>
            <div className={styles.prose}>
              <p>
                Imagine a point moving counterclockwise around a circle of radius one. At any
                position, its velocity points along the tangent. Starting at <code>(1, 0)</code>,
                the rule is simple:
              </p>
              <p className={styles.equation}>
                dx/dt = −y <span>dy/dt = x</span>
              </p>
              <p>
                The exact position is <code>(cos t, sin t)</code>. But suppose we only follow the
                velocity we know <em>right now</em>. Euler’s method takes a straight step along that
                tangent. The direction should turn during the step. Our estimate does not.
              </p>
            </div>
            <StepFigure />
          </section>
          <section id="experiment" className={styles.section} aria-labelledby="many-steps">
            <p className={styles.kicker}>fig. 02 / The accumulated consequence</p>
            <h2 id="many-steps">Repeat the guess.</h2>
            <div className={styles.prose}>
              <p>
                Each new position becomes the starting point for the next estimate. After one
                revolution, the errors have a pattern: Euler spirals outward. The exact path stays
                on the circle.
              </p>
              <p>
                Change the number of steps, then replay or scrub the turn. More steps mean a smaller
                time interval per guess. The plot uses the same scale for all three paths.
              </p>
            </div>
            <RotationExperiment />
          </section>
          <section className={styles.section} aria-labelledby="better-guess">
            <p className={styles.kicker}>fig. 03 / A more informed step</p>
            <h2 id="better-guess">Look halfway ahead.</h2>
            <div className={styles.prose}>
              <p>
                Explicit midpoint makes a trial move halfway through the interval. It measures the
                direction there, then uses that direction for the full step from the original
                position. One extra velocity evaluation brings the path much closer to the circle.
              </p>
              <div className={styles.methods}>
                <div>
                  <h3>Euler</h3>
                  <p>Use the direction at the start.</p>
                  <pre>
                    <code>{'next = p + h × f(p)'}</code>
                  </pre>
                </div>
                <div>
                  <h3>Explicit midpoint</h3>
                  <p>Estimate the direction halfway through.</p>
                  <pre>
                    <code>{'half = p + h/2 × f(p)\nnext = p + h × f(half)'}</code>
                  </pre>
                </div>
              </div>
              <p>
                Here, <code>p</code> is the position, <code>h</code> is the time step, and{' '}
                <code>f(x, y) = (−y, x)</code> is the velocity. Both methods still approximate the
                motion. Midpoint is better in this experiment, not exact.
              </p>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <caption>Distance from the exact position after one revolution</caption>
                <thead>
                  <tr>
                    <th scope="col">Steps</th>
                    <th scope="col">Euler error</th>
                    <th scope="col">Midpoint error</th>
                  </tr>
                </thead>
                <tbody>
                  {[16, 32, 64, 128].map((steps) => (
                    <tr key={steps}>
                      <th scope="row">{steps}</th>
                      {(['euler', 'midpoint'] as const).map((method) => (
                        <td key={method}>
                          {positionError(
                            integrateRotation(steps, method)[steps],
                            2 * Math.PI,
                          ).toFixed(4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.prose}>
              <p>
                These numbers come from the same model as the diagram, in units of the circle’s
                radius. They measure position error at <code>t = 2π</code>, not the largest error
                anywhere along the path.
              </p>
              <p>
                The engineering lesson is to check the approximation against something you know.
                Reduce the step size. Compare methods. Look for convergence before trusting a
                convincing picture.
              </p>
            </div>
          </section>
          <aside className={styles.notes} aria-labelledby="model-notes">
            <h2 id="model-notes">About this model</h2>
            <p>
              This is a deterministic teaching model, using fixed time steps and JavaScript
              floating-point arithmetic. It is not a benchmark of Vinculum or a general-purpose
              physics solver. The explicit midpoint method shown here does not preserve the circle
              exactly.
            </p>
            <p>
              The plot fits the complete paths when you change the step count, then holds that scale
              while you scrub. Playback is optional; every state is also available through the time
              slider.
            </p>
            <h3>Further reading</h3>
            <ul>
              <li>
                <a href="https://www.jirka.org/diffyqs/html/numer_section.html">
                  Jiří Lebl · Euler’s method ↗
                </a>
              </li>
              <li>
                <a href="https://ketch.github.io/numipedia/methods/Mid22.html">
                  David Ketcheson · Midpoint Runge–Kutta ↗
                </a>
              </li>
            </ul>
          </aside>
          <footer className={styles.footer}>
            <p>A small experiment in making computation visible.</p>
            <div>
              <Link href="/projects/vinculum">Explore Vinculum →</Link>
              <Link href="/writing">Read the field notes →</Link>
            </div>
          </footer>
        </article>
      </main>
    </PortfolioShell>
  );
}
