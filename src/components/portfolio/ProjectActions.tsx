import Link from 'next/link';
import { getProjectAction, type PortfolioProject } from '@/content/portfolio';

export default function ProjectActions({
  project,
  showDetails = true,
}: {
  project: PortfolioProject;
  showDetails?: boolean;
}) {
  const action = getProjectAction(project);
  const detailHref = `/projects/${project.slug}`;

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
      <Link
        href={action.href}
        prefetch={action.href === '/interactive' ? false : undefined}
        target={action.href.startsWith('https://') ? '_blank' : undefined}
        rel={action.href.startsWith('https://') ? 'noreferrer' : undefined}
        className="underline underline-offset-4"
      >
        {action.label}
      </Link>
      {showDetails && action.href !== detailHref ? (
        <Link href={detailHref} className="underline underline-offset-4">
          Read project details
        </Link>
      ) : null}
      {project.demoHref && project.codeHref && !project.hideRepository ? (
        <a
          href={project.codeHref}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Open repository
        </a>
      ) : null}
    </div>
  );
}
