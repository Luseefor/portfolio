'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react';
import { useRapier } from '@react-three/rapier';
import { MathUtils, Vector3, type Group } from 'three';
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

const targetPosition = new Vector3();
const desiredPosition = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const rayDirection = new Vector3();

export default function CameraRig({
  target,
  yawRef,
  pitchRef,
}: {
  target: RefObject<Group>;
  yawRef?: MutableRefObject<number>;
  pitchRef?: MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const { rapier, world } = useRapier();
  const mouseSensitivity = useSettings((state) => state.mouseSensitivity);
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const internalYaw = useRef(0);
  const internalPitch = useRef(CAMERA_PITCH.initial);
  const distanceRef = useRef(CAMERA_DISTANCE.default);

  const yawValue = yawRef ?? internalYaw;
  const pitchValue = pitchRef ?? internalPitch;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked) return;
      yawValue.current -= event.movementX * CAMERA_SENSITIVITY.yaw * mouseSensitivity;
      pitchValue.current -= event.movementY * CAMERA_SENSITIVITY.pitch * mouseSensitivity;
      pitchValue.current = MathUtils.clamp(pitchValue.current, CAMERA_PITCH.min, CAMERA_PITCH.max);
    };

    const handleWheel = (event: WheelEvent) => {
      const next = distanceRef.current + Math.sign(event.deltaY) * CAMERA_DISTANCE.scrollStep;
      distanceRef.current = MathUtils.clamp(next, CAMERA_DISTANCE.min, CAMERA_DISTANCE.max);
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isPointerLocked, mouseSensitivity, pitchValue, yawValue]);

  useFrame((_, delta) => {
    const targetGroup = target.current;
    if (!targetGroup) return;
    targetGroup.getWorldPosition(targetPosition);

    const yaw = yawValue.current;
    const pitch = pitchValue.current;
    const distance = distanceRef.current;

    forward.set(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
    right.set(forward.z, 0, -forward.x).normalize();

    const horizontalDistance = Math.cos(pitch) * distance;
    const verticalOffset = Math.sin(pitch) * distance;

    desiredPosition
      .copy(targetPosition)
      .add(forward.clone().multiplyScalar(-horizontalDistance))
      .add(right.clone().multiplyScalar(CAMERA_OFFSET.side))
      .add(up.clone().multiplyScalar(CAMERA_OFFSET.height + verticalOffset));

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
    camera.position.lerp(cameraTarget, 1 - Math.pow(CAMERA_FOLLOW.smoothing, delta));
    camera.lookAt(targetPosition.x, targetPosition.y + CAMERA_OFFSET.lookAtHeight, targetPosition.z);
  });

  return null;
}
