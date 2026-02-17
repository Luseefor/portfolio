'use client';

import { ScrollText } from 'lucide-react';
import type { ChestPOI } from '@/constants/dungeonLayout';
import type { ChestContentDefinition } from '@/components/interactive/dungeon/ui/chest-content/registry';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type ChestPanelHeaderProps = {
  chest: ChestPOI;
  definition: ChestContentDefinition;
  discoveredCount: number;
  totalSteps: number;
  theme: DungeonUiThemePalette;
};

export function ChestPanelHeader({
  chest,
  definition,
  discoveredCount,
  totalSteps,
  theme,
}: ChestPanelHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
          style={{
            borderColor: theme.accentBorder,
            backgroundImage: `linear-gradient(135deg, ${theme.accentBgStrong}, ${theme.accentBgSoft})`,
            boxShadow: `0 0 24px ${theme.accentGlow}`,
          }}
        >
          <ScrollText size={20} style={{ color: theme.accent }} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] font-terminal" style={{ color: theme.accentMuted }}>
            {definition.subtitle}
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight" style={{ color: theme.accentText }}>
            {definition.title}
          </h2>
          <p className="mt-1 text-sm text-stone-400">{chest.description}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-right">
        <p className="text-[10px] uppercase tracking-[0.2em] font-terminal text-stone-400">
          Fragments Recovered
        </p>
        <p className="text-lg font-black" style={{ color: theme.accentText }}>
          {discoveredCount}/{totalSteps}
        </p>
      </div>
    </div>
  );
}
