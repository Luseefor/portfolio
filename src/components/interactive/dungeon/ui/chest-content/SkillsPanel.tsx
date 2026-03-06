'use client';

import { Cpu } from 'lucide-react';
import { portfolioData } from '@/content/portfolio';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

export default function SkillsPanel({ theme }: ChestPanelTemplateProps) {
  const technologies = portfolioData.skills.flatMap((group) => group.items);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2">
        <Cpu size={14} style={{ color: theme.accent }} />
        <p className="text-[10px] uppercase tracking-[0.24em] font-terminal" style={{ color: theme.accentMuted }}>
          Core Capability Matrix
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {technologies.map((tech, index) => (
          <div
            key={tech}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
            style={{ boxShadow: index % 2 === 0 ? `0 0 18px ${theme.accentGlow}` : undefined }}
          >
            <p className="text-sm font-semibold text-stone-100">{tech}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
