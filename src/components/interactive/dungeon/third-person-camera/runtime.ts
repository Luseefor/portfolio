import type { RapierRigidBody } from '@react-three/rapier';
import type { Camera } from 'three';
import { getDungeonVisualLiftAt } from '@/lib/dungeonVisualLift';
import {
  CAMERA_COLLISION,
  CAMERA_DAMPING,
  CAMERA_OFFSET,
  CAMERA_PITCH,
} from '@/constants/camera';
import { clampCameraDistance, clampPitch } from '../math/cameraMath';
import { resolveAllowedDistance, updateCollisionDistance } from './collision';
import { clampBoundsXZ, dampAngle, dampValue, isFiniteVec3Like, smoothingFactor, wrapAngle } from './math';
import type { ThirdPersonCameraState } from './state';
import type { RapierRayFactory, RapierWorld, ThirdPersonCameraOptions } from './types';

type UpdateThirdPersonCameraFrameParams = {
  body: RapierRigidBody;
  delta: number;
  camera: Camera;
  rapier: RapierRayFactory;
  world: RapierWorld;
  options: ThirdPersonCameraOptions;
  state: ThirdPersonCameraState;
};

function initializeCameraState(
  state: ThirdPersonCameraState,
  playerX: number,
  playerY: number,
  playerZ: number,
  options: ThirdPersonCameraOptions,
) {
  const externalYaw = options.yawRef?.current;
  const externalPitch = options.pitchRef?.current;
  state.desiredYawRef.current = wrapAngle(Number.isFinite(externalYaw) ? (externalYaw as number) : 0);
  state.currentYawRef.current = state.desiredYawRef.current;
  state.desiredPitchRef.current = clampPitch(
    Number.isFinite(externalPitch) ? (externalPitch as number) : CAMERA_PITCH.initial,
  );
  state.currentPitchRef.current = state.desiredPitchRef.current;
  state.targetDistanceRef.current = clampCameraDistance(state.targetDistanceRef.current);
  state.zoomDistanceRef.current = state.targetDistanceRef.current;
  state.collisionDistanceRef.current = state.targetDistanceRef.current;
  state.pivotRef.current.set(playerX, playerY + CAMERA_OFFSET.pivotHeight, playerZ);
  state.lookAtRef.current.set(playerX, playerY + CAMERA_OFFSET.lookAtHeight, playerZ);
  state.initializedRef.current = true;
}

export function updateThirdPersonCameraFrame({
  body,
  delta,
  camera,
  rapier,
  world,
  options,
  state,
}: UpdateThirdPersonCameraFrameParams) {
  const translation = body.translation();
  if (!isFiniteVec3Like(translation)) return;
  const playerPosition = state.playerPositionRef.current;
  playerPosition.set(translation.x, translation.y, translation.z);

  if (!state.initializedRef.current) {
    initializeCameraState(state, playerPosition.x, playerPosition.y, playerPosition.z, options);
  }

  const yaw = dampAngle(state.currentYawRef.current, state.desiredYawRef.current, CAMERA_DAMPING.rotation, delta);
  const pitch = dampValue(state.currentPitchRef.current, state.desiredPitchRef.current, CAMERA_DAMPING.pitch, delta);
  state.currentYawRef.current = yaw;
  state.currentPitchRef.current = clampPitch(pitch);

  state.targetDistanceRef.current = clampCameraDistance(state.targetDistanceRef.current);
  state.zoomDistanceRef.current = dampValue(
    state.zoomDistanceRef.current,
    state.targetDistanceRef.current,
    CAMERA_DAMPING.zoom,
    delta,
  );

  state.pivotTargetRef.current.set(playerPosition.x, playerPosition.y + CAMERA_OFFSET.pivotHeight, playerPosition.z);
  state.lookAtTargetRef.current.set(playerPosition.x, playerPosition.y + CAMERA_OFFSET.lookAtHeight, playerPosition.z);
  state.pivotRef.current.lerp(state.pivotTargetRef.current, smoothingFactor(CAMERA_DAMPING.pivot, delta));
  state.lookAtRef.current.lerp(state.lookAtTargetRef.current, smoothingFactor(CAMERA_DAMPING.lookAt, delta));

  const horizontalDistance = Math.cos(state.currentPitchRef.current) * state.zoomDistanceRef.current;
  const verticalDistance = Math.sin(state.currentPitchRef.current) * state.zoomDistanceRef.current;
  state.orbitOffsetRef.current.set(
    -Math.sin(state.currentYawRef.current) * horizontalDistance,
    verticalDistance,
    -Math.cos(state.currentYawRef.current) * horizontalDistance,
  );
  state.rightRef.current.set(Math.cos(state.currentYawRef.current), 0, -Math.sin(state.currentYawRef.current));
  state.shoulderOffsetRef.current.copy(state.rightRef.current).multiplyScalar(CAMERA_OFFSET.shoulder);
  state.desiredPositionRef.current
    .copy(state.pivotRef.current)
    .add(state.orbitOffsetRef.current)
    .add(state.shoulderOffsetRef.current);
  clampBoundsXZ(state.desiredPositionRef.current);

  const allowedDistance = resolveAllowedDistance({
    rapier,
    world,
    targetBody: options.targetBody,
    lookAt: state.lookAtRef.current,
    desiredPosition: state.desiredPositionRef.current,
    right: state.rightRef.current,
    rayDirection: state.rayDirectionRef.current,
    sampleOrigin: state.sampleOriginRef.current,
    zoomDistance: state.zoomDistanceRef.current,
  });
  state.collisionDistanceRef.current = updateCollisionDistance(
    state.collisionDistanceRef.current,
    allowedDistance,
    delta,
    CAMERA_DAMPING.collisionRecovery,
  );

  const resolvedHorizontalDistance = Math.cos(state.currentPitchRef.current) * state.collisionDistanceRef.current;
  const resolvedVerticalDistance = Math.sin(state.currentPitchRef.current) * state.collisionDistanceRef.current;
  state.resolvedPositionRef.current
    .copy(state.pivotRef.current)
    .addScaledVector(state.rightRef.current, CAMERA_OFFSET.shoulder)
    .add(
      state.orbitOffsetRef.current.set(
        -Math.sin(state.currentYawRef.current) * resolvedHorizontalDistance,
        resolvedVerticalDistance,
        -Math.cos(state.currentYawRef.current) * resolvedHorizontalDistance,
      ),
    );
  clampBoundsXZ(state.resolvedPositionRef.current);

  const visualLift = getDungeonVisualLiftAt(playerPosition.x, playerPosition.z);
  const minAllowedY = playerPosition.y + visualLift + CAMERA_COLLISION.minGroundClearance;
  const maxAllowedY = Math.max(minAllowedY + 1, CAMERA_COLLISION.maxCameraY);
  state.resolvedPositionRef.current.y = Math.max(
    minAllowedY,
    Math.min(maxAllowedY, state.resolvedPositionRef.current.y),
  );
  camera.position.lerp(state.resolvedPositionRef.current, smoothingFactor(CAMERA_DAMPING.position, delta));
  clampBoundsXZ(camera.position);
  camera.position.set(
    camera.position.x,
    Math.max(minAllowedY, Math.min(maxAllowedY, camera.position.y)),
    camera.position.z,
  );
  camera.lookAt(state.lookAtRef.current);

  if (options.yawRef) options.yawRef.current = state.currentYawRef.current;
  if (options.pitchRef) options.pitchRef.current = state.currentPitchRef.current;
}
