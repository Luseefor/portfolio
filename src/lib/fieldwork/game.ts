import { worldBlocked } from './world';
import { heightAt } from '@/lib/workbench/model';

export type Point = { x: number; z: number };
export const SPAWN: Point = { x: 3, z: 9 };
export const TABLE = { x: -8, z: -4 };
export const APPROACH: Point = { x: -8, z: 2.6 };
export const TARGET_FREQUENCY = 1.65;
export const START_FREQUENCY = 0.85;
export const MATCH_TOLERANCE = 0.04;
export const SAVE_KEY = 'fieldwork-research-v1';
export type FieldNote = { version: 1; frequency: number; calibrated: boolean };

// Axis-aligned footprints include the rover's 0.65-unit clearance.
export const OBSTACLES = [
  { minX: -14.15, maxX: -1.85, minZ: -8.65, maxZ: 0.65 },
  { minX: 3.1, maxX: 4.9, minZ: -11.9, maxZ: -10.1 },
  { minX: 12.1, maxX: 13.9, minZ: -11.9, maxZ: -10.1 },
  { minX: 3.1, maxX: 4.9, minZ: -5.9, maxZ: -4.1 },
  { minX: 12.1, maxX: 13.9, minZ: -5.9, maxZ: -4.1 },
];
export function canStand(point: Point) {
  return (
    Number.isFinite(point.x) &&
    Number.isFinite(point.z) &&
    !worldBlocked(point) &&
    !OBSTACLES.some(
      (box) => point.x > box.minX && point.x < box.maxX && point.z > box.minZ && point.z < box.maxZ,
    )
  );
}
export function moveRover(position: Point, direction: Point, seconds: number): Point {
  const length = Math.hypot(direction.x, direction.z);
  if (!length || !Number.isFinite(length) || !Number.isFinite(seconds) || seconds <= 0)
    return position;
  // Short substeps prevent crossing the instrument at a low frame rate.
  const distance = Math.min(seconds, 0.1) * 6;
  const count = Math.max(1, Math.ceil(distance / 0.15));
  let next = { ...position };
  for (let n = 0; n < count; n++) {
    const x = { x: next.x + ((direction.x / length) * distance) / count, z: next.z };
    if (canStand(x)) next = x;
    const z = { x: next.x, z: next.z + ((direction.z / length) * distance) / count };
    if (canStand(z)) next = z;
  }
  return next;
}
export const nearTable = (point: Point) =>
  Math.hypot(point.x - APPROACH.x, point.z - APPROACH.z) <= 3.7;
export function matchError(frequency: number): number {
  let squared = 0;
  const samples = 49;
  // The challenge compares the z=0 profile at t=0 and A=1.
  for (let i = 0; i < samples; i++) {
    const x = -3 + i / 8;
    const difference =
      heightAt('wave', x, 0, 1, frequency) - heightAt('wave', x, 0, 1, TARGET_FREQUENCY);
    squared += difference * difference;
  }
  return Math.sqrt(squared / samples);
}
export function isCalibrated(frequency: number) {
  return (
    Number.isFinite(frequency) &&
    frequency >= 0.5 &&
    frequency <= 2.5 &&
    matchError(frequency) <= MATCH_TOLERANCE
  );
}
export function readNote(raw: string | null): FieldNote | null {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const note = value as Record<string, unknown>;
    if (
      note.version !== 1 ||
      typeof note.frequency !== 'number' ||
      !Number.isFinite(note.frequency) ||
      note.frequency < 0.5 ||
      note.frequency > 2.5 ||
      typeof note.calibrated !== 'boolean'
    )
      return null;
    if (note.calibrated && !isCalibrated(note.frequency)) return null;
    return { version: 1, frequency: note.frequency, calibrated: note.calibrated };
  } catch {
    return null;
  }
}
