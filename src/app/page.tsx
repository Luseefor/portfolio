import Link from 'next/link';
import { Download } from 'lucide-react';
import PersonalAssistantBlob from '@/components/assistant/PersonalAssistantBlob';
import CopyEmailButton from '@/components/portfolio/CopyEmailButton';
import GitHubActivity from '@/components/portfolio/GitHubActivity';
import PortfolioContactForm from '@/components/portfolio/PortfolioContactForm';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import PaperText from '@/components/portfolio/PaperText';
import { ProjectCornerTicks, LiveDemoStamp } from '@/components/portfolio/ProjectPaperMarks';
import ProjectActions from '@/components/portfolio/ProjectActions';
import styles from '@/components/portfolio/portfolio.module.css';
import { portfolioData } from '@/content/portfolio';

function SectionLabel({
  number,
  label,
  id,
  caption,
}: {
  number: string;
  label: string;
  id: string;
  caption?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <h2 id={id}>
        <span className={styles.figureNumber} aria-hidden="true">
          fig. {number} —{' '}
        </span>
        {label}
      </h2>
      {caption ? <span>{caption}</span> : null}
    </div>
  );
}

export default function Home() {
  const featured = portfolioData.projects.find(
    (project) => project.slug === portfolioData.featuredProject.slug,
  )!;
  const projects = portfolioData.selectedProjectSlugs.flatMap((slug) =>
    portfolioData.projects.filter((project) => project.slug === slug),
  );

  return (
    <PortfolioShell resumeHref={portfolioData.contact.resumeHref}>
      <main id="content">
        <section className={styles.hero} aria-labelledby="name">
          <p className={styles.eyebrow}>{portfolioData.hero.roleLabel}</p>
          <div className={styles.namePlot}>
            <svg
              className={styles.heroCurve}
              viewBox="0 0 360 160"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 80H348M180 12V148" stroke="currentColor" strokeWidth="1" />
              <path
                d="M12 80C40 80 40 24 68 24S96 136 124 136 152 24 180 24 208 136 236 136 264 24 292 24 320 80 348 80"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <h1 id="name">{portfolioData.hero.name}</h1>
          </div>
          <p className={styles.lead}>{portfolioData.hero.headline}</p>
          <p className={styles.intro}>{portfolioData.hero.summary}</p>
          <p className={styles.availability}>{portfolioData.hero.status}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#projects">
              View Projects <span aria-hidden="true">→</span>
            </a>
            <a href={portfolioData.contact.resumeHref} download="Rijan-Ghimire-Resume.pdf">
              Download Resume <Download size={14} aria-hidden="true" />
            </a>
            <CopyEmailButton email={portfolioData.contact.email} />
          </div>
        </section>

        <nav aria-label="On this page" className={styles.pageNav}>
          <a href="#projects">Projects</a>
          <a href="#writing">Writing</a>
          <a href="#experience">Background</a>
          <a href="#contact">Contact</a>
        </nav>

        <section id="projects" className={styles.section} aria-labelledby="projects-title">
          <SectionLabel
            number="01"
            label="Selected systems"
            id="projects-title"
            caption="Tools, products, and systems"
          />
          <article className={`${styles.featured} ${styles.projectCard}`}>
            <ProjectCornerTicks />
            <div className={styles.cardHeading}>
              <p className={styles.meta}>Featured project · {featured.status}</p>
              <LiveDemoStamp href={featured.demoHref} />
            </div>
            <h3>{featured.title}</h3>
            <p>
              <PaperText text={portfolioData.featuredProject.summary} />
            </p>
            <div className={styles.stack}>{featured.stack.join(' · ')}</div>
            <div className={styles.projectActions}>
              <ProjectActions project={featured} />
            </div>
          </article>
          {projects.map((project) => (
            <article key={project.slug} className={styles.projectCard}>
              <ProjectCornerTicks />
              <div className={styles.cardHeading}>
                <p className={styles.meta}>{project.category}</p>
                <LiveDemoStamp href={project.demoHref} />
              </div>
              <div className={styles.projectRow}>
                <div>
                  <h3>{project.title}</h3>
                  <div className={styles.stack}>{project.stack.join(' · ')}</div>
                </div>
                <div>
                  <p>
                    <PaperText text={project.summary} />
                  </p>
                  <div className={styles.projectActions}>
                    <ProjectActions project={project} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section id="writing" className={styles.section} aria-labelledby="writing-title">
          <SectionLabel
            number="02"
            label="Writing"
            id="writing-title"
            caption="Notes from building"
          />
          {portfolioData.writing.slice(0, 3).map((post) => (
            <article key={post.slug} className={styles.writingRow}>
              <span className={styles.meta}>{post.dateLabel}</span>
              <div>
                <h3>
                  <Link href={post.href}>{post.title}</Link>
                </h3>
                <p>{post.summary}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="experience" className={styles.section} aria-labelledby="background-title">
          <SectionLabel number="03" label="Background" id="background-title" />
          {portfolioData.timeline.map((entry) => (
            <article key={`${entry.period}-${entry.title}`} className={styles.timelineRow}>
              <span className={styles.meta}>{entry.period}</span>
              <div>
                <h3>{entry.title}</h3>
                <p className={styles.company}>{entry.organization}</p>
                <ul>
                  <li>
                    <PaperText text={entry.summary} />
                  </li>
                </ul>
              </div>
            </article>
          ))}
          <div className={styles.technologies}>
            <h3>Technologies</h3>
            <dl>
              {portfolioData.skills.map((group) => (
                <div key={group.label} className={styles.skillRow}>
                  <dt>{group.label}</dt>
                  <dd>{group.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </div>
          <details className={styles.details}>
            <summary>Recent GitHub activity</summary>
            <GitHubActivity
              accent="var(--link)"
              subtleBorder="var(--line)"
              mutedText="var(--secondary)"
              metaText="var(--secondary)"
              githubUrl={portfolioData.contact.github}
            />
          </details>
        </section>

        <section id="contact" className={styles.section} aria-labelledby="contact-title">
          <SectionLabel number="04" label="Contact" id="contact-title" />
          <p className={styles.contactIntro}>{portfolioData.contact.note}</p>
          <a className={styles.email} href={`mailto:${portfolioData.contact.email}`}>
            {portfolioData.contact.email} ↗
          </a>
          <details className={`${styles.details} ${styles.contactForm}`}>
            <summary>Prefer a form? Send a note.</summary>
            <PortfolioContactForm
              accent="var(--button)"
              surfaceStyle={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface)' }}
              inputStyle={{
                borderColor: 'var(--line)',
                backgroundColor: 'var(--paper)',
                color: 'var(--ink)',
              }}
              mutedTextStyle={{ color: 'var(--secondary)' }}
              labelStyle={{ color: 'var(--ink)' }}
            />
          </details>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>
          {portfolioData.hero.name} · {portfolioData.location}
        </span>
        <nav aria-label="Elsewhere">
          <a href={portfolioData.contact.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href={portfolioData.contact.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <Link href="/interactive" prefetch={false}>
            Interactive demo ↗
          </Link>
        </nav>
      </footer>
      <PersonalAssistantBlob />
    </PortfolioShell>
  );
}
