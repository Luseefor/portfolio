import type { PlayerAnimation } from '../PlayerCharacter';
import {
  PLAYER_STATE_DIR_DOT_EPSILON,
  PLAYER_STATE_POS_EPSILON,
  PLAYER_STATE_SPEED_EPSILON,
} from './constants';

export type PlayerSnapshot = {
  position: { x: number; y: number; z: number };
  forward: { x: number; y: number; z: number };
  look: { x: number; y: number; z: number };
  speed: number;
  grounded: boolean;
  isMoving: boolean;
};

export function createInitialPlayerSnapshot(): PlayerSnapshot {
  return {
    position: { x: Number.NaN, y: Number.NaN, z: Number.NaN },
    forward: { x: 0, y: 0, z: 1 },
    look: { x: 0, y: 0, z: 1 },
    speed: Number.NaN,
    grounded: false,
    isMoving: false,
  };
}

export function shouldPublishPlayerSnapshot(next: PlayerSnapshot, last: PlayerSnapshot): boolean {
  const dx = next.position.x - last.position.x;
  const dy = next.position.y - last.position.y;
  const dz = next.position.z - last.position.z;
  const positionChanged = dx * dx + dy * dy + dz * dz >= PLAYER_STATE_POS_EPSILON * PLAYER_STATE_POS_EPSILON;
  const speedChanged = Math.abs(next.speed - last.speed) >= PLAYER_STATE_SPEED_EPSILON;
  const forwardAligned =
    next.forward.x * last.forward.x + next.forward.y * last.forward.y + next.forward.z * last.forward.z;
  const lookAligned = next.look.x * last.look.x + next.look.y * last.look.y + next.look.z * last.look.z;
  const directionChanged =
    !Number.isFinite(forwardAligned) ||
    !Number.isFinite(lookAligned) ||
    forwardAligned < PLAYER_STATE_DIR_DOT_EPSILON ||
    lookAligned < PLAYER_STATE_DIR_DOT_EPSILON;
  const flagsChanged = next.grounded !== last.grounded || next.isMoving !== last.isMoving;
  return positionChanged || speedChanged || directionChanged || flagsChanged;
}

export function resolvePlayerAnimation(
  grounded: boolean,
  speed: number,
  isDashing: boolean,
  attackTimer: number,
  rollTimer: number,
  runPressed: boolean,
): PlayerAnimation {
  if (isDashing) return 'dash';
  if (attackTimer > 0) return 'attack';
  if (rollTimer > 0) return 'roll';
  if (!grounded) return 'jump';
  if (speed > 0.15) return runPressed ? 'run' : 'walk';
  return 'idle';
}
