'use client';

import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type MovementStatusPanelProps = {
  grounded: boolean;
  isMoving: boolean;
  theme: DungeonUiThemePalette;
};

export function MovementStatusPanel({ grounded, isMoving, theme }: MovementStatusPanelProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-30">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
            grounded ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ''
          }`}
          style={
            grounded
              ? undefined
              : {
                  borderColor: theme.accentBorderStrong,
                  backgroundColor: theme.accentBgSoft,
                  color: theme.accentText,
                }
          }
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${grounded ? 'bg-emerald-400' : 'animate-pulse'}`}
            style={grounded ? undefined : { backgroundColor: theme.accent }}
          />
          {grounded ? 'Grounded' : 'Airborne'}
        </div>

        {isMoving && (
          <div className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
            Moving
          </div>
        )}
      </div>
    </div>
  );
}
