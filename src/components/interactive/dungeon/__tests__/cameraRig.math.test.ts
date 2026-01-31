import { describe, expect, it } from 'vitest';
import {
  applyMouseDelta,
  clampPitch,
  computeCameraDesired,
  computeSmoothingFactor,
  getCameraParentWarnings,
} from '../math/cameraMath';
import { CAMERA_PITCH } from '@/constants/camera';

describe('camera math helpers', () => {
  it('clamps pitch to expected bounds', () => {
    expect(clampPitch(CAMERA_PITCH.min - 10)).toBe(CAMERA_PITCH.min);
    expect(clampPitch(CAMERA_PITCH.max + 10)).toBe(CAMERA_PITCH.max);
  });

  it('applies mouse delta with clamp', () => {
    const { yaw, pitch } = applyMouseDelta(0, 0, 1000, -1000, { yaw: 0.01, pitch: 0.01 });
    expect(Number.isFinite(yaw)).toBe(true);
    expect(pitch).toBe(CAMERA_PITCH.max);
  });

  it('computes finite desired camera positions', () => {
    const desired = computeCameraDesired({ x: 1, y: 2, z: 3 }, Math.PI, 0.4, 5.5);
    expect(Number.isFinite(desired.x)).toBe(true);
    expect(Number.isFinite(desired.y)).toBe(true);
    expect(Number.isFinite(desired.z)).toBe(true);
  });

  it('keeps smoothing lerp factor within [0,1]', () => {
    const factor = computeSmoothingFactor(0.016);
    expect(factor).toBeGreaterThanOrEqual(0);
    expect(factor).toBeLessThanOrEqual(1);
    expect(computeSmoothingFactor(-1)).toBe(0);
    expect(computeSmoothingFactor(Number.NaN)).toBe(0);
  });

  it('detects camera parent warnings', () => {
    const scene = {};
    const parent = { scale: { x: 2, y: 1, z: 1 } };
    const warnings = getCameraParentWarnings(parent, scene);
    expect(warnings.invalidParent).toBe(true);
    expect(warnings.nonUnitScale).toBe(true);
  });
});
