import { useEffect, useRef, useState, type RefObject } from 'react';
import { Group, Vector3, type Camera } from 'three';
import type { PlayerAnimation } from '../PlayerCharacter';
import { isPerspectiveCamera } from './helpers';
import { createInitialPlayerSnapshot } from './state';
import { createEmptyInputState } from './types';
import { usePlayerControllerAudio } from './usePlayerControllerAudio';
import { usePlayerControllerInput } from './usePlayerControllerInput';

export function usePlayerControllerRuntimeState(camera: Camera, masterVolume: number) {
  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const inputRef = useRef(createEmptyInputState());
  const groundedTimer = useRef(0);
  const jumpBuffer = useRef(Number.POSITIVE_INFINITY);
  const rollTimer = useRef(0);
  const stepTimer = useRef(0);
  const stepIndex = useRef(0);
  const characterRootRef = useRef<Group | null>(null);
  const visualLiftRef = useRef(0);
  const audio = usePlayerControllerAudio(masterVolume);
  const wasGroundedRef = useRef(true);
  const airborneTimeRef = useRef(0);
  const maxFallSpeedRef = useRef(0);
  const jumpSoundLockedUntilLandRef = useRef(false);
  const jumpButtonHeldRef = useRef(false);
  const rollButtonHeldRef = useRef(false);
  const attackButtonHeldRef = useRef(false);
  const dashRef = useRef({ active: false, timeLeft: 0, speed: 0, direction: new Vector3(0, 0, 1) });
  const dashCooldownRef = useRef(0);
  const rollCooldownRef = useRef(0);
  const rollDirectionRef = useRef(new Vector3(0, 0, 1));
  const attackTimerRef = useRef(0);
  const attackCooldownRef = useRef(0);
  const attackDirectionRef = useRef(new Vector3(0, 0, 1));
  const dashButtonPrevRef = useRef(false);
  const baseFovRef = useRef(isPerspectiveCamera(camera) ? camera.fov : 50);
  const playerStatePublishTimerRef = useRef(0);
  const lastPublishedPlayerStateRef = useRef(createInitialPlayerSnapshot());

  useEffect(() => {
    if (!isPerspectiveCamera(camera)) return;
    baseFovRef.current = camera.fov;
    return () => {
      camera.fov = baseFovRef.current;
      camera.updateProjectionMatrix();
    };
  }, [camera]);

  usePlayerControllerInput({
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
    runningLoopAudioRef: audio.runningLoopAudioRef as RefObject<HTMLAudioElement | null>,
  });

  return {
    animation,
    setAnimation,
    inputRef,
    groundedTimer,
    jumpBuffer,
    rollTimer,
    stepTimer,
    stepIndex,
    characterRootRef,
    visualLiftRef,
    wasGroundedRef,
    airborneTimeRef,
    maxFallSpeedRef,
    jumpSoundLockedUntilLandRef,
    jumpButtonHeldRef,
    rollButtonHeldRef,
    attackButtonHeldRef,
    dashRef,
    dashCooldownRef,
    rollCooldownRef,
    rollDirectionRef,
    attackTimerRef,
    attackCooldownRef,
    attackDirectionRef,
    dashButtonPrevRef,
    baseFovRef,
    playerStatePublishTimerRef,
    lastPublishedPlayerStateRef,
    ...audio,
  };
}
