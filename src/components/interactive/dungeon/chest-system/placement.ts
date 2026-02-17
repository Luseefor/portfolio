import type { DungeonBuildCollider, DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import {
  CHEST_FOOTPRINT_RADIUS,
  CHEST_PLACEMENT_SEARCH_RINGS,
  CHEST_PLACEMENT_SEARCH_STEP,
  CHEST_SURFACE_OFFSET,
  FOOTPRINT_PROBES,
  type ObstacleBox,
} from './constants';

function pointInsideFloorPiece(x: number, z: number, piece: DungeonBuildPiece) {
  const halfX = piece.size[0] * 0.5;
  const halfZ = piece.size[2] * 0.5;
  return (
    x >= piece.position[0] - halfX &&
    x <= piece.position[0] + halfX &&
    z >= piece.position[2] - halfZ &&
    z <= piece.position[2] + halfZ
  );
}

function floorSurfaceYAt(x: number, z: number, floorPieces: DungeonBuildPiece[]) {
  let hasFloor = false;
  let topY = 0;
  for (let i = 0; i < floorPieces.length; i += 1) {
    const piece = floorPieces[i];
    if (!pointInsideFloorPiece(x, z, piece)) continue;
    hasFloor = true;
    topY = Math.max(topY, piece.position[1] + piece.size[1] * 0.5);
  }
  return hasFloor ? topY : null;
}

function obstacleOverlapCount(x: number, z: number, radius: number, boxes: ObstacleBox[]) {
  let count = 0;
  for (let i = 0; i < boxes.length; i += 1) {
    const box = boxes[i];
    const closestX = Math.max(box.minX, Math.min(box.maxX, x));
    const closestZ = Math.max(box.minZ, Math.min(box.maxZ, z));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < radius * radius) count += 1;
  }
  return count;
}

function buildPlacementCandidates(baseX: number, baseZ: number) {
  const candidates: Array<[number, number, number]> = [];
  for (let ring = 0; ring <= CHEST_PLACEMENT_SEARCH_RINGS; ring += 1) {
    if (ring === 0) {
      candidates.push([baseX, baseZ, 0]);
      continue;
    }
    for (let ix = -ring; ix <= ring; ix += 1) {
      for (let iz = -ring; iz <= ring; iz += 1) {
        if (Math.max(Math.abs(ix), Math.abs(iz)) !== ring) continue;
        const x = baseX + ix * CHEST_PLACEMENT_SEARCH_STEP;
        const z = baseZ + iz * CHEST_PLACEMENT_SEARCH_STEP;
        candidates.push([x, z, Math.hypot(ix, iz) * CHEST_PLACEMENT_SEARCH_STEP]);
      }
    }
  }
  return candidates;
}

export function resolveChestPlacement(
  baseX: number,
  baseZ: number,
  floorPieces: DungeonBuildPiece[],
  obstacleBoxes: ObstacleBox[],
) {
  let best: { x: number; z: number; y: number; score: number } | null = null;
  const candidates = buildPlacementCandidates(baseX, baseZ);
  for (let i = 0; i < candidates.length; i += 1) {
    const [x, z, distancePenalty] = candidates[i];
    let supportCount = 0;
    let topY = -Infinity;
    for (let s = 0; s < FOOTPRINT_PROBES.length; s += 1) {
      const [ox, oz] = FOOTPRINT_PROBES[s];
      const floorY = floorSurfaceYAt(x + ox, z + oz, floorPieces);
      if (floorY === null) continue;
      supportCount += 1;
      topY = Math.max(topY, floorY);
    }
    if (supportCount === 0 || !Number.isFinite(topY)) continue;

    const unsupported = FOOTPRINT_PROBES.length - supportCount;
    const overlapPenalty = obstacleOverlapCount(x, z, CHEST_FOOTPRINT_RADIUS * 0.72, obstacleBoxes);
    const score = overlapPenalty * 120 + unsupported * 10 + distancePenalty;
    if (!best || score < best.score) {
      best = { x, z, y: topY + CHEST_SURFACE_OFFSET, score };
      if (score <= 0.001) break;
    }
  }

  if (best) return best;
  const fallbackY = floorSurfaceYAt(baseX, baseZ, floorPieces);
  return {
    x: baseX,
    z: baseZ,
    y: (fallbackY ?? 0) + CHEST_SURFACE_OFFSET,
    score: Number.POSITIVE_INFINITY,
  };
}

export function buildObstacleBoxes(colliders: DungeonBuildCollider[], floorIds: Set<string>) {
  return colliders
    .filter((collider) => !floorIds.has(collider.id))
    .map((collider) => ({
      minX: collider.position[0] - collider.size[0] * 0.5,
      maxX: collider.position[0] + collider.size[0] * 0.5,
      minZ: collider.position[2] - collider.size[2] * 0.5,
      maxZ: collider.position[2] + collider.size[2] * 0.5,
    }));
}
