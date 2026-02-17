'use client';

import Link from 'next/link';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type SettingsFooterProps = {
  theme: DungeonUiThemePalette;
};

export function SettingsFooter({ theme }: SettingsFooterProps) {
  return (
    <div className="border-t px-6 py-4" style={{ borderColor: theme.accentBorder }}>
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:opacity-95"
          style={{
            borderColor: theme.accentBorderStrong,
            backgroundColor: theme.accentBgSoft,
            boxShadow: `0 0 14px ${theme.accentGlow}`,
          }}
        >
          Back To Home
        </Link>
        <p className="text-right text-[10px] uppercase tracking-wider text-stone-600">
          Press <kbd className="rounded border border-stone-700 bg-stone-800 px-1.5 py-0.5 text-stone-400">ESC</kbd>{' '}
          to close
        </p>
      </div>
    </div>
  );
}
