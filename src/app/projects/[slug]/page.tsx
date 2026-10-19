import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
        <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">{project.summary}</p>
      </header>
      <dl className="grid gap-6 border-y border-[var(--border-default)] py-6 sm:grid-cols-2">
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
            <dd className="mt-2 leading-7">{value}</dd>
          </div>
        ))}
      </dl>
      {project.body.length > 0 ? (
        <section aria-label="Project approach" className="space-y-4 text-[var(--text-secondary)]">
          {project.body.map((paragraph) => (
            <p key={paragraph} className="leading-8">
              {paragraph}
            </p>
          ))}
        </section>
      ) : null}
      {[
        ['What I owned', project.ownership],
        ['Result', project.result],
      ].map(([label, value]) => (
        <section key={label}>
          <h2 className="font-display text-3xl font-semibold">{label}</h2>
          <p className="mt-3 leading-8 text-[var(--text-secondary)]">{value}</p>
        </section>
      ))}
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
