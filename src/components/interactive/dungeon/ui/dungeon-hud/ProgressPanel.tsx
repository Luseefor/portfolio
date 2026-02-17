'use client';

import { motion } from 'framer-motion';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type ProgressPanelProps = {
  chestsOpened: number;
  totalChests: number;
  speed: number;
  theme: DungeonUiThemePalette;
};

export function ProgressPanel({ chestsOpened, totalChests, speed, theme }: ProgressPanelProps) {
  return (
    <div className="pointer-events-none fixed right-6 top-6 z-30">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border bg-gradient-to-r from-stone-900/90 to-stone-800/90 px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
        style={{ borderColor: theme.accentBorder }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: theme.accent }}>
              <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
            </svg>
            <span className="font-mono text-sm font-bold tabular-nums" style={{ color: theme.accentText }}>
              {chestsOpened}/{totalChests}
            </span>
          </div>
          <div className="h-6 w-px" style={{ backgroundColor: theme.accentBorder }} />
          <div className="text-right">
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-stone-500">Speed</div>
            <div className="font-mono text-sm font-bold tabular-nums text-stone-300">
              {speed.toFixed(1)}
              <span className="ml-1 text-[9px] text-stone-500">m/s</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
