'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useDungeonInput } from '@/lib/dungeonInput';
import { getDungeonVisualLiftAt } from '@/lib/dungeonVisualLift';
import {
  CAMERA_COLLISION,
  CAMERA_DISTANCE,
  CAMERA_FOLLOW,
  CAMERA_OFFSET,
  CAMERA_PITCH,
  CAMERA_SENSITIVITY,
} from '@/constants/camera';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import { applyMouseDelta, clampCameraDistance, computeCameraDesired, computeSmoothingFactor } from './math/cameraMath';

const targetPosition = new Vector3();
const smoothedTargetPosition = new Vector3();
const desiredPosition = new Vector3();
const lookAtPosition = new Vector3();
const smoothedLookAtPosition = new Vector3();
const rayDirection = new Vector3();

const TARGET_FOLLOW_SMOOTHING = 0.01;
const CAMERA_FLOOR_CLEARANCE = 0.7;
const CAMERA_MIN_Y = 0.5;
const CAMERA_WALL_HARD_MARGIN = Math.max(CAMERA_DISTANCE.default + 0.6, DUNGEON_BOUNDS.cameraPadding + 3.2);
const CAMERA_WALL_BUFFER = 0.55;
const CAMERA_MIN_COLLISION_DISTANCE = 1.0;
const COLLISION_RECOVERY_DAMPING = 6;
const DEFAULT_MAX_CAMERA_Y = 28;

function isFiniteVec3Like(value: { x: number; y: number; z: number }) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function clampMapX(value: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxX - CAMERA_WALL_HARD_MARGIN,
    Math.max(DUNGEON_BOUNDS.minX + CAMERA_WALL_HARD_MARGIN, value),
  );
}

function clampMapZ(value: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxZ - CAMERA_WALL_HARD_MARGIN,
    Math.max(DUNGEON_BOUNDS.minZ + CAMERA_WALL_HARD_MARGIN, value),
  );
}

