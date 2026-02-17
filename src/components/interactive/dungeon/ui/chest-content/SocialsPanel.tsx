'use client';

import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '@/components/identity/portfolio-template';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

const SOCIAL_ICON_BY_KIND = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
} as const;

export default function SocialsPanel({ theme }: ChestPanelTemplateProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PORTFOLIO_CONTENT.socials.links.map((link) => {
        const Icon = SOCIAL_ICON_BY_KIND[link.kind];
        return (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-white/10 bg-black/35 p-4 transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: `0 0 18px ${theme.accentGlow}` }}
          >
            <div className="mb-2 inline-flex rounded-lg border border-white/10 p-2" style={{ color: theme.accent }}>
              <Icon size={14} />
            </div>
            <p className="text-sm font-semibold text-stone-100">{link.label}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-terminal" style={{ color: theme.accentMuted }}>
              Open
              <ArrowUpRight size={10} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
