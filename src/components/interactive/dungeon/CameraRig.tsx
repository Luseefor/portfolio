'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Euler, Quaternion, Vector3 } from 'three';
import { useDungeonInput } from '@/lib/dungeonInput';
import { CAMERA_COLLISION, CAMERA_DISTANCE, CAMERA_PITCH, CAMERA_SENSITIVITY } from '@/constants/camera';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import { clampCameraDistance, clampPitch } from './math/cameraMath';

const PIVOT_HEIGHT = 1.5;
const TARGET_FOLLOW_DAMPING = 16;
const CAMERA_FOLLOW_DAMPING = 14;
const CAMERA_WALL_BUFFER = 0.45;
const CAMERA_MIN_COLLISION_DISTANCE = 1.25;
const CAMERA_MIN_Y = 0.7;
const CAMERA_BORDER_BUFFER = Math.max(DUNGEON_BOUNDS.cameraPadding, 2.4);

const targetPosition = new Vector3();
const smoothedPivot = new Vector3();
const desiredPosition = new Vector3();
const offset = new Vector3();
const rayDirection = new Vector3();
const quaternion = new Quaternion();
const euler = new Euler(0, 0, 0, 'YXZ');

function smoothingFactor(delta: number, damping: number) {
  if (!Number.isFinite(delta) || delta <= 0) return 0;
  return 1 - Math.exp(-damping * delta);
}

function clampMapX(value: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxX - CAMERA_BORDER_BUFFER,
    Math.max(DUNGEON_BOUNDS.minX + CAMERA_BORDER_BUFFER, value),
  );
}

function clampMapZ(value: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxZ - CAMERA_BORDER_BUFFER,
    Math.max(DUNGEON_BOUNDS.minZ + CAMERA_BORDER_BUFFER, value),
  );
}

export default function CameraRig({
  targetBody,
  yawRef,
  pitchRef,
}: {
  targetBody?: MutableRefObject<RapierRigidBody | null> | RapierRigidBody | null;
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
  const lastClientRef = useRef<{ x: number; y: number } | null>(null);
  const initializedRef = useRef(false);

  const yaw = yawRef ?? internalYawRef;
  const pitch = pitchRef ?? internalPitchRef;

  useEffect(() => {
    lastClientRef.current = null;
  }, [isPointerLocked]);

  useEffect(() => {
    const applyMouseDelta = (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) return;
      yaw.current -= dx * CAMERA_SENSITIVITY.yaw;
      pitch.current = clampPitch(pitch.current - dy * CAMERA_SENSITIVITY.pitch);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerLocked && !mouseDown) return;
      if (isPointerLocked) {
        applyMouseDelta(event.movementX || 0, event.movementY || 0);
        return;
      }
      if (!mouseDown || event.buttons <= 0) return;
      if (lastClientRef.current) {
        applyMouseDelta(event.clientX - lastClientRef.current.x, event.clientY - lastClientRef.current.y);
      }
      lastClientRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 0.01) return;
      distanceRef.current = clampCameraDistance(
        distanceRef.current + Math.sign(event.deltaY) * CAMERA_DISTANCE.scrollStep,
      );
    };

    document.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isPointerLocked, mouseDown, pitch, yaw]);

  useFrame((_, delta) => {
    const body = targetBody && 'current' in targetBody ? targetBody.current : targetBody;
    if (!body) return;

    const bodyPosition = body.translation();
    targetPosition.set(bodyPosition.x, bodyPosition.y + PIVOT_HEIGHT, bodyPosition.z);

    if (!initializedRef.current) {
      smoothedPivot.copy(targetPosition);
      initializedRef.current = true;
    } else {
      smoothedPivot.lerp(targetPosition, smoothingFactor(delta, TARGET_FOLLOW_DAMPING));
    }

    euler.set(pitch.current, yaw.current, 0, 'YXZ');
    quaternion.setFromEuler(euler);

    offset.set(0, 0, distanceRef.current).applyQuaternion(quaternion);
    desiredPosition.copy(smoothedPivot).add(offset);
    desiredPosition.x = clampMapX(desiredPosition.x);
    desiredPosition.z = clampMapZ(desiredPosition.z);

    rayDirection.copy(desiredPosition).sub(smoothedPivot);
    const rayDistance = rayDirection.length();
    if (rayDistance > 0.001) {
      rayDirection.normalize();
      const ray = new rapier.Ray(
        { x: smoothedPivot.x, y: smoothedPivot.y, z: smoothedPivot.z },
        { x: rayDirection.x, y: rayDirection.y, z: rayDirection.z },
      );
      const hit = world.castRay(ray, rayDistance, true);
      if (hit) {
        const safeDistance = Math.max(
          Math.max(CAMERA_COLLISION.minCameraDistance, CAMERA_MIN_COLLISION_DISTANCE),
          hit.toi - CAMERA_WALL_BUFFER,
        );
        desiredPosition.copy(smoothedPivot).add(rayDirection.multiplyScalar(safeDistance));
        desiredPosition.x = clampMapX(desiredPosition.x);
        desiredPosition.z = clampMapZ(desiredPosition.z);
      }
    }

    const minY = Math.max(CAMERA_MIN_Y, smoothedPivot.y - 0.25);
    const maxY = Math.max(minY + 0.5, CAMERA_COLLISION.maxCameraY);
    desiredPosition.y = Math.min(maxY, Math.max(minY, desiredPosition.y));

    if (
      !Number.isFinite(desiredPosition.x) ||
      !Number.isFinite(desiredPosition.y) ||
      !Number.isFinite(desiredPosition.z)
    ) {
      return;
    }

    camera.position.lerp(desiredPosition, smoothingFactor(delta, CAMERA_FOLLOW_DAMPING));
    camera.position.set(
      clampMapX(camera.position.x),
      Math.min(maxY, Math.max(minY, camera.position.y)),
      clampMapZ(camera.position.z),
    );
    camera.lookAt(smoothedPivot);
  });

  return null;
}
