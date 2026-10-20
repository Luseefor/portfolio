import { describe, expect, it } from 'vitest';
import { exactRotation, integrateRotation, nextRotationStep, positionError } from './integration';

const TAU = 2 * Math.PI;

function endpointError(steps: number, method: 'euler' | 'midpoint'): number {
  const path = integrateRotation(steps, method);
  return positionError(path[path.length - 1], TAU);
}

describe('exactRotation', () => {
  it('lands on the unit circle at quarter turns and a full circle', () => {
    expect(exactRotation(0)).toEqual({ x: 1, y: 0 });
    const quarter = exactRotation(Math.PI / 2);
    expect(quarter.x).toBeCloseTo(0, 12);
    expect(quarter.y).toBeCloseTo(1, 12);
    const half = exactRotation(Math.PI);
    expect(half.x).toBeCloseTo(-1, 12);
    expect(half.y).toBeCloseTo(0, 12);
    const full = exactRotation(TAU);
    expect(full.x).toBeCloseTo(1, 12);
    expect(full.y).toBeCloseTo(0, 12);
  });

  it('rejects non-finite times', () => {
    expect(() => exactRotation(NaN)).toThrow(RangeError);
    expect(() => exactRotation(Infinity)).toThrow(RangeError);
  });
});

describe('nextRotationStep', () => {
  it('matches the Euler update from (1, 0)', () => {
    const h = 0.25;
    expect(nextRotationStep({ x: 1, y: 0 }, h, 'euler')).toEqual({
      x: 1,
      y: h,
    });
  });

  it('matches the explicit midpoint update from (1, 0)', () => {
    const h = 0.25;
    const next = nextRotationStep({ x: 1, y: 0 }, h, 'midpoint');
    // Half point is (1, h/2), full step weighs the field there.
    expect(next.x).toBeCloseTo(1 - (h * h) / 2, 12);
    expect(next.y).toBeCloseTo(h, 12);
  });

  it('matches the field update away from the start', () => {
    const h = 0.1;
    const start = { x: 0.3, y: -0.4 };
    const euler = nextRotationStep(start, h, 'euler');
    expect(euler.x).toBeCloseTo(0.3 + h * 0.4, 12);
    expect(euler.y).toBeCloseTo(-0.4 + h * 0.3, 12);

    const halfX = 0.3 + (h / 2) * 0.4;
    const halfY = -0.4 + (h / 2) * 0.3;
    const midpoint = nextRotationStep(start, h, 'midpoint');
    expect(midpoint.x).toBeCloseTo(0.3 - h * halfY, 12);
    expect(midpoint.y).toBeCloseTo(-0.4 + h * halfX, 12);
  });

  it('does not mutate the input point', () => {
    const start = { x: 1, y: 0 };
    nextRotationStep(start, 0.2, 'midpoint');
    expect(start).toEqual({ x: 1, y: 0 });
  });

  it('rejects bad step sizes, points, and methods', () => {
    expect(() => nextRotationStep({ x: 1, y: 0 }, 0, 'euler')).toThrow(RangeError);
    expect(() => nextRotationStep({ x: 1, y: 0 }, -0.1, 'euler')).toThrow(RangeError);
    expect(() => nextRotationStep({ x: 1, y: 0 }, NaN, 'euler')).toThrow(RangeError);
    expect(() => nextRotationStep({ x: 1, y: 0 }, Infinity, 'euler')).toThrow(RangeError);
    expect(() => nextRotationStep({ x: NaN, y: 0 }, 0.1, 'euler')).toThrow(RangeError);
    expect(() => nextRotationStep({ x: 1, y: Infinity }, 0.1, 'euler')).toThrow(RangeError);
    expect(() => nextRotationStep({ x: 1, y: 0 }, 0.1, 'rk4' as never)).toThrow(RangeError);
  });
});

describe('integrateRotation', () => {
  it('returns the start plus one entry per step', () => {
    const path = integrateRotation(16, 'euler');
    expect(path).toHaveLength(17);
    expect(path[0]).toEqual({ x: 1, y: 0 });
    expect(path[1]).toEqual({ x: 1 - 0, y: (TAU / 16) * 1 });
  });

  it('keeps entries independent of the returned start object', () => {
    const path = integrateRotation(8, 'midpoint');
    expect(path).toHaveLength(9);
    path[0].x = 99;
    expect(path[1].x).not.toBe(99);
  });

  it('shrinks the full-circle error as steps grow', () => {
    const euler16 = endpointError(16, 'euler');
    const euler32 = endpointError(32, 'euler');
    const euler64 = endpointError(64, 'euler');
    expect(euler32).toBeLessThan(euler16);
    expect(euler64).toBeLessThan(euler32);

    const mid16 = endpointError(16, 'midpoint');
    const mid32 = endpointError(32, 'midpoint');
    const mid64 = endpointError(64, 'midpoint');
    expect(mid32).toBeLessThan(mid16);
    expect(mid64).toBeLessThan(mid32);
  });

  it('keeps the explicit midpoint clearly ahead of Euler, without closing the circle', () => {
    for (const steps of [16, 32, 64] as const) {
      const euler = endpointError(steps, 'euler');
      const midpoint = endpointError(steps, 'midpoint');
      expect(midpoint).toBeLessThan(euler / 10);
      expect(midpoint).toBeGreaterThan(0);
    }
    expect(endpointError(64, 'euler')).toBeLessThan(0.5);
    expect(endpointError(64, 'midpoint')).toBeLessThan(0.02);
  });

  it('rejects step counts outside 4 to 256 or off the integers', () => {
    for (const bad of [3, 257, 16.5, NaN, Infinity]) {
      expect(() => integrateRotation(bad, 'euler')).toThrow(RangeError);
    }
    expect(() => integrateRotation(16, 'rk4' as never)).toThrow(RangeError);
  });
});

describe('positionError', () => {
  it('is zero at the exact point and positive off it', () => {
    expect(positionError({ x: 1, y: 0 }, 0)).toBe(0);
    expect(positionError({ x: 1, y: 0 }, TAU)).toBeCloseTo(0, 12);
    expect(positionError({ x: 0, y: 1 }, 0)).toBeCloseTo(Math.SQRT2, 12);
  });

  it('rejects bad points and times', () => {
    expect(() => positionError({ x: NaN, y: 0 }, 0)).toThrow(RangeError);
    expect(() => positionError({ x: 1, y: 0 }, NaN)).toThrow(RangeError);
    expect(() => positionError({ x: 1, y: Infinity }, 0)).toThrow(RangeError);
  });
});
