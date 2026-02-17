import type { MutableRefObject } from 'react';
import { CAMERA_DISTANCE, CAMERA_SENSITIVITY } from '@/constants/camera';
import { clampCameraDistance, clampPitch } from '../math/cameraMath';
import { wrapAngle } from './math';

type LookDeltaRefs = {
  desiredYawRef: MutableRefObject<number>;
  desiredPitchRef: MutableRefObject<number>;
};

export function resolveSensitivityScale(mouseSensitivity: number) {
  return Math.max(0.1, Math.min(3, mouseSensitivity || 1));
}

export function applyLookDelta(
  refs: LookDeltaRefs,
  dx: number,
  dy: number,
  mouseSensitivity: number,
  inputScale = 1,
) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
  const sensitivityScale = resolveSensitivityScale(mouseSensitivity) * inputScale;
  refs.desiredYawRef.current = wrapAngle(
    refs.desiredYawRef.current - dx * CAMERA_SENSITIVITY.yaw * sensitivityScale,
  );
  refs.desiredPitchRef.current = clampPitch(
    refs.desiredPitchRef.current - dy * CAMERA_SENSITIVITY.pitch * sensitivityScale,
  );
}

export function applyScrollZoom(targetDistanceRef: MutableRefObject<number>, deltaY: number) {
  if (!Number.isFinite(deltaY)) return;
  const next = targetDistanceRef.current + Math.sign(deltaY) * CAMERA_DISTANCE.scrollStep;
  targetDistanceRef.current = clampCameraDistance(next);
}

export function applyTouchLookDelta(
  consumeLookDelta: () => { x: number; y: number },
  refs: LookDeltaRefs,
  mouseSensitivity: number,
) {
  const lookDelta = consumeLookDelta();
  if (lookDelta.x === 0 && lookDelta.y === 0) return;
  applyLookDelta(refs, lookDelta.x, lookDelta.y, mouseSensitivity, 1.08);
}
