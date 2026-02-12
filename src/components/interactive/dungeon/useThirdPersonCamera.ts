'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useDungeonInput } from '@/lib/dungeonInput';
import { getDungeonVisualLiftAt } from '@/lib/dungeonVisualLift';
import { useSettings } from '@/lib/settings';
import {
  CAMERA_COLLISION,
  CAMERA_DAMPING,
  CAMERA_DISTANCE,
  CAMERA_OFFSET,
  CAMERA_PITCH,
  CAMERA_SENSITIVITY,
} from '@/constants/camera';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import { clampCameraDistance, clampPitch } from './math/cameraMath';

const WORLD_UP = new Vector3(0, 1, 0);
const SAMPLE_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 0.8],
  [0, -0.55],
  [0.65, 0.35],
  [-0.65, 0.35],
];

type ThirdPersonCameraOptions = {
  targetBody?: MutableRefObject<RapierRigidBody | null>;
  yawRef?: MutableRefObject<number>;
  pitchRef?: MutableRefObject<number>;
};

function smoothingFactor(lambda: number, delta: number) {
  if (!Number.isFinite(delta) || delta <= 0) return 0;
  if (!Number.isFinite(lambda) || lambda <= 0) return 1;
  return 1 - Math.exp(-lambda * delta);
}

function dampValue(current: number, target: number, lambda: number, delta: number) {
  const t = smoothingFactor(lambda, delta);
  return current + (target - current) * t;
}

function wrapAngle(angle: number) {
  if (!Number.isFinite(angle)) return 0;
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function dampAngle(current: number, target: number, lambda: number, delta: number) {
  const safeCurrent = wrapAngle(current);
  const safeTarget = wrapAngle(target);
  const deltaAngle = Math.atan2(Math.sin(safeTarget - safeCurrent), Math.cos(safeTarget - safeCurrent));
  const t = smoothingFactor(lambda, delta);
  return wrapAngle(safeCurrent + deltaAngle * t);
}

function clampBoundsXZ(position: Vector3, padding = CAMERA_COLLISION.boundsPadding) {
  position.x = Math.min(
    DUNGEON_BOUNDS.maxX - padding,
    Math.max(DUNGEON_BOUNDS.minX + padding, position.x),
  );
  position.z = Math.min(
    DUNGEON_BOUNDS.maxZ - padding,
    Math.max(DUNGEON_BOUNDS.minZ + padding, position.z),
  );
}

function isFiniteVec3Like(value: { x: number; y: number; z: number }) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}

