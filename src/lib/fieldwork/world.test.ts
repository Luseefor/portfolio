import { describe, expect, it } from 'vitest';
import { canStand } from './game';
import {
  descentStep,
  LANDMARKS,
  nearestLandmark,
  pendulumPeriod,
  signalHeight,
  surveyCell,
  worldBlocked,
} from './world';

describe('open research world', () => {
  it('keeps approaches clear while instrument bodies block driving', () => {
    for (const l of LANDMARKS) {
      expect(canStand(l.approach), l.name).toBe(true);
      expect(canStand({ x: l.x, z: l.z }), l.name).toBe(false);
    }
  });
  it('shows the wave prompt only inside its actual interaction reach', () => {
    const wave = LANDMARKS[0];
    expect(nearestLandmark({ x: wave.approach.x + 3.6, z: wave.approach.z })?.id).toBe('wave');
    expect(nearestLandmark({ x: wave.approach.x + 4, z: wave.approach.z })).toBeUndefined();
  });
  it('reconstructs distant scenery deterministically without closing survey lanes', () => {
    const first = surveyCell(100, -75);
    expect(first).toEqual(surveyCell(100, -75));
    expect(first.length).toBeLessThanOrEqual(9);
    for (const p of first) {
      expect(Number.isFinite(p.x + p.z + p.scale)).toBe(true);
      if (p.kind === 'tree') expect(worldBlocked(p)).toBe(true);
    }
    for (let x = -200; x <= 200; x += 4) expect(canStand({ x, z: 9 })).toBe(true);
  });
  it('obeys pendulum scaling, decreases a convex objective and preserves odd signal symmetry', () => {
    expect(pendulumPeriod(4) / pendulumPeriod(1)).toBeCloseTo(2, 12);
    let p = { x: 3, z: 2 };
    let previous = p.x * p.x + p.z * p.z;
    for (let i = 0; i < 20; i++) {
      p = descentStep(p);
      const next = p.x * p.x + p.z * p.z;
      expect(next).toBeLessThan(previous);
      previous = next;
    }
    expect(previous).toBeLessThan(0.0001);
    for (let n = 1; n <= 5; n++) {
      expect(signalHeight(0, n)).toBe(0);
      expect(signalHeight(-0.7, n)).toBeCloseTo(-signalHeight(0.7, n), 12);
    }
  });
});
