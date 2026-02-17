'use client';

import { ArrowUpRight } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '@/components/identity/portfolio-template';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

export default function ProjectsPanel({ theme }: ChestPanelTemplateProps) {
  const projects = PORTFOLIO_CONTENT.projects.categories.flatMap((category) =>
    category.items.map((item) => ({ ...item, category: category.name })),
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {projects.slice(0, 6).map((project) => (
        <article
          key={project.title}
          className="group rounded-2xl border border-white/10 bg-black/35 p-4 transition-transform hover:-translate-y-0.5"
          style={{ boxShadow: `0 0 22px ${theme.accentGlow}` }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-terminal" style={{ color: theme.accentMuted }}>
              {project.category}
            </span>
            <ArrowUpRight size={14} className="text-stone-500 transition-colors group-hover:text-stone-200" />
          </div>
          <h4 className="text-lg font-bold text-stone-100">{project.title}</h4>
          <p className="mt-2 text-sm text-stone-300">{project.desc}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((tech) => (
              <span
                key={`${project.title}-${tech}`}
                className="rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.16em] font-terminal text-stone-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
