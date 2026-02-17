import type { Vector3 } from 'three';
import { CAMERA_COLLISION } from '@/constants/camera';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import type { Vec3Like } from './types';

export function smoothingFactor(lambda: number, delta: number) {
  if (!Number.isFinite(delta) || delta <= 0) return 0;
  if (!Number.isFinite(lambda) || lambda <= 0) return 1;
  return 1 - Math.exp(-lambda * delta);
}

export function dampValue(current: number, target: number, lambda: number, delta: number) {
  const t = smoothingFactor(lambda, delta);
  return current + (target - current) * t;
}

export function wrapAngle(angle: number) {
  if (!Number.isFinite(angle)) return 0;
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function dampAngle(current: number, target: number, lambda: number, delta: number) {
  const safeCurrent = wrapAngle(current);
  const safeTarget = wrapAngle(target);
  const deltaAngle = Math.atan2(Math.sin(safeTarget - safeCurrent), Math.cos(safeTarget - safeCurrent));
  const t = smoothingFactor(lambda, delta);
  return wrapAngle(safeCurrent + deltaAngle * t);
}

export function clampBoundsXZ(position: Vector3, padding = CAMERA_COLLISION.boundsPadding) {
  position.x = Math.min(
    DUNGEON_BOUNDS.maxX - padding,
    Math.max(DUNGEON_BOUNDS.minX + padding, position.x),
  );
  position.z = Math.min(
    DUNGEON_BOUNDS.maxZ - padding,
    Math.max(DUNGEON_BOUNDS.minZ + padding, position.z),
  );
}

export function isFiniteVec3Like(value: Vec3Like) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}
