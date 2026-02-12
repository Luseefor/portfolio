import { DUNGEON_LAYOUT_BOUNDS } from './dungeonLayout';

export const DUNGEON_BOUNDS = {
  minX: DUNGEON_LAYOUT_BOUNDS.minX,
  maxX: DUNGEON_LAYOUT_BOUNDS.maxX,
  minZ: DUNGEON_LAYOUT_BOUNDS.minZ,
  maxZ: DUNGEON_LAYOUT_BOUNDS.maxZ,
  cameraPadding: 1.6,
  playerPadding: 1.6,
} as const;
