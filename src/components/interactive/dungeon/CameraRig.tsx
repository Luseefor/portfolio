'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useDungeonInput } from '@/lib/dungeonInput';
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
const desiredPosition = new Vector3();
const rayDirection = new Vector3();

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
      const next = distanceRef.current + Math.sign(event.deltaY) * CAMERA_DISTANCE.scrollStep;
      distanceRef.current = clampCameraDistance(next);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerrawupdate', handlePointerRawUpdate);
    window.addEventListener('wheel', handleWheel, { passive: true });
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

    const desired = computeCameraDesired(
      { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
      yaw.current,
      pitch.current,
      distanceRef.current,
      CAMERA_OFFSET,
    );
    desiredPosition.set(desired.x, desired.y, desired.z);

    rayDirection.copy(desiredPosition).sub(targetPosition);
    const rayDistance = rayDirection.length();
    if (rayDistance > 0.01) {
      rayDirection.normalize();
      const ray = new rapier.Ray(
        { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
        { x: rayDirection.x, y: rayDirection.y, z: rayDirection.z },
      );
      const hit = world.castRay(ray, rayDistance, true);
      if (hit && (hit as any).toi > 0.25) {
        const safeDistance = Math.max(
          CAMERA_COLLISION.minCameraDistance,
          (hit as any).toi - CAMERA_COLLISION.minDistanceFromWall,
        );
        desiredPosition.copy(targetPosition).add(rayDirection.multiplyScalar(safeDistance));
      }
    }

    const lerpFactor = computeSmoothingFactor(delta, CAMERA_FOLLOW.smoothing);
    camera.position.lerp(desiredPosition, lerpFactor);
    camera.lookAt(
      targetPosition.x,
      targetPosition.y + CAMERA_OFFSET.lookAtHeight,
      targetPosition.z,
    );
  });

  return null;
}
