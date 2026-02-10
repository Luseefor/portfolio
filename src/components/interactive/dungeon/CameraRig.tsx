'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useDungeonInput } from '@/lib/dungeonInput';
import { getDungeonVisualLiftAt } from '@/lib/dungeonVisualLift';
import {
  CAMERA_DISTANCE,
  CAMERA_OFFSET,
  CAMERA_PITCH,
  CAMERA_SENSITIVITY,
  CAMERA_FOLLOW,
  CAMERA_COLLISION,
} from '@/constants/camera';
import { applyMouseDelta, clampCameraDistance, computeCameraDesired, computeSmoothingFactor } from './math/cameraMath';

const targetPosition = new Vector3();
const smoothedTargetPosition = new Vector3();
const lookAtPosition = new Vector3();
const smoothedLookAtPosition = new Vector3();
const desiredPosition = new Vector3();
const rayDirection = new Vector3();
const TARGET_FOLLOW_SMOOTHING = 0.005;
const FLOOR_PROBE_HEIGHT = 2.4;
const FLOOR_PROBE_DISTANCE = 10;
const CAMERA_FLOOR_CLEARANCE = 0.45;
const CAMERA_MIN_Y = 0.35;
const CAMERA_BORDER_PADDING = 1.2;
const MAP_MIN_X = -84;
const MAP_MAX_X = 84;
const MAP_MIN_Z = -84;
const MAP_MAX_Z = 84;

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
  const internalYaw = useRef(0);
  const internalPitch = useRef(CAMERA_PITCH.initial);
  const distanceRef = useRef(CAMERA_DISTANCE.default);
  const lastClientRef = useRef<{ x: number; y: number } | null>(null);
  const initializedRef = useRef(false);
  const lastFloorYRef = useRef(CAMERA_MIN_Y);

  const yaw = yawRef ?? internalYaw;
  const pitch = pitchRef ?? internalPitch;

  useEffect(() => {
    lastClientRef.current = null;
  }, [isPointerLocked]);

  useEffect(() => {
    const applyDelta = (deltaX: number, deltaY: number) => {
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
      if (!isPointerLocked && !mouseDown) return;
      const rawX =
        event.movementX ||
        (event as MouseEvent & { mozMovementX?: number }).mozMovementX ||
        (event as MouseEvent & { webkitMovementX?: number }).webkitMovementX ||
        0;
      const rawY =
        event.movementY ||
        (event as MouseEvent & { mozMovementY?: number }).mozMovementY ||
        (event as MouseEvent & { webkitMovementY?: number }).webkitMovementY ||
        0;

      if (rawX === 0 && rawY === 0 && isPointerLocked) {
        if (lastClientRef.current) {
          applyDelta(event.clientX - lastClientRef.current.x, event.clientY - lastClientRef.current.y);
        }
        lastClientRef.current = { x: event.clientX, y: event.clientY };
        return;
      }

      lastClientRef.current = { x: event.clientX, y: event.clientY };
      applyDelta(rawX, rawY);
    };

    const handlePointerRawUpdate = (event: PointerEvent) => {
      if (!isPointerLocked && !mouseDown) return;
      applyDelta(event.movementX || 0, event.movementY || 0);
    };

    const handleWheel = (event: WheelEvent) => {
      const hasTrackpad = typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0;
      const hasDelta = Math.abs(event.deltaX) + Math.abs(event.deltaY) > 0.01;
      const useWheelLook = isPointerLocked && hasTrackpad && hasDelta && !event.metaKey && !event.ctrlKey;

      if (useWheelLook) {
        event.preventDefault();
        applyDelta(event.deltaX * 0.6, event.deltaY * 0.6);
        return;
      }

      const next = distanceRef.current + Math.sign(event.deltaY) * CAMERA_DISTANCE.scrollStep;
      distanceRef.current = clampCameraDistance(next);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerrawupdate', handlePointerRawUpdate);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerrawupdate', handlePointerRawUpdate);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isPointerLocked, mouseDown, pitch, yaw]);

  useFrame((_, delta) => {
    const body = targetBody?.current;
    if (!body) return;

    const position = body.translation();
    targetPosition.set(position.x, position.y, position.z);
    if (!initializedRef.current) {
      smoothedTargetPosition.copy(targetPosition);
      lookAtPosition.set(
        targetPosition.x,
        targetPosition.y + CAMERA_OFFSET.lookAtHeight,
        targetPosition.z,
      );
      smoothedLookAtPosition.copy(lookAtPosition);
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

    const desired = computeCameraDesired(
      { x: smoothedTargetPosition.x, y: smoothedTargetPosition.y, z: smoothedTargetPosition.z },
      yaw.current,
      pitch.current,
      distanceRef.current,
      CAMERA_OFFSET,
    );
    desiredPosition.set(desired.x, desired.y, desired.z);

    rayDirection.copy(desiredPosition).sub(smoothedTargetPosition);
    const rayDistance = rayDirection.length();
    if (rayDistance > 0.01) {
      rayDirection.normalize();
      const ray = new rapier.Ray(
        { x: smoothedTargetPosition.x, y: smoothedTargetPosition.y, z: smoothedTargetPosition.z },
        { x: rayDirection.x, y: rayDirection.y, z: rayDirection.z },
      );
      const hit = world.castRay(ray, rayDistance, true);
      if (hit && hit.toi > 0.25) {
        const safeDistance = Math.max(
          CAMERA_COLLISION.minCameraDistance,
          hit.toi - CAMERA_COLLISION.minDistanceFromWall,
        );
        desiredPosition.copy(smoothedTargetPosition).add(rayDirection.multiplyScalar(safeDistance));
      }
    }

    const probeOriginY = smoothedTargetPosition.y + FLOOR_PROBE_HEIGHT;
    const probeFloorAt = (x: number, z: number) => {
      const floorProbe = new rapier.Ray({ x, y: probeOriginY, z }, { x: 0, y: -1, z: 0 });
      const floorHit = world.castRay(floorProbe, FLOOR_PROBE_DISTANCE, true);
      if (!floorHit) return null;
      return probeOriginY - floorHit.toi;
    };

    const floorAtDesired = probeFloorAt(desiredPosition.x, desiredPosition.z);
    const floorAtTarget = probeFloorAt(smoothedTargetPosition.x, smoothedTargetPosition.z);
    const floorY =
      floorAtDesired != null && floorAtTarget != null
        ? Math.max(floorAtDesired, floorAtTarget)
        : floorAtDesired ?? floorAtTarget ?? lastFloorYRef.current;
    lastFloorYRef.current = floorY;

    const visualLift = Math.max(
      getDungeonVisualLiftAt(desiredPosition.x, desiredPosition.z),
      getDungeonVisualLiftAt(smoothedTargetPosition.x, smoothedTargetPosition.z),
    );
    let minAllowedY = Math.max(CAMERA_MIN_Y, floorY + visualLift + CAMERA_FLOOR_CLEARANCE);
    // Ensure we never sink far below the player anchor even if a probe misses.
    minAllowedY = Math.max(minAllowedY, smoothedTargetPosition.y - 0.15);
    if (desiredPosition.y < minAllowedY) {
      desiredPosition.y = minAllowedY;
    }
    desiredPosition.x = Math.min(MAP_MAX_X - CAMERA_BORDER_PADDING, Math.max(MAP_MIN_X + CAMERA_BORDER_PADDING, desiredPosition.x));
    desiredPosition.z = Math.min(MAP_MAX_Z - CAMERA_BORDER_PADDING, Math.max(MAP_MIN_Z + CAMERA_BORDER_PADDING, desiredPosition.z));

    const lerpFactor = computeSmoothingFactor(delta, CAMERA_FOLLOW.smoothing);
    camera.position.lerp(desiredPosition, lerpFactor);
    if (camera.position.y < minAllowedY) {
      camera.position.lerp(desiredPosition, 1);
    }
    const clampedX = Math.min(
      MAP_MAX_X - CAMERA_BORDER_PADDING,
      Math.max(MAP_MIN_X + CAMERA_BORDER_PADDING, camera.position.x),
    );
    const clampedZ = Math.min(
      MAP_MAX_Z - CAMERA_BORDER_PADDING,
      Math.max(MAP_MIN_Z + CAMERA_BORDER_PADDING, camera.position.z),
    );
    camera.position.set(clampedX, camera.position.y, clampedZ);
    camera.lookAt(smoothedLookAtPosition);
  });

  return null;
}
