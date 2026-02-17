import { DUNGEON_SCALE } from '@/constants/dungeonLayout';
import type { ChestPOI } from '@/constants/dungeonLayout';
import type { RenderedChest } from './constants';

type Vec3Like = {
  x: number;
  z: number;
};

function distanceXZ(a: Vec3Like, b: [number, number, number]) {
  const dx = a.x - b[0];
  const dz = a.z - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}

export function isWithinChestInteractionRange(
  playerPosition: Vec3Like,
  chest: ChestPOI,
  position: [number, number, number],
) {
  const distance = distanceXZ(playerPosition, position);
  return distance <= chest.interactionRadius * DUNGEON_SCALE;
}

export function findNearbyChestId(playerPosition: Vec3Like, renderedChests: RenderedChest[]) {
  let nearest: { id: string; distance: number } | null = null;
  for (let i = 0; i < renderedChests.length; i += 1) {
    const entry = renderedChests[i];
    const distance = distanceXZ(playerPosition, entry.position);
    const interactionRadius = entry.chest.interactionRadius * DUNGEON_SCALE;
    if (distance >= interactionRadius) continue;
    if (!nearest || distance < nearest.distance) {
      nearest = { id: entry.chest.id, distance };
    }
  }
  return nearest ? nearest.id : null;
}
