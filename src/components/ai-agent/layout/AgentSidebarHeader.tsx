'use client';

import { Activity, Bot, X } from 'lucide-react';

type AgentSidebarHeaderProps = {
  isDark: boolean;
  themeColor: string;
  accent60: string;
  onClose: () => void;
};

export function AgentSidebarHeader({ isDark, themeColor, accent60, onClose }: AgentSidebarHeaderProps) {
  return (
    <div className="absolute top-0 z-10 flex w-full items-center justify-between p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ai-accent-30)] bg-[var(--ai-accent-10)]">
          <Bot size={16} style={{ color: themeColor }} />
        </div>
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-terminal ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Luseefor.SYS
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: accent60 }}>
            Dashboard
          </span>
        </div>
      </div>
      <div className="hidden items-center gap-3 text-[8px] font-terminal uppercase tracking-[0.35em] md:flex">
        <Activity size={12} className="animate-pulse" />
        <span style={{ color: accent60 }}>Active</span>
      </div>
      <button
        onClick={onClose}
        className="group rounded-full border border-[var(--ai-accent-20)] bg-[var(--ai-accent-10)] p-2 transition-colors hover:border-[var(--ai-accent-40)] hover:bg-[var(--ai-accent-20)]"
      >
        <X size={16} className="transition-transform group-hover:rotate-90" style={{ color: accent60 }} />
      </button>
    </div>
  );
}
