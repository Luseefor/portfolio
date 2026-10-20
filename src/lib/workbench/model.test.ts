import { describe, expect, it } from 'vitest';
import {
  frequencySweep,
  freePlacement,
  makeSurface,
  heightAt,
  INITIAL_SURFACES,
  sampleSurface,
  validPlan,
  validSurface,
} from './model';

describe('deterministic mathematical workbench', () => {
  it('evaluates the published equations at independently known coordinates', () => {
    expect(heightAt('wave', Math.PI / 2, 0, 2, 1)).toBeCloseTo(2, 12);
    expect(heightAt('wave', 0, 0, 2, 1, Math.PI / 2)).toBeCloseTo(2, 12);
    expect(heightAt('saddle', 3, 0, 2, 1)).toBe(3);
    expect(heightAt('saddle', 0, 3, 2, 1)).toBe(-3);
    expect(heightAt('gaussian', 0, 0, 1.5, 2)).toBe(3);
    expect(heightAt('gaussian', 3, 0, 1, 1)).toBeCloseTo(2 * Math.exp(-3), 12);
  });
  it('samples both sides of a symmetric wave and preserves a Gaussian peak', () => {
    const wave = sampleSurface({ kind: 'wave', amplitude: 1, frequency: 1 });
    expect(wave.minimum).toBeCloseTo(-wave.maximum, 12);
    expect(wave.mean).toBeCloseTo(0, 12);
    expect(sampleSurface({ kind: 'gaussian', amplitude: 2, frequency: 1 }).maximum).toBe(4);
  });
  it('runs a reproducible six-value sweep without changing the source', () => {
    const surface = { ...INITIAL_SURFACES[1] };
    const before = { ...surface };
    const results = frequencySweep(surface);
    expect(results.map((r) => r.frequency)).toEqual([0.5, 1, 1.5, 2, 2.5, 3]);
    expect(results[0].mean).toBeGreaterThan(results[5].mean);
    expect(surface).toEqual(before);
    expect(frequencySweep(surface)).toEqual(results);
  });
  it('fills nine separated placements and reuses a removed slot', () => {
    const objects = [...INITIAL_SURFACES];
    while (objects.length < 9) {
      const slot = freePlacement(objects);
      expect(slot).toBeGreaterThanOrEqual(0);
      objects.push(makeSurface('saddle', slot, `object-${objects.length}`));
    }
    expect(freePlacement(objects)).toBe(-1);
    objects.splice(2, 1);
    const slot = freePlacement(objects);
    expect(slot).toBe(2);
    expect(
      objects.every(
        (object) =>
          Math.hypot(
            object.x - makeSurface('wave', slot, 'new').x,
            object.z - makeSurface('wave', slot, 'new').z,
          ) > 8,
      ),
    ).toBe(true);
  });
  it('accepts only supported, bounded plans and finite world objects', () => {
    const plan = {
      operation: 'create',
      kind: 'wave',
      amplitude: 1,
      frequency: 1,
      automate: true,
      summary: 'Create a wave and sweep frequency.',
    };
    expect(validPlan(plan)).toBe(true);
    for (const bad of [
      { ...plan, amplitude: NaN },
      { ...plan, frequency: 99 },
      { ...plan, kind: 'shell' },
      { ...plan, operation: 'execute' },
      { ...plan, summary: '' },
      null,
    ])
      expect(validPlan(bad)).toBe(false);
    expect(INITIAL_SURFACES.every(validSurface)).toBe(true);
    expect(validSurface({ ...INITIAL_SURFACES[0], x: Infinity })).toBe(false);
  });
});
