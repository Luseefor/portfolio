import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PaperText from '@/components/portfolio/PaperText';
import DetailShell from '@/components/portfolio/DetailShell';
import ProjectActions from '@/components/portfolio/ProjectActions';
import { getPortfolioProject, portfolioData } from '@/content/portfolio';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return portfolioData.projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getPortfolioProject((await params).slug);
  if (!project) notFound();
  const title = `${project.title} | Rijan Ghimire`;
  return {
    title,
    description: project.summary,
    openGraph: { title, description: project.summary, type: 'article' },
    twitter: { card: 'summary', title, description: project.summary },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = getPortfolioProject((await params).slug);
  if (!project) notFound();

  return (
    <DetailShell>
      <header>
        <p className="font-terminal text-xs uppercase tracking-widest text-[var(--text-secondary)]">
          {project.category}
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold sm:text-6xl">{project.title}</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
          <PaperText text={project.summary} />
        </p>
      </header>
      <dl className="grid grid-cols-2 gap-6 border-y border-[var(--border-default)] py-6">
        {[
          ['Status', project.status],
          ['Role', project.role],
          ['Focus', project.focus],
          ['Domains', project.domains],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="font-terminal text-xs uppercase tracking-widest text-[var(--text-secondary)]">
              {label}
            </dt>
            <dd className="mt-2 leading-7">
              <PaperText text={value} />
            </dd>
          </div>
        ))}
      </dl>
      {project.caseStudy ? (
        <section aria-labelledby="problem-title">
          <h2 id="problem-title" className="font-display text-3xl font-semibold">
            Problem
          </h2>
          <p className="mt-3 leading-8 text-[var(--text-secondary)]">
            <PaperText text={project.caseStudy.problem} />
          </p>
        </section>
      ) : null}
      {[
        ['What I owned', project.ownership],
        ['Result', project.result],
      ].map(([label, value]) => (
        <section key={label}>
          <h2 className="font-display text-3xl font-semibold">{label}</h2>
          <p className="mt-3 leading-8 text-[var(--text-secondary)]">
            <PaperText text={value} />
          </p>
        </section>
      ))}
      {project.caseStudy ? (
        <>
          <section aria-labelledby="decisions-title">
            <h2 id="decisions-title" className="font-display text-3xl font-semibold">
              Engineering decisions
            </h2>
            <ul className="mt-5 space-y-6">
              {project.caseStudy.decisions.map((decision) => (
                <li key={decision.title} className="border-t border-[var(--border-default)] pt-5">
                  <h3 className="text-2xl font-semibold">{decision.title}</h3>
                  <p className="mt-3 leading-8 text-[var(--text-secondary)]">
                    <PaperText text={decision.description} />
                  </p>
                  <a
                    href={decision.source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center text-sm underline"
                  >
                    {decision.source.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="constraints-title">
            <h2 id="constraints-title" className="font-display text-3xl font-semibold">
              Constraints
            </h2>
            <p className="mt-3 leading-8 text-[var(--text-secondary)]">
              <PaperText text={project.caseStudy.limitation.description} />
            </p>
            <a
              href={project.caseStudy.limitation.source.href}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex min-h-11 items-center text-sm underline"
            >
              {project.caseStudy.limitation.source.label} ↗
            </a>
          </section>
        </>
      ) : null}
      <section>
        <h2 className="font-display text-3xl font-semibold">Stack</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <li key={item} className="border border-[var(--border-default)] px-3 py-2 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <footer className="border-t border-[var(--border-default)] py-6">
        {project.demoHref || (project.codeHref && !project.hideRepository) ? (
          <ProjectActions project={project} showDetails={false} />
        ) : (
          <a
            href={`mailto:${portfolioData.contact.email}`}
            className="text-sm font-semibold underline underline-offset-4"
          >
            Discuss this project
          </a>
        )}
      </footer>
    </DetailShell>
  );
}
