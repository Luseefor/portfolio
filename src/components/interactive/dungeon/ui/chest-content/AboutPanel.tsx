'use client';

import { Sparkles, ShieldCheck, Gauge, Layers } from 'lucide-react';
import { portfolioData } from '@/content/portfolio';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

const ABOUT_ICONS = [Sparkles, ShieldCheck, Gauge, Layers];

export default function AboutPanel({ theme }: ChestPanelTemplateProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-[11px] uppercase tracking-[0.25em] font-terminal" style={{ color: theme.accentMuted }}>
          {portfolioData.hero.roleLabel}
        </p>
        <h3 className="mt-2 text-2xl font-black leading-tight" style={{ color: theme.accentText }}>
          {portfolioData.hero.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">{portfolioData.hero.summary}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {portfolioData.about.stats.map((stat, index) => {
          const Icon = ABOUT_ICONS[index % ABOUT_ICONS.length];
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
              style={{ boxShadow: `0 0 18px ${theme.accentGlow}` }}
            >
              <div className="mb-2 inline-flex rounded-lg border border-white/10 p-2" style={{ color: theme.accent }}>
                <Icon size={14} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-terminal text-stone-400">{stat.label}</p>
              <p className="mt-1 text-lg font-bold text-stone-100">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-transparent p-4">
        <p className="text-sm text-stone-300 leading-relaxed">{portfolioData.about.description}</p>
      </div>
    </div>
  );
}
