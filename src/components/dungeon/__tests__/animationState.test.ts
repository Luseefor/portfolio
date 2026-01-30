import { describe, expect, it } from 'vitest';
import { getNextAnimationState } from '@/components/dungeon/math/animationMath';

describe('animation state transitions', () => {
  it('switches to walk when input is active', () => {
    const next = getNextAnimationState('idle', {
      inputActive: true,
      isRunning: false,
      grounded: true,
      speedOnGround: 0.2,
    });
    expect(next).toBe('walk');
  });

  it('switches to run when running input is active', () => {
    const next = getNextAnimationState('walk', {
      inputActive: true,
      isRunning: true,
      grounded: true,
      speedOnGround: 0.6,
    });
    expect(next).toBe('run');
  });

  it('returns to idle when grounded and nearly stopped', () => {
    const next = getNextAnimationState('walk', {
      inputActive: false,
      isRunning: false,
      grounded: true,
      speedOnGround: 0.05,
    });
    expect(next).toBe('idle');
  });

  it('retains current state when airborne without input', () => {
    const next = getNextAnimationState('run', {
      inputActive: false,
      isRunning: false,
      grounded: false,
      speedOnGround: 0.2,
    });
    expect(next).toBe('run');
  });
});
