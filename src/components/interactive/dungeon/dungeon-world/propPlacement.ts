import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { WALL_FACE_SAMPLE_OFFSET, WALL_FRONT_OFFSET_Y } from './constants';
import type { WallCollisionBox, WallPanel } from './types';
import { pointInsideAnyFloor } from './floorQueries';
import { getInteriorSideForPanel, panelNormal, wallOverlapCount } from './wallSpatial';

export function orientWallPanelTowardInterior(panel: WallPanel, floorPieces: DungeonBuildPiece[]): WallPanel {
  const alongX = panel.axis === 'x';
  const probe = Math.max(WALL_FACE_SAMPLE_OFFSET, Math.min(panel.size[0], panel.size[2]) + 0.2);
  let rotationY = panel.rotationY;

  if (alongX) {
    const hasPositiveZFloor = pointInsideAnyFloor(panel.position[0], panel.position[2] + probe, floorPieces);
    const hasNegativeZFloor = pointInsideAnyFloor(panel.position[0], panel.position[2] - probe, floorPieces);
    if (hasPositiveZFloor && !hasNegativeZFloor) rotationY = 0;
    else if (hasNegativeZFloor && !hasPositiveZFloor) rotationY = Math.PI;
  } else {
    const hasPositiveXFloor = pointInsideAnyFloor(panel.position[0] + probe, panel.position[2], floorPieces);
    const hasNegativeXFloor = pointInsideAnyFloor(panel.position[0] - probe, panel.position[2], floorPieces);
    if (hasPositiveXFloor && !hasNegativeXFloor) rotationY = Math.PI * 0.5;
    else if (hasNegativeXFloor && !hasPositiveXFloor) rotationY = -Math.PI * 0.5;
  }

  return { ...panel, rotationY: rotationY + WALL_FRONT_OFFSET_Y };
}

function computePanelPropXZ(
  panel: WallPanel,
  side: number,
  propRadius: number,
  seed: number,
  floorPieces: DungeonBuildPiece[],
  wallBoxes: WallCollisionBox[],
) {
  const normal = panelNormal(panel);
  const tangent = panel.axis === 'x' ? { x: 1, z: 0 } : { x: 0, z: 1 };
  const baseDistance = panel.size[2] * 0.5 + propRadius + 0.16;
  const jitterSpan = Math.max(0, panel.size[0] * 0.5 - propRadius - 0.22);
  const jitter = jitterSpan > 0 ? ((((seed % 1000) / 999) - 0.5) * 2 * Math.min(0.9, jitterSpan)) : 0;

  let x = panel.position[0] + tangent.x * jitter + normal.x * side * baseDistance;
  let z = panel.position[2] + tangent.z * jitter + normal.z * side * baseDistance;
  let bestX = x;
  let bestZ = z;
  let bestScore = wallOverlapCount(x, z, propRadius, wallBoxes) + (pointInsideAnyFloor(x, z, floorPieces) ? 0 : 1000);

  for (let i = 0; i < 10; i += 1) {
    const nextX = x + normal.x * side * 0.12;
    const nextZ = z + normal.z * side * 0.12;
    if (!pointInsideAnyFloor(nextX, nextZ, floorPieces)) break;
    x = nextX;
    z = nextZ;
    const score = wallOverlapCount(x, z, propRadius, wallBoxes) + (pointInsideAnyFloor(x, z, floorPieces) ? 0 : 1000);
    if (score < bestScore) {
      bestScore = score;
      bestX = x;
      bestZ = z;
      if (bestScore <= 0) break;
    }
  }
  return { x: bestX, z: bestZ, score: bestScore };
}

export function resolvePropXZForPanel(
  panel: WallPanel,
  propSize: [number, number, number],
  seed: number,
  floorPieces: DungeonBuildPiece[],
  wallBoxes: WallCollisionBox[],
) {
  const preferredSide = getInteriorSideForPanel(panel, floorPieces);
  const radius = Math.max(propSize[0], propSize[2]) * 0.52;
  const preferred = computePanelPropXZ(panel, preferredSide, radius, seed, floorPieces, wallBoxes);
  if (preferred.score <= 0) return [preferred.x, preferred.z] as [number, number];
  const opposite = computePanelPropXZ(panel, -preferredSide, radius, seed + 173, floorPieces, wallBoxes);
  return opposite.score < preferred.score ? ([opposite.x, opposite.z] as [number, number]) : ([preferred.x, preferred.z] as [number, number]);
}
