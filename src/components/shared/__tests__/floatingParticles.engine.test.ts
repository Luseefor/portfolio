import { describe, expect, it } from 'vitest';
import { initializeParticles, updateParticles } from '../floating-particles/engine';

const FACTORY_OPTIONS = {
  movementSpeed: 0.45,
  particleSize: 1.8,
  particleOpacity: 0.45,
};

const UPDATE_OPTIONS = {
  mouseInfluence: 220,
  mouseGravity: 'attract' as const,
  gravityStrength: 60,
};

describe('floating particles engine stress', () => {
  it('handles a 3x particle load update loop without invalid numeric state', () => {
    const width = 1400;
    const height = 900;
    const particles = initializeParticles(width, height, 300, FACTORY_OPTIONS);
    const mouse = { x: width * 0.45, y: height * 0.5, active: true };

    for (let frame = 0; frame < 300; frame += 1) {
      updateParticles(particles, width, height, mouse, UPDATE_OPTIONS, FACTORY_OPTIONS);
    }

    particles.forEach((particle) => {
      expect(Number.isFinite(particle.x)).toBe(true);
      expect(Number.isFinite(particle.y)).toBe(true);
      expect(Number.isFinite(particle.vx)).toBe(true);
      expect(Number.isFinite(particle.vy)).toBe(true);
      expect(Number.isFinite(particle.opacity)).toBe(true);
      expect(particle.x).toBeGreaterThanOrEqual(0);
      expect(particle.x).toBeLessThanOrEqual(width);
      expect(particle.y).toBeGreaterThanOrEqual(0);
      expect(particle.y).toBeLessThanOrEqual(height);
    });
  });
});
