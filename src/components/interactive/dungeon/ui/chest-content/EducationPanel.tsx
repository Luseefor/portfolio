'use client';

import { GraduationCap, BookMarked } from 'lucide-react';
import { portfolioData } from '@/content/portfolio';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

export default function EducationPanel({ theme }: ChestPanelTemplateProps) {
  return (
    <div className="space-y-4">
      {portfolioData.education.map((entry, index) => (
        <div
          key={`${entry.institution}-${index}`}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-terminal" style={{ color: theme.accent }}>
              {index === 0 ? <GraduationCap size={12} /> : <BookMarked size={12} />}
              {entry.period}
            </span>
            <span className="rounded-full border border-white/15 px-2 py-1 text-[9px] uppercase tracking-[0.18em] font-terminal text-stone-400">
              Academic
            </span>
          </div>
          <h4 className="text-base font-bold text-stone-100">{entry.institution}</h4>
          <p className="text-sm" style={{ color: theme.accentText }}>
            {entry.degree}
          </p>
          <p className="mt-2 text-sm text-stone-300">{entry.notes}</p>
        </div>
      ))}
    </div>
  );
}
