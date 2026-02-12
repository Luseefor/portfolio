import {
  CAMERA_DISTANCE,
  CAMERA_FOLLOW,
  CAMERA_OFFSET,
  CAMERA_PITCH,
  CAMERA_SENSITIVITY,
} from '@/constants/camera';

type Vec3 = { x: number; y: number; z: number };

type Sensitivity = {
  yaw: number;
  pitch: number;
};

type PitchClamp = {
  min: number;
  max: number;
};

type CameraOffset = {
  height: number;
  side: number;
  back?: number;
};

export function clampPitch(pitch: number, min = CAMERA_PITCH.min, max = CAMERA_PITCH.max) {
  return Math.min(max, Math.max(min, pitch));
}

export function applyMouseDelta(
  yaw: number,
  pitch: number,
  dx: number,
  dy: number,
  sensitivity: Sensitivity = CAMERA_SENSITIVITY,
  clamp: PitchClamp = CAMERA_PITCH,
) {
  const safeYaw = Number.isFinite(yaw) ? yaw : 0;
  const safePitch = Number.isFinite(pitch) ? pitch : CAMERA_PITCH.initial;
  const safeDx = Number.isFinite(dx) ? dx : 0;
  const safeDy = Number.isFinite(dy) ? dy : 0;
  const nextYaw = safeYaw - safeDx * sensitivity.yaw;
  let nextPitch = safePitch - safeDy * sensitivity.pitch;
  nextPitch = clampPitch(nextPitch, clamp.min, clamp.max);
  return { yaw: nextYaw, pitch: nextPitch };
}

export function computeCameraDesired(
  playerPos: Vec3,
  yaw: number,
  pitch: number,
  distance: number,
  offset: CameraOffset = CAMERA_OFFSET,
): Vec3 {
  const safeYaw = Number.isFinite(yaw) ? yaw : 0;
  const safePitch = Number.isFinite(pitch) ? pitch : CAMERA_PITCH.initial;
  const safeDistance = Number.isFinite(distance) ? distance : CAMERA_DISTANCE.default;
  const horizontalDistance = Math.cos(safePitch) * safeDistance;
  const verticalOffset = Math.sin(safePitch) * safeDistance;
  const backBias = offset.back ?? 0;
  const biasedDistance = horizontalDistance + backBias;

  return {
    x: playerPos.x + -Math.sin(safeYaw) * biasedDistance + Math.cos(safeYaw) * offset.side,
    y: playerPos.y + offset.height + verticalOffset,
    z: playerPos.z + -Math.cos(safeYaw) * biasedDistance + -Math.sin(safeYaw) * offset.side,
  };
}

export function computeSmoothingFactor(delta: number, smoothing: number = CAMERA_FOLLOW.smoothing) {
  if (!Number.isFinite(delta) || delta < 0) return 0;
  const raw = 1 - Math.pow(smoothing, delta);
  if (!Number.isFinite(raw)) return 0;
  return Math.min(1, Math.max(0, raw));
}

export function getCameraParentWarnings(
  parent: { scale?: { x: number; y: number; z: number } } | null,
  scene: object | null,
) {
  const invalidParent = Boolean(parent && scene && parent !== scene);
  const scale = parent?.scale;
  const nonUnitScale = Boolean(scale && (scale.x !== 1 || scale.y !== 1 || scale.z !== 1));
  return { invalidParent, nonUnitScale };
}

export function clampCameraDistance(distance: number) {
  return Math.min(CAMERA_DISTANCE.max, Math.max(CAMERA_DISTANCE.min, distance));
}
