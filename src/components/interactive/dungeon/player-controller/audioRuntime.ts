import type { MutableRefObject } from 'react';
import { clampVolume } from '@/lib/settings';
import {
  RUN_LOOP_BASE_VOLUME,
  RUN_LOOP_SPEED_THRESHOLD,
  RUN_LOOP_START_OFFSET,
  RUN_LOOP_WRAP_EPSILON,
  STEP_BASE_VOLUME,
  STEP_INTERVAL_WALK,
  WALK_SPEED,
} from './constants';
import { safeSetAudioTime } from './helpers';

type MovementAudioParams = {
  grounded: boolean;
  speed: number;
  runPressed: boolean;
  isRolling: boolean;
  isAttacking: boolean;
  isDashing: boolean;
  delta: number;
  masterVolume: number;
  stepTimerRef: MutableRefObject<number>;
  stepIndexRef: MutableRefObject<number>;
  stepAudioRef: MutableRefObject<HTMLAudioElement[]>;
  runningLoopAudioRef: MutableRefObject<HTMLAudioElement | null>;
};

export function updateMovementAudio({
  grounded,
  speed,
  runPressed,
  isRolling,
  isAttacking,
  isDashing,
  delta,
  masterVolume,
  stepTimerRef,
  stepIndexRef,
  stepAudioRef,
  runningLoopAudioRef,
}: MovementAudioParams) {
  const volumeScale = clampVolume(masterVolume);
  const useRunningLoop = grounded && speed >= RUN_LOOP_SPEED_THRESHOLD && runPressed && !isRolling && !isAttacking && !isDashing;
  const runningLoopAudio = runningLoopAudioRef.current;
  if (runningLoopAudio) {
    const hasDuration = Number.isFinite(runningLoopAudio.duration) && runningLoopAudio.duration > 0;
    const loopStart =
      hasDuration && runningLoopAudio.duration > RUN_LOOP_START_OFFSET + RUN_LOOP_WRAP_EPSILON
        ? RUN_LOOP_START_OFFSET
        : 0;
    if (useRunningLoop) {
      runningLoopAudio.volume = RUN_LOOP_BASE_VOLUME * volumeScale;
      runningLoopAudio.playbackRate = 0.98 + Math.min(0.16, Math.max(0, speed - WALK_SPEED) * 0.06);
      if (hasDuration && runningLoopAudio.currentTime >= runningLoopAudio.duration - RUN_LOOP_WRAP_EPSILON) {
        safeSetAudioTime(runningLoopAudio, loopStart);
      }
      if (runningLoopAudio.paused) {
        safeSetAudioTime(runningLoopAudio, loopStart);
        runningLoopAudio.play().catch(() => {});
      }
    } else if (!runningLoopAudio.paused) {
      runningLoopAudio.pause();
      safeSetAudioTime(runningLoopAudio, 0);
    }
  }

  stepTimerRef.current -= delta;
  if (grounded && speed > 0.2 && !isRolling && !isAttacking && !isDashing && !useRunningLoop) {
    if (stepTimerRef.current <= 0) {
      const walkIndex = stepIndexRef.current % stepAudioRef.current.length;
      const stepAudio = stepAudioRef.current[walkIndex];
      if (stepAudio) {
        stepAudio.currentTime = 0;
        stepAudio.volume = STEP_BASE_VOLUME * volumeScale;
        stepAudio.playbackRate = 0.92 + Math.random() * 0.08;
        stepAudio.play().catch(() => {});
      }
      stepIndexRef.current += 1;
      stepTimerRef.current = STEP_INTERVAL_WALK * (0.95 + Math.random() * 0.1);
    }
  } else {
    stepTimerRef.current = 0;
  }
}
