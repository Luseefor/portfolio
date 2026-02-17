'use client';

import { BriefcaseBusiness } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '@/components/identity/portfolio-template';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

export default function ExperiencePanel({ theme }: ChestPanelTemplateProps) {
  return (
    <div className="space-y-4">
      {PORTFOLIO_CONTENT.experience.items.map((item, index) => (
        <article key={`${item.company}-${item.period}`} className="relative rounded-2xl border border-white/10 bg-black/35 p-4">
          <div
            className="absolute left-4 top-4 h-[calc(100%-2rem)] w-[2px]"
            style={{
              background:
                index === PORTFOLIO_CONTENT.experience.items.length - 1
                  ? `linear-gradient(to bottom, ${theme.accentBorderStrong}, transparent)`
                  : theme.accentBorder,
            }}
          />
          <div className="ml-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] font-terminal" style={{ color: theme.accentMuted }}>
              <BriefcaseBusiness size={11} />
              {item.period}
            </span>
            <h4 className="mt-3 text-lg font-bold text-stone-100">{item.company}</h4>
            <p className="text-sm" style={{ color: theme.accentText }}>
              {item.role}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
