import type { MutableRefObject } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { CAMERA_COLLISION } from '@/constants/camera';
import { CAMERA_COLLISION_SAMPLE_OFFSETS } from './constants';
import { dampValue } from './math';
import type { RapierRayFactory, RapierWorld } from './types';

const WORLD_UP = new Vector3(0, 1, 0);

type ResolveAllowedDistanceParams = {
  rapier: RapierRayFactory;
  world: RapierWorld;
  targetBody?: MutableRefObject<RapierRigidBody | null>;
  lookAt: Vector3;
  desiredPosition: Vector3;
  right: Vector3;
  rayDirection: Vector3;
  sampleOrigin: Vector3;
  zoomDistance: number;
};

export function resolveAllowedDistance({
  rapier,
  world,
  targetBody,
  lookAt,
  desiredPosition,
  right,
  rayDirection,
  sampleOrigin,
  zoomDistance,
}: ResolveAllowedDistanceParams) {
  let allowedDistance = zoomDistance;
  rayDirection.copy(desiredPosition).sub(lookAt);
  const rayLength = rayDirection.length();
  if (rayLength <= 1e-4) return allowedDistance;

  rayDirection.multiplyScalar(1 / rayLength);
  const collisionRadius = CAMERA_COLLISION.radius;
  const wallBuffer = CAMERA_COLLISION.minDistanceFromWall;
  const minDistance = CAMERA_COLLISION.minCameraDistance;

  for (let i = 0; i < CAMERA_COLLISION_SAMPLE_OFFSETS.length; i += 1) {
    const [xOffsetScale, yOffsetScale] = CAMERA_COLLISION_SAMPLE_OFFSETS[i];
    sampleOrigin
      .copy(lookAt)
      .addScaledVector(right, xOffsetScale * collisionRadius)
      .addScaledVector(WORLD_UP, yOffsetScale * collisionRadius);

    const ray = new rapier.Ray(
      {
        x: sampleOrigin.x,
        y: sampleOrigin.y,
        z: sampleOrigin.z,
      },
      {
        x: rayDirection.x,
        y: rayDirection.y,
        z: rayDirection.z,
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

  return allowedDistance;
}

export function updateCollisionDistance(current: number, allowedDistance: number, delta: number, lambda: number) {
  if (allowedDistance < current) return allowedDistance;
  return dampValue(current, allowedDistance, lambda, delta);
}
