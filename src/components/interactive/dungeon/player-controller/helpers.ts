import { PerspectiveCamera, type Camera } from 'three';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import type { PlayerInputState } from './types';

export function clampPlayerX(value: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxX - DUNGEON_BOUNDS.playerPadding,
    Math.max(DUNGEON_BOUNDS.minX + DUNGEON_BOUNDS.playerPadding, value),
  );
}

export function clampPlayerZ(value: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxZ - DUNGEON_BOUNDS.playerPadding,
    Math.max(DUNGEON_BOUNDS.minZ + DUNGEON_BOUNDS.playerPadding, value),
  );
}

export function isPerspectiveCamera(camera: Camera): camera is PerspectiveCamera {
  return (camera as PerspectiveCamera).isPerspectiveCamera === true;
}

export function safeSetAudioTime(audio: HTMLAudioElement, time: number) {
  try {
    audio.currentTime = Number.isFinite(time) && time > 0 ? time : 0;
  } catch {
    // Ignore seek failures before metadata is ready.
  }
}

export function setAllInputs(target: PlayerInputState, pressed: boolean) {
  target.forward = pressed;
  target.backward = pressed;
  target.left = pressed;
  target.right = pressed;
  target.run = pressed;
  target.dash = pressed;
  target.jump = pressed;
  target.roll = pressed;
  target.attack = pressed;
}
