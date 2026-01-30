import type { PlayerAnimation } from '@/components/dungeon/PlayerCharacter';

type AnimationInputs = {
  inputActive: boolean;
  isRunning: boolean;
  grounded: boolean;
  speedOnGround: number;
};

export function getNextAnimationState(
  current: PlayerAnimation,
  { inputActive, isRunning, grounded, speedOnGround }: AnimationInputs
): PlayerAnimation {
  if (inputActive) return isRunning ? 'run' : 'walk';
  if (grounded && speedOnGround < 0.15) return 'idle';
  return current;
}
