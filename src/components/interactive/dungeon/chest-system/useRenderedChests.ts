import { useMemo } from 'react';
import { CHEST_POIS, DUNGEON_LAYOUT_GRAPH, DUNGEON_SCALE } from '@/constants/dungeonLayout';
import { buildDungeon } from '@/game/dungeon/buildDungeon';
import { FLOOR_KINDS, type RenderedChest } from './constants';
import { buildObstacleBoxes, resolveChestPlacement } from './placement';

export function useRenderedChests() {
  const dungeon = useMemo(() => buildDungeon(DUNGEON_LAYOUT_GRAPH), []);

  const floorPieces = useMemo(
    () => dungeon.pieces.filter((piece) => FLOOR_KINDS.has(piece.kind)),
    [dungeon.pieces],
  );

  const floorIds = useMemo(() => new Set(floorPieces.map((piece) => piece.id)), [floorPieces]);

  const obstacleBoxes = useMemo(
    () => buildObstacleBoxes(dungeon.colliders, floorIds),
    [dungeon.colliders, floorIds],
  );

  return useMemo<RenderedChest[]>(
    () =>
      CHEST_POIS.map((chest) => {
        const baseX = chest.position[0] * DUNGEON_SCALE;
        const baseY = chest.position[1] * DUNGEON_SCALE;
        const baseZ = chest.position[2] * DUNGEON_SCALE;
        const resolved = resolveChestPlacement(baseX, baseZ, floorPieces, obstacleBoxes);
        return {
          chest,
          position: [resolved.x, Math.max(baseY, resolved.y), resolved.z],
        };
      }),
    [floorPieces, obstacleBoxes],
  );
}
