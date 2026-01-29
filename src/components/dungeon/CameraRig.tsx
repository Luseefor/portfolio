'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react';
import { useRapier } from '@react-three/rapier';
import { MathUtils, Vector3, type Group } from 'three';

const targetPosition = new Vector3();
const desiredPosition = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const rayDirection = new Vector3();

const DEFAULT_DISTANCE = 6.6;
const MIN_DISTANCE = 4.2;
const MAX_DISTANCE = 9.5;
const SIDE_OFFSET = 0.9;
const HEIGHT_OFFSET = 1.8;
const PITCH_MIN = MathUtils.degToRad(-30);
const PITCH_MAX = MathUtils.degToRad(35);

export default function CameraRig({
  target,
  yawRef,
  pitchRef,
}: {
  target: RefObject<Group>;
  yawRef?: MutableRefObject<number>;
  pitchRef?: MutableRefObject<number>;
}) {
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const internalYaw = useRef(0);
  const internalPitch = useRef(MathUtils.degToRad(-10));
  const distanceRef = useRef(DEFAULT_DISTANCE);

  const yawValue = yawRef ?? internalYaw;
  const pitchValue = pitchRef ?? internalPitch;

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      yawValue.current -= event.movementX * 0.0025;
      pitchValue.current -= event.movementY * 0.0022;
      pitchValue.current = MathUtils.clamp(pitchValue.current, PITCH_MIN, PITCH_MAX);
    };

    const handleWheel = (event: WheelEvent) => {
      const next = distanceRef.current + Math.sign(event.deltaY) * 0.4;
      distanceRef.current = MathUtils.clamp(next, MIN_DISTANCE, MAX_DISTANCE);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [gl, pitchValue, yawValue]);

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
      .add(right.clone().multiplyScalar(SIDE_OFFSET))
      .add(up.clone().multiplyScalar(HEIGHT_OFFSET + verticalOffset));

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
      const safeDistance = Math.max(0.5, hit.toi - 0.3);
      cameraTarget = targetPosition.clone().add(rayDirection.multiplyScalar(safeDistance));
    }

    if (!Number.isFinite(cameraTarget.x) || !Number.isFinite(cameraTarget.y) || !Number.isFinite(cameraTarget.z)) {
      return;
    }
    camera.position.lerp(cameraTarget, 1 - Math.pow(0.001, delta));
    camera.lookAt(targetPosition.x, targetPosition.y + 1.3, targetPosition.z);
  });

  return null;
}