export function useThirdPersonCamera({ targetBody, yawRef, pitchRef }: ThirdPersonCameraOptions) {
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const mouseSensitivity = useSettings((state) => state.mouseSensitivity);

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

  const pointerDragState = useRef<{ active: boolean; x: number; y: number; hasPoint: boolean }>({
    active: false,
    x: 0,
    y: 0,
    hasPoint: false,
  });

  const pointerLockElement = useMemo(() => gl.domElement, [gl.domElement]);

  useEffect(() => {
    const canvas = pointerLockElement;
    if (!canvas) return;

    const drag = pointerDragState.current;

    const applyMouseDelta = (dx: number, dy: number) => {
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
      const sensitivityScale = Math.max(0.1, Math.min(3, mouseSensitivity || 1));
      desiredYawRef.current = wrapAngle(
        desiredYawRef.current - dx * CAMERA_SENSITIVITY.yaw * sensitivityScale,
      );
      desiredPitchRef.current = clampPitch(
        desiredPitchRef.current - dy * CAMERA_SENSITIVITY.pitch * sensitivityScale,
      );
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag.active = true;
      drag.hasPoint = false;
      canvas.focus();
      if (document.pointerLockElement !== canvas) {
        try {
          canvas.requestPointerLock();
        } catch {
          // Drag fallback still works when pointer lock request is rejected.
        }
      }
    };

    const stopDragging = () => {
      drag.active = false;
      drag.hasPoint = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const locked = document.pointerLockElement === canvas || isPointerLocked;
      if (locked) {
        applyMouseDelta(event.movementX ?? 0, event.movementY ?? 0);
        return;
      }

      if (!drag.active || event.buttons === 0) {
        stopDragging();
        return;
      }

      if (!drag.hasPoint) {
        drag.hasPoint = true;
        drag.x = event.clientX;
        drag.y = event.clientY;
        return;
      }

      applyMouseDelta(event.clientX - drag.x, event.clientY - drag.y);
      drag.x = event.clientX;
      drag.y = event.clientY;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!Number.isFinite(event.deltaY)) return;
      event.preventDefault();
      const next = targetDistanceRef.current + Math.sign(event.deltaY) * CAMERA_DISTANCE.scrollStep;
      targetDistanceRef.current = clampCameraDistance(next);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('blur', stopDragging);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('blur', stopDragging);
    };
  }, [isPointerLocked, mouseSensitivity, pointerLockElement]);

  useFrame((_, delta) => {
    const body = targetBody?.current;
    if (!body) return;

    const translation = body.translation();
    if (!isFiniteVec3Like(translation)) return;

    const playerPosition = playerPositionRef.current;
    playerPosition.set(translation.x, translation.y, translation.z);

    if (!initializedRef.current) {
      const externalYaw = yawRef?.current;
      const externalPitch = pitchRef?.current;
      desiredYawRef.current = wrapAngle(Number.isFinite(externalYaw) ? (externalYaw as number) : 0);
      currentYawRef.current = desiredYawRef.current;
      desiredPitchRef.current = clampPitch(
        Number.isFinite(externalPitch) ? (externalPitch as number) : CAMERA_PITCH.initial,
      );
      currentPitchRef.current = desiredPitchRef.current;

      targetDistanceRef.current = clampCameraDistance(targetDistanceRef.current);
      zoomDistanceRef.current = targetDistanceRef.current;
      collisionDistanceRef.current = targetDistanceRef.current;

      pivotRef.current.set(playerPosition.x, playerPosition.y + CAMERA_OFFSET.pivotHeight, playerPosition.z);
      lookAtRef.current.set(playerPosition.x, playerPosition.y + CAMERA_OFFSET.lookAtHeight, playerPosition.z);

      initializedRef.current = true;
    }

    const yaw = dampAngle(currentYawRef.current, desiredYawRef.current, CAMERA_DAMPING.rotation, delta);
    const pitch = dampValue(currentPitchRef.current, desiredPitchRef.current, CAMERA_DAMPING.pitch, delta);
    currentYawRef.current = yaw;
    currentPitchRef.current = clampPitch(pitch);

    targetDistanceRef.current = clampCameraDistance(targetDistanceRef.current);
    zoomDistanceRef.current = dampValue(
      zoomDistanceRef.current,
      targetDistanceRef.current,
      CAMERA_DAMPING.zoom,
      delta,
    );

    pivotTargetRef.current.set(playerPosition.x, playerPosition.y + CAMERA_OFFSET.pivotHeight, playerPosition.z);
    lookAtTargetRef.current.set(playerPosition.x, playerPosition.y + CAMERA_OFFSET.lookAtHeight, playerPosition.z);

    const pivotLerp = smoothingFactor(CAMERA_DAMPING.pivot, delta);
    const lookAtLerp = smoothingFactor(CAMERA_DAMPING.lookAt, delta);
    pivotRef.current.lerp(pivotTargetRef.current, pivotLerp);
    lookAtRef.current.lerp(lookAtTargetRef.current, lookAtLerp);

    const horizontalDistance = Math.cos(currentPitchRef.current) * zoomDistanceRef.current;
    const verticalDistance = Math.sin(currentPitchRef.current) * zoomDistanceRef.current;

    orbitOffsetRef.current.set(
      -Math.sin(currentYawRef.current) * horizontalDistance,
      verticalDistance,
      -Math.cos(currentYawRef.current) * horizontalDistance,
    );

    rightRef.current.set(Math.cos(currentYawRef.current), 0, -Math.sin(currentYawRef.current));
    shoulderOffsetRef.current.copy(rightRef.current).multiplyScalar(CAMERA_OFFSET.shoulder);

    desiredPositionRef.current
      .copy(pivotRef.current)
      .add(orbitOffsetRef.current)
      .add(shoulderOffsetRef.current);
    clampBoundsXZ(desiredPositionRef.current);

    let allowedDistance = zoomDistanceRef.current;

    rayDirectionRef.current.copy(desiredPositionRef.current).sub(lookAtRef.current);
    const rayLength = rayDirectionRef.current.length();
    if (rayLength > 1e-4) {
      rayDirectionRef.current.multiplyScalar(1 / rayLength);
      const collisionRadius = CAMERA_COLLISION.radius;
      const wallBuffer = CAMERA_COLLISION.minDistanceFromWall;
      const minDistance = CAMERA_COLLISION.minCameraDistance;

      for (let i = 0; i < SAMPLE_OFFSETS.length; i += 1) {
        const [xOffsetScale, yOffsetScale] = SAMPLE_OFFSETS[i];
        sampleOriginRef.current
          .copy(lookAtRef.current)
          .addScaledVector(rightRef.current, xOffsetScale * collisionRadius)
          .addScaledVector(WORLD_UP, yOffsetScale * collisionRadius);

        const ray = new rapier.Ray(
          {
            x: sampleOriginRef.current.x,
            y: sampleOriginRef.current.y,
            z: sampleOriginRef.current.z,
          },
          {
            x: rayDirectionRef.current.x,
            y: rayDirectionRef.current.y,
            z: rayDirectionRef.current.z,
          },
        );

        const hit = world.castRay(
          ray,
          rayLength + collisionRadius,
          true,
          undefined,
          undefined,
          undefined,
          targetBody?.current ?? undefined,
        );

        if (hit && Number.isFinite(hit.timeOfImpact)) {
          const hitDistance = Math.max(minDistance, hit.timeOfImpact - wallBuffer);
          allowedDistance = Math.min(allowedDistance, hitDistance);
        }
      }
    }

    if (allowedDistance < collisionDistanceRef.current) {
      collisionDistanceRef.current = allowedDistance;
    } else {
      collisionDistanceRef.current = dampValue(
        collisionDistanceRef.current,
        allowedDistance,
        CAMERA_DAMPING.collisionRecovery,
        delta,
      );
    }

    const resolvedHorizontalDistance = Math.cos(currentPitchRef.current) * collisionDistanceRef.current;
    const resolvedVerticalDistance = Math.sin(currentPitchRef.current) * collisionDistanceRef.current;

    resolvedPositionRef.current
      .copy(pivotRef.current)
      .addScaledVector(rightRef.current, CAMERA_OFFSET.shoulder)
      .add(
        orbitOffsetRef.current.set(
          -Math.sin(currentYawRef.current) * resolvedHorizontalDistance,
          resolvedVerticalDistance,
          -Math.cos(currentYawRef.current) * resolvedHorizontalDistance,
        ),
      );

    clampBoundsXZ(resolvedPositionRef.current);

    const visualLift = getDungeonVisualLiftAt(playerPosition.x, playerPosition.z);
    const minAllowedY = playerPosition.y + visualLift + CAMERA_COLLISION.minGroundClearance;
    const maxAllowedY = Math.max(minAllowedY + 1, CAMERA_COLLISION.maxCameraY);
    resolvedPositionRef.current.y = Math.max(minAllowedY, Math.min(maxAllowedY, resolvedPositionRef.current.y));

    const positionLerp = smoothingFactor(CAMERA_DAMPING.position, delta);
    camera.position.lerp(resolvedPositionRef.current, positionLerp);

    clampBoundsXZ(camera.position);
    const clampedY = Math.max(minAllowedY, Math.min(maxAllowedY, camera.position.y));
    camera.position.set(camera.position.x, clampedY, camera.position.z);
    camera.lookAt(lookAtRef.current);

    if (yawRef) yawRef.current = currentYawRef.current;
    if (pitchRef) pitchRef.current = currentPitchRef.current;
  });
}