export default function CameraRig({
  targetBody,
  yawRef,
  pitchRef,
}: {
  targetBody?: MutableRefObject<RapierRigidBody | null>;
  yawRef?: MutableRefObject<number>;
  pitchRef?: MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const { rapier, world } = useRapier();
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const mouseDown = useDungeonInput((state) => state.mouseDown);
  const internalYawRef = useRef(0);
  const internalPitchRef = useRef(CAMERA_PITCH.initial);
  const distanceRef = useRef(CAMERA_DISTANCE.default);
  const collisionDistanceRef = useRef(CAMERA_DISTANCE.default);
  const lastClientRef = useRef<{ x: number; y: number } | null>(null);
  const initializedRef = useRef(false);

  const yaw = yawRef ?? internalYawRef;
  const pitch = pitchRef ?? internalPitchRef;

  useEffect(() => {
    lastClientRef.current = null;
  }, [isPointerLocked]);

  useEffect(() => {
    const applyDelta = (deltaX: number, deltaY: number) => {
      if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return;
      if (deltaX === 0 && deltaY === 0) return;
      const next = applyMouseDelta(
        yaw.current,
        pitch.current,
        deltaX,
        deltaY,
        CAMERA_SENSITIVITY,
        CAMERA_PITCH,
      );
      yaw.current = next.yaw;
      pitch.current = next.pitch;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const pointerLockedNow = isPointerLocked || document.pointerLockElement !== null;
      if (!pointerLockedNow && !mouseDown) {
        lastClientRef.current = null;
        return;
      }
      if (pointerLockedNow) {
        applyDelta(event.movementX ?? 0, event.movementY ?? 0);
        return;
      }
      if (event.buttons <= 0) {
        lastClientRef.current = null;
        return;
      }
      if (lastClientRef.current) {
        applyDelta(event.clientX - lastClientRef.current.x, event.clientY - lastClientRef.current.y);
      }
      lastClientRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleWheel = (event: WheelEvent) => {
      if (!Number.isFinite(event.deltaY) || Math.abs(event.deltaY) < 0.01) return;
      const next = distanceRef.current + Math.sign(event.deltaY) * CAMERA_DISTANCE.scrollStep;
      distanceRef.current = clampCameraDistance(next);
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isPointerLocked, mouseDown, pitch, yaw]);

  useFrame((_, delta) => {
    const body = targetBody?.current;
    if (!body) return;

    const bodyPosition = body.translation();
    if (!isFiniteVec3Like(bodyPosition)) return;

    targetPosition.set(bodyPosition.x, bodyPosition.y, bodyPosition.z);

    if (!initializedRef.current) {
      smoothedTargetPosition.copy(targetPosition);
      lookAtPosition.set(
        targetPosition.x,
        targetPosition.y + CAMERA_OFFSET.lookAtHeight,
        targetPosition.z,
      );
      smoothedLookAtPosition.copy(lookAtPosition);
      collisionDistanceRef.current = distanceRef.current;
      initializedRef.current = true;
    } else {
      const targetLerp = computeSmoothingFactor(delta, TARGET_FOLLOW_SMOOTHING);
      smoothedTargetPosition.lerp(targetPosition, targetLerp);
      lookAtPosition.set(
        targetPosition.x,
        targetPosition.y + CAMERA_OFFSET.lookAtHeight,
        targetPosition.z,
      );
      smoothedLookAtPosition.lerp(lookAtPosition, targetLerp);
    }

    const safeYaw = finiteOr(yaw.current, 0);
    const safePitch = Math.min(
      CAMERA_PITCH.max,
      Math.max(CAMERA_PITCH.min, finiteOr(pitch.current, CAMERA_PITCH.initial)),
    );
    if (safeYaw !== yaw.current) yaw.current = safeYaw;
    if (safePitch !== pitch.current) pitch.current = safePitch;

    const desiredDistance = clampCameraDistance(finiteOr(distanceRef.current, CAMERA_DISTANCE.default));
    distanceRef.current = desiredDistance;
    if (!Number.isFinite(collisionDistanceRef.current)) {
      collisionDistanceRef.current = desiredDistance;
    }

    // Raycast using intended distance, then smooth out pullback recovery.
    const desiredForRay = computeCameraDesired(
      {
        x: smoothedTargetPosition.x,
        y: smoothedTargetPosition.y,
        z: smoothedTargetPosition.z,
      },
      safeYaw,
      safePitch,
      desiredDistance,
      CAMERA_OFFSET,
    );
    if (!isFiniteVec3Like(desiredForRay)) return;

    desiredPosition.set(desiredForRay.x, desiredForRay.y, desiredForRay.z);
    desiredPosition.x = clampMapX(desiredPosition.x);
    desiredPosition.z = clampMapZ(desiredPosition.z);

    rayDirection.copy(desiredPosition).sub(smoothedLookAtPosition);
    let collisionTargetDistance = desiredDistance;
    const rayDistance = rayDirection.length();
    if (rayDistance > 0.01) {
      rayDirection.normalize();
      const ray = new rapier.Ray(
        { x: smoothedLookAtPosition.x, y: smoothedLookAtPosition.y, z: smoothedLookAtPosition.z },
        { x: rayDirection.x, y: rayDirection.y, z: rayDirection.z },
      );
      const hit = world.castRay(ray, rayDistance, true);
      if (hit && Number.isFinite(hit.toi)) {
        collisionTargetDistance = Math.max(
          Math.max(CAMERA_COLLISION.minCameraDistance, CAMERA_MIN_COLLISION_DISTANCE),
          hit.toi - Math.max(CAMERA_COLLISION.minDistanceFromWall, CAMERA_WALL_BUFFER),
        );
      }
    }

    if (!Number.isFinite(collisionTargetDistance)) return;
    if (collisionTargetDistance < collisionDistanceRef.current) {
      collisionDistanceRef.current = collisionTargetDistance;
    } else {
      const recoverLerp = 1 - Math.exp(-COLLISION_RECOVERY_DAMPING * delta);
      collisionDistanceRef.current +=
        (collisionTargetDistance - collisionDistanceRef.current) * recoverLerp;
    }

    const resolvedDesired = computeCameraDesired(
      {
        x: smoothedTargetPosition.x,
        y: smoothedTargetPosition.y,
        z: smoothedTargetPosition.z,
      },
      safeYaw,
      safePitch,
      collisionDistanceRef.current,
      CAMERA_OFFSET,
    );
    if (!isFiniteVec3Like(resolvedDesired)) return;

    desiredPosition.set(resolvedDesired.x, resolvedDesired.y, resolvedDesired.z);
    desiredPosition.x = clampMapX(desiredPosition.x);
    desiredPosition.z = clampMapZ(desiredPosition.z);

    const visualLift = finiteOr(
      getDungeonVisualLiftAt(smoothedTargetPosition.x, smoothedTargetPosition.z),
      0,
    );
    const minAllowedY = Math.max(CAMERA_MIN_Y, smoothedTargetPosition.y + visualLift + CAMERA_FLOOR_CLEARANCE);
    const maxCameraY = finiteOr(CAMERA_COLLISION.maxCameraY, DEFAULT_MAX_CAMERA_Y);
    const maxAllowedY = Math.max(minAllowedY + 0.5, maxCameraY);
    desiredPosition.y = Math.max(minAllowedY, Math.min(maxAllowedY, desiredPosition.y));

    const lerpFactor = computeSmoothingFactor(delta, CAMERA_FOLLOW.smoothing);
    if (!Number.isFinite(lerpFactor)) return;
    camera.position.lerp(desiredPosition, lerpFactor);
    camera.position.set(
      clampMapX(camera.position.x),
      Math.max(minAllowedY, Math.min(maxAllowedY, camera.position.y)),
      clampMapZ(camera.position.z),
    );

    if (!isFiniteVec3Like(camera.position)) {
      camera.position.set(
        clampMapX(smoothedTargetPosition.x),
        minAllowedY + CAMERA_FLOOR_CLEARANCE,
        clampMapZ(smoothedTargetPosition.z + CAMERA_DISTANCE.default * 0.6),
      );
    }

    if (!isFiniteVec3Like(smoothedLookAtPosition)) {
      smoothedLookAtPosition.set(smoothedTargetPosition.x, minAllowedY, smoothedTargetPosition.z);
    }

    camera.lookAt(smoothedLookAtPosition);
  });

  return null;
}
