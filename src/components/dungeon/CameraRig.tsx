'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Vector3, type Group } from 'three';
import { useSettings } from '@/lib/settings';
import { useDungeonInput } from '@/lib/dungeonInput';
import {
  CAMERA_DISTANCE,
  CAMERA_OFFSET,
  CAMERA_FOLLOW,
  CAMERA_SENSITIVITY,
  CAMERA_PITCH,
  CAMERA_COLLISION,
} from '@/constants/camera';
import {
  applyMouseDelta,
  clampCameraDistance,
  computeCameraDesired,
  computeSmoothingFactor,
  getCameraParentWarnings,
} from '@/components/dungeon/math/cameraMath';

const targetPosition = new Vector3();
const desiredPosition = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const rayDirection = new Vector3();

export default function CameraRig({
  target,
  yawRef,
  pitchRef,
  targetBody,
}: {
  target: RefObject<Group>;
  yawRef?: MutableRefObject<number>;
  pitchRef?: MutableRefObject<number>;
  targetBody?: MutableRefObject<RapierRigidBody | null>;
}) {
  const { camera } = useThree();
  const { scene } = useThree();
  const { rapier, world } = useRapier();
  const mouseSensitivity = useSettings((state) => state.mouseSensitivity);
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const internalYaw = useRef(0);
  const internalPitch = useRef(CAMERA_PITCH.initial);
  const distanceRef = useRef(CAMERA_DISTANCE.default);
  const devWarningTimer = useRef(0);
  const devErrorTimer = useRef(0);
  const isDev = process.env.NODE_ENV !== 'production';

  const yawValue = yawRef ?? internalYaw;
  const pitchValue = pitchRef ?? internalPitch;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked) return;
      const next = applyMouseDelta(
        yawValue.current,
        pitchValue.current,
        event.movementX,
        event.movementY,
        {
          yaw: CAMERA_SENSITIVITY.yaw * mouseSensitivity,
          pitch: CAMERA_SENSITIVITY.pitch * mouseSensitivity,
        },
        CAMERA_PITCH
      );
      yawValue.current = next.yaw;
      pitchValue.current = next.pitch;
    };

    const handleWheel = (event: WheelEvent) => {
      const next = distanceRef.current + Math.sign(event.deltaY) * CAMERA_DISTANCE.scrollStep;
      distanceRef.current = clampCameraDistance(next);
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isPointerLocked, mouseSensitivity, pitchValue, yawValue]);

  useFrame((_, delta) => {
    if (isDev) {
      devWarningTimer.current += delta;
      devErrorTimer.current += delta;
    }

    const targetBodyRef = targetBody?.current ?? null;
    if (targetBodyRef) {
      const position = targetBodyRef.translation();
      if (isDev && (!Number.isFinite(position.x) || !Number.isFinite(position.y) || !Number.isFinite(position.z))) {
        if (devErrorTimer.current > 0.5) {
          console.error('[CameraRig] Non-finite player position detected.', position);
          devErrorTimer.current = 0;
        }
        return;
      }
      targetPosition.set(position.x, position.y, position.z);
    } else {
      const targetGroup = target.current;
      if (!targetGroup) return;
      targetGroup.getWorldPosition(targetPosition);
    }

    const yaw = yawValue.current;
    const pitch = pitchValue.current;
    const distance = distanceRef.current;

    if (isDev && (!Number.isFinite(yaw) || !Number.isFinite(pitch))) {
      if (devErrorTimer.current > 0.5) {
        console.error('[CameraRig] Non-finite yaw/pitch detected.', { yaw, pitch });
        devErrorTimer.current = 0;
      }
      return;
    }

    forward.set(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
    right.set(forward.z, 0, -forward.x).normalize();

    const desired = computeCameraDesired(
      { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
      yaw,
      pitch,
      distance,
      CAMERA_OFFSET
    );
    desiredPosition.set(desired.x, desired.y, desired.z);

    rayDirection.copy(desiredPosition).sub(targetPosition);
    const rayDistance = rayDirection.length();
    if (!Number.isFinite(rayDistance) || rayDistance < 1e-4) {
      return;
    }
    rayDirection.normalize();

    const ray = new rapier.Ray(
      { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
      { x: rayDirection.x, y: rayDirection.y, z: rayDirection.z }
    );
    const hit = world.castRay(ray, rayDistance, true);
    let cameraTarget = desiredPosition;
    if (hit) {
      const safeDistance = Math.max(CAMERA_COLLISION.minCameraDistance, hit.toi - CAMERA_COLLISION.minDistanceFromWall);
      cameraTarget = targetPosition.clone().add(rayDirection.multiplyScalar(safeDistance));
    }

    if (!Number.isFinite(cameraTarget.x) || !Number.isFinite(cameraTarget.y) || !Number.isFinite(cameraTarget.z)) {
      return;
    }
    const lerpFactor = computeSmoothingFactor(delta, CAMERA_FOLLOW.smoothing);
    camera.position.lerp(cameraTarget, lerpFactor);
    if (
      isDev &&
      (!Number.isFinite(camera.position.x) ||
        !Number.isFinite(camera.position.y) ||
        !Number.isFinite(camera.position.z))
    ) {
      if (devErrorTimer.current > 0.5) {
        console.error('[CameraRig] Non-finite camera position detected.', camera.position);
        devErrorTimer.current = 0;
      }
      return;
    }
    camera.lookAt(targetPosition.x, targetPosition.y + CAMERA_OFFSET.lookAtHeight, targetPosition.z);

    if (isDev && devWarningTimer.current > 0.75) {
      devWarningTimer.current = 0;
      if (isPointerLocked && document.pointerLockElement === null) {
        console.warn('[CameraRig] Pointer lock state mismatch: expected locked but element is null.');
      }
      const warnings = getCameraParentWarnings(camera.parent, scene);
      if (warnings.invalidParent) {
        console.warn('[CameraRig] Camera parent is not the scene root.');
      }
      if (warnings.nonUnitScale) {
        console.warn('[CameraRig] Camera parent has non-unit scale.');
      }
    }
  });

  return null;
}
