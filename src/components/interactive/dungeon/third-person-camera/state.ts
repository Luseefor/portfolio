import { useRef } from 'react';
import { Vector3 } from 'three';
import { CAMERA_DISTANCE, CAMERA_PITCH } from '@/constants/camera';
import type { PointerDragState } from './types';

export function useThirdPersonCameraState() {
  const initializedRef = useRef(false);
  const desiredYawRef = useRef(0);
  const desiredPitchRef = useRef(CAMERA_PITCH.initial);
  const currentYawRef = useRef(0);
  const currentPitchRef = useRef(CAMERA_PITCH.initial);
  const targetDistanceRef = useRef<number>(CAMERA_DISTANCE.default);
  const zoomDistanceRef = useRef<number>(CAMERA_DISTANCE.default);
  const collisionDistanceRef = useRef<number>(CAMERA_DISTANCE.default);
  const playerPositionRef = useRef(new Vector3());
  const pivotTargetRef = useRef(new Vector3());
  const pivotRef = useRef(new Vector3());
  const lookAtTargetRef = useRef(new Vector3());
  const lookAtRef = useRef(new Vector3());
  const desiredPositionRef = useRef(new Vector3());
  const resolvedPositionRef = useRef(new Vector3());
  const orbitOffsetRef = useRef(new Vector3());
  const shoulderOffsetRef = useRef(new Vector3());
  const rayDirectionRef = useRef(new Vector3());
  const rightRef = useRef(new Vector3());
  const sampleOriginRef = useRef(new Vector3());
  const pointerDragStateRef = useRef<PointerDragState>({
    active: false,
    x: 0,
    y: 0,
    hasPoint: false,
  });

  return {
    initializedRef,
    desiredYawRef,
    desiredPitchRef,
    currentYawRef,
    currentPitchRef,
    targetDistanceRef,
    zoomDistanceRef,
    collisionDistanceRef,
    playerPositionRef,
    pivotTargetRef,
    pivotRef,
    lookAtTargetRef,
    lookAtRef,
    desiredPositionRef,
    resolvedPositionRef,
    orbitOffsetRef,
    shoulderOffsetRef,
    rayDirectionRef,
    rightRef,
    sampleOriginRef,
    pointerDragStateRef,
  } as const;
}

export type ThirdPersonCameraState = ReturnType<typeof useThirdPersonCameraState>;
