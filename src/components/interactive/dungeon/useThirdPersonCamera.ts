'use client';

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useDungeonInput } from '@/lib/dungeonInput';
import { useSettings } from '@/lib/settings';
import { applyTouchLookDelta } from './third-person-camera/lookInput';
import { useThirdPersonCameraState } from './third-person-camera/state';
import { updateThirdPersonCameraFrame } from './third-person-camera/runtime';
import type { ThirdPersonCameraOptions } from './third-person-camera/types';
import { usePointerLookControls } from './third-person-camera/usePointerLookControls';

export function useThirdPersonCamera({ targetBody, yawRef, pitchRef }: ThirdPersonCameraOptions) {
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const isTouchDevice = useDungeonInput((state) => state.isTouchDevice);
  const consumeLookDelta = useDungeonInput((state) => state.consumeLookDelta);
  const mouseSensitivity = useSettings((state) => state.mouseSensitivity);
  const state = useThirdPersonCameraState();

  const pointerLockElement = useMemo(() => gl.domElement, [gl.domElement]);

  usePointerLookControls({
    canvas: pointerLockElement,
    isPointerLocked,
    isTouchDevice,
    mouseSensitivity,
    desiredYawRef: state.desiredYawRef,
    desiredPitchRef: state.desiredPitchRef,
    targetDistanceRef: state.targetDistanceRef,
    pointerDragStateRef: state.pointerDragStateRef,
  });

  useFrame((_, delta) => {
    const body = targetBody?.current;
    if (!body) return;
    applyTouchLookDelta(consumeLookDelta, state, mouseSensitivity);
    updateThirdPersonCameraFrame({
      body,
      delta,
      camera,
      rapier,
      world,
      options: { targetBody, yawRef, pitchRef },
      state,
    });
  });
}
