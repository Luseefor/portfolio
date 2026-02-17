import { MathUtils, type PerspectiveCamera, type Quaternion, type Vector3 } from 'three';
import type { MutableRefObject } from 'react';
import { DASH_CAMERA_KICK, DASH_FOV_DAMPING, PLAYER_STATE_PUBLISH_INTERVAL } from './constants';
import {
  shouldPublishPlayerSnapshot,
  type PlayerSnapshot,
} from './state';

type PublishPlayerStateParams = {
  body: {
    translation: () => { x: number; y: number; z: number };
    linvel: () => { x: number; y: number; z: number };
    rotation: () => { x: number; y: number; z: number; w: number };
  };
  bodyQuaternion: Quaternion;
  stateForward: Vector3;
  lookForward: Vector3;
  grounded: boolean;
  delta: number;
  playerStatePublishTimerRef: MutableRefObject<number>;
  lastPublishedPlayerStateRef: MutableRefObject<PlayerSnapshot>;
  setPlayerState: (next: PlayerSnapshot) => void;
};

export function publishPlayerStateIfNeeded({
  body,
  bodyQuaternion,
  stateForward,
  lookForward,
  grounded,
  delta,
  playerStatePublishTimerRef,
  lastPublishedPlayerStateRef,
  setPlayerState,
}: PublishPlayerStateParams) {
  const finalPosition = body.translation();
  const finalVel = body.linvel();
  const horizontalSpeed = Math.hypot(finalVel.x, finalVel.z);

  const stateRotation = body.rotation();
  bodyQuaternion.set(stateRotation.x, stateRotation.y, stateRotation.z, stateRotation.w);
  stateForward.set(0, 0, 1).applyQuaternion(bodyQuaternion);
  stateForward.y = 0;
  if (stateForward.lengthSq() < 1e-5) {
    stateForward.set(0, 0, 1);
  } else {
    stateForward.normalize();
  }

  const nextState: PlayerSnapshot = {
    position: { x: finalPosition.x, y: finalPosition.y, z: finalPosition.z },
    forward: { x: stateForward.x, y: stateForward.y, z: stateForward.z },
    look: { x: lookForward.x, y: 0, z: lookForward.z },
    speed: horizontalSpeed,
    grounded,
    isMoving: horizontalSpeed > 0.15,
  };

  playerStatePublishTimerRef.current += delta;
  const shouldPublish =
    playerStatePublishTimerRef.current >= PLAYER_STATE_PUBLISH_INTERVAL ||
    shouldPublishPlayerSnapshot(nextState, lastPublishedPlayerStateRef.current);
  if (shouldPublish) {
    playerStatePublishTimerRef.current = 0;
    lastPublishedPlayerStateRef.current = nextState;
    setPlayerState(nextState);
  }
}

export function updateDashFov(
  camera: PerspectiveCamera,
  isDashing: boolean,
  baseFov: number,
  delta: number,
) {
  const dashFovTarget = isDashing ? baseFov + DASH_CAMERA_KICK : baseFov;
  const fovBlend = 1 - Math.exp(-DASH_FOV_DAMPING * delta);
  const nextFov = MathUtils.lerp(camera.fov, dashFovTarget, fovBlend);
  if (Math.abs(nextFov - camera.fov) > 0.001) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
}
