import { useEffect, useRef, type MutableRefObject } from 'react';
import { clampVolume } from '@/lib/settings';
import {
  JUMP_BASE_VOLUME,
  LAND_BASE_VOLUME,
  RUN_LOOP_BASE_VOLUME,
  STEP_BASE_VOLUME,
} from './constants';
import { safeSetAudioTime } from './helpers';

type PlayerAudioRefs = {
  stepAudioRef: MutableRefObject<HTMLAudioElement[]>;
  runningLoopAudioRef: MutableRefObject<HTMLAudioElement | null>;
  jumpAudioRef: MutableRefObject<HTMLAudioElement[]>;
  landAudioRef: MutableRefObject<HTMLAudioElement[]>;
  jumpAudioIndexRef: MutableRefObject<number>;
  landAudioIndexRef: MutableRefObject<number>;
};

export function usePlayerControllerAudio(masterVolume: number): PlayerAudioRefs {
  const stepAudioRef = useRef<HTMLAudioElement[]>([]);
  const runningLoopAudioRef = useRef<HTMLAudioElement | null>(null);
  const jumpAudioRef = useRef<HTMLAudioElement[]>([]);
  const landAudioRef = useRef<HTMLAudioElement[]>([]);
  const jumpAudioIndexRef = useRef(0);
  const landAudioIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!stepAudioRef.current.length) {
      stepAudioRef.current = [new Audio('/sounds/footsteps/gravel_step.wav')];
      stepAudioRef.current.forEach((audio) => {
        audio.preload = 'auto';
        audio.volume = STEP_BASE_VOLUME;
      });
    }
    if (!runningLoopAudioRef.current) {
      runningLoopAudioRef.current = new Audio('/sounds/footsteps/running_step.wav');
      runningLoopAudioRef.current.preload = 'auto';
      runningLoopAudioRef.current.loop = false;
      runningLoopAudioRef.current.volume = RUN_LOOP_BASE_VOLUME;
    }
    if (!jumpAudioRef.current.length) {
      jumpAudioRef.current = [new Audio('/sounds/player/jump.wav'), new Audio('/sounds/player/jump.wav')];
      jumpAudioRef.current.forEach((audio) => {
        audio.preload = 'auto';
        audio.volume = JUMP_BASE_VOLUME;
      });
    }
    if (!landAudioRef.current.length) {
      landAudioRef.current = [new Audio('/sounds/player/land.wav'), new Audio('/sounds/player/land.wav')];
      landAudioRef.current.forEach((audio) => {
        audio.preload = 'auto';
        audio.volume = LAND_BASE_VOLUME;
      });
    }
    return () => {
      stepAudioRef.current.forEach((audio) => audio.pause());
      if (runningLoopAudioRef.current) {
        runningLoopAudioRef.current.pause();
        safeSetAudioTime(runningLoopAudioRef.current, 0);
      }
      jumpAudioRef.current.forEach((audio) => audio.pause());
      landAudioRef.current.forEach((audio) => audio.pause());
    };
  }, []);

  useEffect(() => {
    const volumeScale = clampVolume(masterVolume);
    stepAudioRef.current.forEach((audio) => {
      audio.volume = STEP_BASE_VOLUME * volumeScale;
    });
    if (runningLoopAudioRef.current) {
      runningLoopAudioRef.current.volume = RUN_LOOP_BASE_VOLUME * volumeScale;
    }
    jumpAudioRef.current.forEach((audio) => {
      audio.volume = JUMP_BASE_VOLUME * volumeScale;
    });
    landAudioRef.current.forEach((audio) => {
      audio.volume = LAND_BASE_VOLUME * volumeScale;
    });
  }, [masterVolume]);

  return {
    stepAudioRef,
    runningLoopAudioRef,
    jumpAudioRef,
    landAudioRef,
    jumpAudioIndexRef,
    landAudioIndexRef,
  };
}
