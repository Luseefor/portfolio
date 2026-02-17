import { DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';

export const MINIMAP_WIDTH = 220;
export const MINIMAP_HEIGHT = 156;
export const MINIMAP_PADDING = 10;
export const MINIMAP_GRID_STEP = 18;

const DUNGEON_SPAN_X = Math.max(1, DUNGEON_BOUNDS.maxX - DUNGEON_BOUNDS.minX);
const DUNGEON_SPAN_Z = Math.max(1, DUNGEON_BOUNDS.maxZ - DUNGEON_BOUNDS.minZ);
const MINIMAP_INNER_WIDTH = MINIMAP_WIDTH - MINIMAP_PADDING * 2;
const MINIMAP_INNER_HEIGHT = MINIMAP_HEIGHT - MINIMAP_PADDING * 2;

export const ROOM_BY_ID = new Map(DUNGEON_LAYOUT_GRAPH.rooms.map((room) => [room.id, room]));
export const ROUTE_WIDTH_SCALE = ((MINIMAP_INNER_WIDTH / DUNGEON_SPAN_X) + (MINIMAP_INNER_HEIGHT / DUNGEON_SPAN_Z)) * 0.5;

export function worldToMinimap(x: number, z: number) {
  const nx = (x - DUNGEON_BOUNDS.minX) / DUNGEON_SPAN_X;
  const nz = (z - DUNGEON_BOUNDS.minZ) / DUNGEON_SPAN_Z;
  return {
    x: MINIMAP_PADDING + nx * (MINIMAP_WIDTH - MINIMAP_PADDING * 2),
    y: MINIMAP_PADDING + nz * (MINIMAP_HEIGHT - MINIMAP_PADDING * 2),
  };
}
