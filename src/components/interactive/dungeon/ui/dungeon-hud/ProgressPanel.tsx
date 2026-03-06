'use client';

import { motion } from 'framer-motion';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type ProgressPanelProps = {
  chestsOpened: number;
  totalChests: number;
  theme: DungeonUiThemePalette;
};

export function ProgressPanel({ chestsOpened, totalChests, theme }: ProgressPanelProps) {
  return (
    <div className="pointer-events-none fixed right-3 top-3 z-30 sm:right-5 sm:top-5">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="border bg-[#0f1620]/94 px-3.5 py-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.34)] backdrop-blur-md"
        style={{ borderColor: theme.accentBorder }}
      >
        <div className="flex items-center gap-2.5">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: theme.accent }}>
            <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
          </svg>
          <div className="flex items-baseline gap-2">
            <span
              className="font-terminal text-[9px] uppercase tracking-[0.18em]"
              style={{ color: theme.accentMuted }}
            >
              Items
            </span>
            <span className="font-mono text-sm font-bold tabular-nums" style={{ color: theme.accentText }}>
              {chestsOpened}/{totalChests}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
