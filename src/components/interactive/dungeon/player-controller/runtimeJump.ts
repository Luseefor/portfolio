import type { MutableRefObject } from 'react';
import { MathUtils } from 'three';
import { COYOTE_TIME, GRAVITY, JUMP_BUFFER_TIME, JUMP_SPEED, RUN_SPEED } from './constants';
import type { DashRuntimeState } from './types';

type ResolveJumpVelocityParams = {
  delta: number;
  jumpJustPressed: boolean;
  jumpBufferRef: MutableRefObject<number>;
  groundedTimerRef: MutableRefObject<number>;
  dashRef: MutableRefObject<DashRuntimeState>;
  rollTimerRef: MutableRefObject<number>;
  attackTimerRef: MutableRefObject<number>;
  grounded: boolean;
  linvelY: number;
  desiredX: number;
  desiredZ: number;
  jumpAudioRef: MutableRefObject<HTMLAudioElement[]>;
  jumpAudioIndexRef: MutableRefObject<number>;
  jumpSoundLockedUntilLandRef: MutableRefObject<boolean>;
};

export function resolveJumpVerticalVelocity({
  delta,
  jumpJustPressed,
  jumpBufferRef,
  groundedTimerRef,
  dashRef,
  rollTimerRef,
  attackTimerRef,
  grounded,
  linvelY,
  desiredX,
  desiredZ,
  jumpAudioRef,
  jumpAudioIndexRef,
  jumpSoundLockedUntilLandRef,
}: ResolveJumpVelocityParams) {
  if (jumpJustPressed) {
    jumpBufferRef.current = 0;
  } else if (Number.isFinite(jumpBufferRef.current)) {
    jumpBufferRef.current += delta;
  }

  const canJump =
    jumpBufferRef.current <= JUMP_BUFFER_TIME &&
    groundedTimerRef.current <= COYOTE_TIME &&
    !dashRef.current.active &&
    rollTimerRef.current <= 0 &&
    attackTimerRef.current <= 0;

  let nextY = linvelY - GRAVITY * delta;
  if (canJump) {
    const horizontalIntentSpeed = Math.hypot(desiredX, desiredZ);
    const jumpBoost = MathUtils.clamp(1 + (horizontalIntentSpeed / RUN_SPEED) * 0.08, 1, 1.1);
    nextY = JUMP_SPEED * jumpBoost;

    if (jumpAudioRef.current.length > 0 && jumpJustPressed && !jumpSoundLockedUntilLandRef.current) {
      const jumpAudio = jumpAudioRef.current[jumpAudioIndexRef.current % jumpAudioRef.current.length];
      jumpAudioIndexRef.current += 1;
      jumpAudio.currentTime = 0;
      jumpAudio.playbackRate = 0.98 + Math.random() * 0.05;
      jumpAudio.play().catch(() => {});
      jumpSoundLockedUntilLandRef.current = true;
    }

    jumpBufferRef.current = Number.POSITIVE_INFINITY;
    groundedTimerRef.current = COYOTE_TIME + 1;
  } else if (grounded) {
    nextY = 0;
  }

  return nextY;
}
