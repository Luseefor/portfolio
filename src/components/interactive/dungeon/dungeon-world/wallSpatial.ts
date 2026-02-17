import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import type { WallCollisionBox, WallPanel } from './types';
import { pointInsideAnyFloor } from './floorQueries';

export function panelNormal(panel: WallPanel) {
  return { x: Math.sin(panel.rotationY), z: Math.cos(panel.rotationY) };
}

export function getInteriorSideForPanel(panel: WallPanel, floorPieces: DungeonBuildPiece[]) {
  const normal = panelNormal(panel);
  const sampleDistance = 0.9;
  const positiveHasFloor = pointInsideAnyFloor(panel.position[0] + normal.x * sampleDistance, panel.position[2] + normal.z * sampleDistance, floorPieces);
  const negativeHasFloor = pointInsideAnyFloor(panel.position[0] - normal.x * sampleDistance, panel.position[2] - normal.z * sampleDistance, floorPieces);
  return negativeHasFloor && !positiveHasFloor ? -1 : 1;
}

export function findNearestWallPanel(x: number, z: number, wallPanels: WallPanel[]) {
  if (wallPanels.length === 0) return null;
  let nearest = wallPanels[0];
  let nearestDistanceSq = Number.POSITIVE_INFINITY;
  for (let i = 0; i < wallPanels.length; i += 1) {
    const panel = wallPanels[i];
    const dx = panel.position[0] - x;
    const dz = panel.position[2] - z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < nearestDistanceSq) {
      nearestDistanceSq = distanceSq;
      nearest = panel;
    }
  }
  return nearest;
}

export function buildWallCollisionBoxes(wallPanels: WallPanel[]): WallCollisionBox[] {
  return wallPanels.map((panel) =>
    panel.axis === 'x'
      ? { centerX: panel.position[0], centerZ: panel.position[2], halfX: panel.size[0] * 0.5, halfZ: panel.size[2] * 0.5 }
      : { centerX: panel.position[0], centerZ: panel.position[2], halfX: panel.size[2] * 0.5, halfZ: panel.size[0] * 0.5 },
  );
}

function circleIntersectsWallBox(x: number, z: number, radius: number, box: WallCollisionBox) {
  const minX = box.centerX - box.halfX;
  const maxX = box.centerX + box.halfX;
  const minZ = box.centerZ - box.halfZ;
  const maxZ = box.centerZ + box.halfZ;
  const closestX = Math.max(minX, Math.min(maxX, x));
  const closestZ = Math.max(minZ, Math.min(maxZ, z));
  const dx = x - closestX;
  const dz = z - closestZ;
  return dx * dx + dz * dz < radius * radius;
}

export function wallOverlapCount(x: number, z: number, radius: number, wallBoxes: WallCollisionBox[]) {
  let count = 0;
  for (let i = 0; i < wallBoxes.length; i += 1) {
    if (circleIntersectsWallBox(x, z, radius, wallBoxes[i])) count += 1;
  }
  return count;
}

export function closestPointOnWallPanel(panel: WallPanel, x: number, z: number) {
  const halfLength = panel.size[0] * 0.5;
  const halfThickness = panel.size[2] * 0.5;
  if (panel.axis === 'x') {
    return {
      x: Math.max(panel.position[0] - halfLength, Math.min(panel.position[0] + halfLength, x)),
      z: Math.max(panel.position[2] - halfThickness, Math.min(panel.position[2] + halfThickness, z)),
    };
  }
  return {
    x: Math.max(panel.position[0] - halfThickness, Math.min(panel.position[0] + halfThickness, x)),
    z: Math.max(panel.position[2] - halfLength, Math.min(panel.position[2] + halfLength, z)),
  };
}

export function moveTowardWallPanel(panel: WallPanel, x: number, z: number, advance: number, minClearance: number) {
  const closest = closestPointOnWallPanel(panel, x, z);
  const dx = closest.x - x;
  const dz = closest.z - z;
  const distance = Math.hypot(dx, dz);
  if (distance < 1e-5) return [x, z] as [number, number];
  const step = Math.max(0, Math.min(advance, Math.max(0, distance - minClearance)));
  return [x + (dx / distance) * step, z + (dz / distance) * step] as [number, number];
}

export function wallFacingRotationY(panel: WallPanel, x: number, z: number) {
  const wallPoint = closestPointOnWallPanel(panel, x, z);
  const dx = wallPoint.x - x;
  const dz = wallPoint.z - z;
  return dx * dx + dz * dz < 1e-6 ? panel.rotationY + Math.PI : Math.atan2(dx, dz);
}
