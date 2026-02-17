'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type ChestPanelFooterProps = {
  discoveredCount: number;
  totalSteps: number;
  onResetHints: () => void;
  onClose: () => void;
  theme: DungeonUiThemePalette;
};

export function ChestPanelFooter({
  discoveredCount,
  totalSteps,
  onResetHints,
  onClose,
  theme,
}: ChestPanelFooterProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
      <button
        onClick={onResetHints}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-terminal text-stone-300 transition hover:border-white/30"
      >
        <RotateCcw size={12} />
        Reset Clues
      </button>

      <div className="flex items-center gap-3">
        {discoveredCount === totalSteps ? (
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-terminal"
            style={{ borderColor: theme.accentBorderStrong, color: theme.accentText }}
          >
            Go to Landing
          </Link>
        ) : null}
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-600/40 bg-stone-700/30 px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-terminal text-stone-300 transition hover:border-stone-500/50 hover:bg-stone-600/40"
        >
          Close
          <kbd className="rounded border border-stone-600/50 bg-stone-700/50 px-1.5 py-0.5 text-[10px]">ESC</kbd>
        </button>
      </div>
    </div>
  );
}
