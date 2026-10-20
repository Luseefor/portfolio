import Link from 'next/link';
import Image from 'next/image';
import { Download } from 'lucide-react';
import CopyEmailButton from '@/components/portfolio/CopyEmailButton';
import PortfolioContactForm from '@/components/portfolio/PortfolioContactForm';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import PaperText from '@/components/portfolio/PaperText';
import ProjectActions from '@/components/portfolio/ProjectActions';
import ProjectFigure from '@/components/portfolio/ProjectFigure';
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
  const additionalProjects = portfolioData.additionalProjectSlugs.flatMap((slug) =>
    portfolioData.projects.filter((project) => project.slug === slug),
  );

  return (
    <PortfolioShell resumeHref={portfolioData.contact.resumeHref}>
      <main id="content">
        <section className={styles.hero} aria-labelledby="name">
          <div className={styles.heroHeading}>
            <div>
              <p className={styles.eyebrow}>{portfolioData.hero.roleLabel}</p>
              <h1 id="name">{portfolioData.hero.name}</h1>
            </div>
            <Image
              className={styles.portrait}
              src="/images/profile/rijan-ghimire.png"
              alt="Rijan Ghimire"
              width={88}
              height={88}
              sizes="88px"
            />
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

        <section id="projects" className={styles.section} aria-labelledby="projects-title">
          <SectionLabel
            number="01"
            label="Selected systems"
            id="projects-title"
            caption="Implementation notes and source code"
          />
          <article className={`${styles.featured} ${styles.projectCard}`}>
            <p className={styles.meta}>Featured project · {featured.status}</p>
            <h3>{featured.title}</h3>
            <div className={styles.featuredBody}>
              <p>
                <PaperText text={portfolioData.featuredProject.summary} />
              </p>
              <ProjectFigure slug={featured.slug} compact />
            </div>
            <div className={styles.stack}>{featured.stack.join(' · ')}</div>
            <div className={styles.projectActions}>
              <ProjectActions project={featured} />
            </div>
          </article>
          {projects.map((project) => (
            <article key={project.slug} className={styles.projectCard}>
              <p className={styles.meta}>{project.category}</p>
              <div className={styles.projectRow}>
                <div>
                  <h3>{project.title}</h3>
                  <div className={styles.stack}>{project.stack.join(' · ')}</div>
                  <ProjectFigure slug={project.slug} compact />
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
          <details className={styles.details}>
            <summary>More work</summary>
            <ul className="mt-3 space-y-3">
              {additionalProjects.map((project) => (
                <li key={project.slug} className="flex flex-wrap items-baseline gap-x-4">
                  <Link href={`/projects/${project.slug}`} className="underline">
                    {project.title}
                  </Link>
                  <span className={styles.meta}>{project.category}</span>
                </li>
              ))}
            </ul>
          </details>
        </section>

        <section id="writing" className={styles.section} aria-labelledby="writing-title">
          <SectionLabel
            number="02"
            label="Writing"
            id="writing-title"
            caption="Notes from building"
          />
          {portfolioData.writing
            .filter((post) => !post.draft)
            .slice(0, 3)
            .map((post) => (
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
          <Link href="/writing" className={styles.archiveLink}>
            Browse all writing →
          </Link>
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
    </PortfolioShell>
  );
}
