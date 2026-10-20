import { describe, expect, it } from 'vitest';
import {
  APPROACH,
  canStand,
  isCalibrated,
  matchError,
  moveRover,
  nearTable,
  readNote,
  SPAWN,
  TARGET_FREQUENCY,
} from './game';

describe('wave-table research challenge', () => {
  it('compares 49 profile samples against an independently computed RMS', () => {
    expect(matchError(TARGET_FREQUENCY)).toBe(0);
    const expected = Math.sqrt(
      Array.from({ length: 49 }, (_, i) => Math.sin((-3 + i / 8) * TARGET_FREQUENCY) ** 2).reduce(
        (a, b) => a + b,
        0,
      ) / 49,
    );
    expect(matchError(0)).toBeCloseTo(expected, 12);
    expect(isCalibrated(1.65)).toBe(true);
    expect(isCalibrated(1.6)).toBe(false);
    expect(isCalibrated(1.7)).toBe(false);
    expect(isCalibrated(NaN)).toBe(false);
  });
  it('normalizes diagonal movement and remains bounded during repeated input', () => {
    const straight = moveRover(SPAWN, { x: 1, z: 0 }, 1 / 60);
    const diagonal = moveRover(SPAWN, { x: 1, z: 1 }, 1 / 60);
    expect(Math.hypot(straight.x - SPAWN.x, straight.z - SPAWN.z)).toBeCloseTo(
      Math.hypot(diagonal.x - SPAWN.x, diagonal.z - SPAWN.z),
    );
    let p = { ...SPAWN };
    for (let i = 0; i < 10000; i++) p = moveRover(p, { x: 1, z: 1 }, 1 / 60);
    expect(canStand(p)).toBe(true);
    expect(p.x).toBeLessThanOrEqual(17.5);
    expect(p.z).toBeLessThanOrEqual(13.5);
  });
  it('blocks the instrument footprint and allows sliding along its front', () => {
    const p = moveRover({ x: -8, z: 0.7 }, { x: 1, z: -1 }, 0.1);
    expect(p.x).toBeGreaterThan(-8);
    expect(p.z).toBeGreaterThanOrEqual(0.65);
    expect(canStand({ x: -8, z: -4 })).toBe(false);
    expect(moveRover(SPAWN, { x: NaN, z: 0 }, 1)).toEqual(SPAWN);
    expect(nearTable(APPROACH)).toBe(true);
    expect(nearTable(SPAWN)).toBe(false);
  });
  it('accepts versioned notes and rejects corrupt or unearned completion', () => {
    expect(readNote(JSON.stringify({ version: 1, frequency: 1.65, calibrated: true }))).toEqual({
      version: 1,
      frequency: 1.65,
      calibrated: true,
    });
    for (const raw of [
      'broken',
      '{}',
      JSON.stringify({ version: 1, frequency: 0.85, calibrated: true }),
      JSON.stringify({ version: 2, frequency: 1.65, calibrated: true }),
      JSON.stringify({ version: 1, frequency: 99, calibrated: false }),
    ])
      expect(readNote(raw)).toBeNull();
  });
});
