import { useEffect, type MutableRefObject, type RefObject } from 'react';
import { safeSetAudioTime } from './helpers';
import type { DashRuntimeState } from './types';
import { createEmptyInputState, type PlayerInputState } from './types';

type UsePlayerControllerInputParams = {
  inputRef: MutableRefObject<PlayerInputState>;
  dashButtonPrevRef: MutableRefObject<boolean>;
  dashRef: MutableRefObject<DashRuntimeState>;
  jumpButtonHeldRef: MutableRefObject<boolean>;
  rollButtonHeldRef: MutableRefObject<boolean>;
  attackButtonHeldRef: MutableRefObject<boolean>;
  rollCooldownRef: MutableRefObject<number>;
  attackTimerRef: MutableRefObject<number>;
  attackCooldownRef: MutableRefObject<number>;
  jumpBuffer: MutableRefObject<number>;
  groundedTimer: MutableRefObject<number>;
  runningLoopAudioRef: RefObject<HTMLAudioElement | null>;
};

export function usePlayerControllerInput({
  inputRef,
  dashButtonPrevRef,
  dashRef,
  jumpButtonHeldRef,
  rollButtonHeldRef,
  attackButtonHeldRef,
  rollCooldownRef,
  attackTimerRef,
  attackCooldownRef,
  jumpBuffer,
  groundedTimer,
  runningLoopAudioRef,
}: UsePlayerControllerInputParams) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputRef.current.forward = pressed;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputRef.current.backward = pressed;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          inputRef.current.left = pressed;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputRef.current.right = pressed;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.run = pressed;
          break;
        case 'KeyQ':
          inputRef.current.dash = pressed;
          break;
        case 'Space':
          inputRef.current.jump = pressed;
          break;
        case 'KeyC':
          inputRef.current.roll = pressed;
          break;
        case 'KeyR':
          inputRef.current.attack = pressed;
          break;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => handleKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => handleKey(event, false);
    const onBlur = () => {
      inputRef.current = createEmptyInputState();
      dashButtonPrevRef.current = false;
      dashRef.current.active = false;
      dashRef.current.timeLeft = 0;
      jumpButtonHeldRef.current = false;
      rollButtonHeldRef.current = false;
      attackButtonHeldRef.current = false;
      rollCooldownRef.current = 0;
      attackTimerRef.current = 0;
      attackCooldownRef.current = 0;
      jumpBuffer.current = Number.POSITIVE_INFINITY;
      groundedTimer.current = 1;
      const runningLoopAudio = runningLoopAudioRef.current;
      if (runningLoopAudio) {
        runningLoopAudio.pause();
        safeSetAudioTime(runningLoopAudio, 0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [
    attackButtonHeldRef,
    attackCooldownRef,
    attackTimerRef,
    dashButtonPrevRef,
    dashRef,
    groundedTimer,
    inputRef,
    jumpBuffer,
    jumpButtonHeldRef,
    rollButtonHeldRef,
    rollCooldownRef,
    runningLoopAudioRef,
  ]);
}
