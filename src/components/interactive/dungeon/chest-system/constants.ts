import type { ChestPOI } from '@/constants/dungeonLayout';
import { DUNGEON_SCALE } from '@/constants/dungeonLayout';

export const CLOSED_CHEST_GLB = '/models/dungeon/props/closed_chest.glb';
export const OPEN_CHEST_GLB = '/models/dungeon/props/open_chest.glb';

export const FLOOR_KINDS = new Set(['floor', 'corridor-floor', 'spawn-platform']);

const CHEST_SIZE_MULTIPLIER = 1.5;
const CHEST_BASE_SCALE = 0.9;

export const CHEST_WORLD_SIZE = {
  width: 1.2 * CHEST_BASE_SCALE * CHEST_SIZE_MULTIPLIER * DUNGEON_SCALE,
  height: 0.82 * CHEST_BASE_SCALE * CHEST_SIZE_MULTIPLIER * DUNGEON_SCALE,
  depth: 0.95 * CHEST_BASE_SCALE * CHEST_SIZE_MULTIPLIER * DUNGEON_SCALE,
} as const;

export const CHEST_COLLIDER_HEIGHT_SCALE = 0.85;
export const CHEST_SURFACE_OFFSET = 0.02;
export const CHEST_PLACEMENT_SEARCH_STEP = 0.9 * DUNGEON_SCALE;
export const CHEST_PLACEMENT_SEARCH_RINGS = 2;
export const CHEST_FOOTPRINT_RADIUS = Math.max(CHEST_WORLD_SIZE.width, CHEST_WORLD_SIZE.depth) * 0.46;

export const MARKER_BASE_HEIGHT = CHEST_WORLD_SIZE.height * 1.55;
export const MARKER_BOB_AMPLITUDE = 0.14 * DUNGEON_SCALE;

export type ObstacleBox = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type RenderedChest = {
  chest: ChestPOI;
  position: [number, number, number];
};

export const FOOTPRINT_PROBES: Array<[number, number]> = [
  [0, 0],
  [CHEST_FOOTPRINT_RADIUS * 0.56, 0],
  [-CHEST_FOOTPRINT_RADIUS * 0.56, 0],
  [0, CHEST_FOOTPRINT_RADIUS * 0.56],
  [0, -CHEST_FOOTPRINT_RADIUS * 0.56],
  [CHEST_FOOTPRINT_RADIUS * 0.42, CHEST_FOOTPRINT_RADIUS * 0.42],
  [CHEST_FOOTPRINT_RADIUS * 0.42, -CHEST_FOOTPRINT_RADIUS * 0.42],
  [-CHEST_FOOTPRINT_RADIUS * 0.42, CHEST_FOOTPRINT_RADIUS * 0.42],
  [-CHEST_FOOTPRINT_RADIUS * 0.42, -CHEST_FOOTPRINT_RADIUS * 0.42],
];
