'use client';

import { motion } from 'framer-motion';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from './constants';
import { MinimapChestsLayer } from './MinimapChestsLayer';
import { MinimapGrid } from './MinimapGrid';
import { MinimapPlayerLayer } from './MinimapPlayerLayer';
import { MinimapRoomsRoutesLayer } from './MinimapRoomsRoutesLayer';

type MinimapPanelProps = {
  chestsOpened: number;
  totalChests: number;
  openedChestIds: ReadonlySet<string>;
  playerPoint: { x: number; y: number };
  look: { x: number; z: number };
  theme: DungeonUiThemePalette;
};

export function MinimapPanel({
  chestsOpened,
  totalChests,
  openedChestIds,
  playerPoint,
  look,
  theme,
}: MinimapPanelProps) {
  return (
    <div className="pointer-events-none fixed left-3 top-3 z-30 sm:left-6 sm:top-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[236px] rounded-xl border bg-gradient-to-br from-stone-900/95 to-stone-800/90 p-2.5 shadow-[0_0_24px_rgba(0,0,0,0.35)] backdrop-blur-md sm:w-[264px] sm:p-3"
        style={{ borderColor: theme.accentBorder }}
      >
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.24em]">
          <span style={{ color: theme.accentText }}>Minimap</span>
          <span className="font-mono tracking-[0.12em] text-stone-400">
            {chestsOpened}/{totalChests}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
          className="h-[138px] w-[194px] rounded-lg border border-stone-700/80 bg-stone-950/90 sm:h-[156px] sm:w-[220px]"
          role="img"
          aria-label="Dungeon minimap"
        >
          <MinimapGrid />
          <MinimapRoomsRoutesLayer theme={theme} />
          <MinimapChestsLayer openedChestIds={openedChestIds} theme={theme} />
          <MinimapPlayerLayer playerPoint={playerPoint} look={look} />
        </svg>
        <div className="mt-2 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.14em] text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white" />
            <span>You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent }} />
            <span>Unopened</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-stone-500" />
            <span>Opened</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
