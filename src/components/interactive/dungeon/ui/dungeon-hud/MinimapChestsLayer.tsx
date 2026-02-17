'use client';

import { CHEST_POIS } from '@/constants/dungeonLayout';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';
import { worldToMinimap } from './constants';

type MinimapChestsLayerProps = {
  openedChestIds: ReadonlySet<string>;
  theme: DungeonUiThemePalette;
};

export function MinimapChestsLayer({ openedChestIds, theme }: MinimapChestsLayerProps) {
  return (
    <>
      {CHEST_POIS.map((chest) => {
        const point = worldToMinimap(chest.position[0], chest.position[2]);
        const isOpened = openedChestIds.has(chest.id);
        return (
          <g key={chest.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={isOpened ? 2.1 : 2.9}
              fill={isOpened ? 'rgba(107,114,128,0.95)' : theme.accent}
            />
            {!isOpened && (
              <circle
                cx={point.x}
                cy={point.y}
                r={4.3}
                fill="none"
                stroke={theme.accentBorderStrong}
                strokeWidth={0.9}
              />
            )}
          </g>
        );
      })}
    </>
  );
}
