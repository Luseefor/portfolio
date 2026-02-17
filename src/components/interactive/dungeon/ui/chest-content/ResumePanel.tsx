'use client';

import { FileText, Download } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '@/components/identity/portfolio-template';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

export default function ResumePanel({ theme }: ChestPanelTemplateProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
        <div className="mb-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-terminal" style={{ color: theme.accentMuted }}>
          <FileText size={12} />
          Resume Packet
        </div>
        <p className="text-sm leading-relaxed text-stone-300">{PORTFOLIO_CONTENT.resume.summary}</p>
      </div>

      <div className="space-y-2">
        {PORTFOLIO_CONTENT.resume.bullets.map((bullet) => (
          <div key={bullet} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-stone-200">
            {bullet}
          </div>
        ))}
      </div>

      <a
        href={PORTFOLIO_CONTENT.resume.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-terminal text-stone-100"
        style={{ borderColor: theme.accentBorderStrong, backgroundColor: theme.accentBgSoft }}
      >
        <Download size={12} />
        Open Resume
      </a>
    </div>
  );
}
