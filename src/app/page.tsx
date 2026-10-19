import Link from 'next/link';
import { Download } from 'lucide-react';
import PersonalAssistantBlob from '@/components/assistant/PersonalAssistantBlob';
import CopyEmailButton from '@/components/portfolio/CopyEmailButton';
import GitHubActivity from '@/components/portfolio/GitHubActivity';
import PortfolioContactForm from '@/components/portfolio/PortfolioContactForm';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import ProjectActions from '@/components/portfolio/ProjectActions';
import styles from '@/components/portfolio/portfolio.module.css';
import { portfolioData } from '@/content/portfolio';

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
          <h1 id="name">{portfolioData.hero.name}</h1>
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
          <div className={styles.sectionHeading}>
            <h2 id="projects-title">Selected projects</h2>
            <span>Tools, products, and systems</span>
          </div>
          <article className={styles.featured}>
            <p className={styles.meta}>Featured project · {featured.status}</p>
            <h3>{featured.title}</h3>
            <p>{portfolioData.featuredProject.summary}</p>
            <div className={styles.stack}>{featured.stack.join(' · ')}</div>
            <div className={styles.projectActions}>
              <ProjectActions project={featured} />
            </div>
          </article>
          {projects.map((project) => (
            <article key={project.slug} className={styles.projectRow}>
              <div>
                <h3>{project.title}</h3>
                <p className={styles.meta}>{project.category}</p>
                <div className={styles.stack}>{project.stack.join(' · ')}</div>
              </div>
              <div>
                <p>{project.summary}</p>
                <div className={styles.projectActions}>
                  <ProjectActions project={project} />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section id="writing" className={styles.section} aria-labelledby="writing-title">
          <div className={styles.sectionHeading}>
            <h2 id="writing-title">Writing</h2>
            <span>Notes from building</span>
          </div>
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
          <div className={styles.sectionHeading}>
            <h2 id="background-title">Background</h2>
          </div>
          {portfolioData.timeline.map((entry) => (
            <article key={`${entry.period}-${entry.title}`} className={styles.timelineRow}>
              <span className={styles.meta}>{entry.period}</span>
              <div>
                <h3>{entry.title}</h3>
                <p className={styles.company}>{entry.organization}</p>
                <ul>
                  <li>{entry.summary}</li>
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
          <div className={styles.sectionHeading}>
            <h2 id="contact-title">Contact</h2>
          </div>
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
