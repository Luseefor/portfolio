import { describe, expect, it } from 'vitest';
import { computeMoveVector } from '../math/movementMath';

describe('movement math', () => {
  it('moves forward along +Z when yaw is 0', () => {
    const vector = computeMoveVector({ forward: true }, 0);
    expect(vector.x).toBeCloseTo(0, 5);
    expect(vector.z).toBeCloseTo(1, 5);
  });

  it('moves forward along +X when yaw is PI/2', () => {
    const vector = computeMoveVector({ forward: true }, Math.PI / 2);
    expect(vector.x).toBeCloseTo(1, 5);
    expect(vector.z).toBeCloseTo(0, 5);
  });

  it('normalizes diagonal movement', () => {
    const vector = computeMoveVector({ forward: true, right: true }, 0);
    expect(vector.x).toBeCloseTo(Math.SQRT1_2, 5);
    expect(vector.z).toBeCloseTo(Math.SQRT1_2, 5);
  });

  it('cancels opposing keys', () => {
    const vector = computeMoveVector({ forward: true, backward: true }, 0);
    expect(vector.x).toBeCloseTo(0, 5);
    expect(vector.z).toBeCloseTo(0, 5);
  });

  it('returns zero vector when no keys pressed', () => {
    const vector = computeMoveVector({}, 0);
    expect(vector.x).toBe(0);
    expect(vector.y).toBe(0);
    expect(vector.z).toBe(0);
  });
});
