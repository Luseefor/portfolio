import { MathUtils, type Quaternion, type Vector3 } from 'three';
import { RUN_SPEED, SMOOTHING, WALK_SPEED } from './constants';

type BodyLike = {
  wakeUp: () => void;
  rotation: () => { x: number; y: number; z: number; w: number };
  setRotation: (rotation: Quaternion, wakeUp: boolean) => void;
  linvel: () => { x: number; y: number; z: number };
};

type ResolveMotionParams = {
  body: BodyLike;
  delta: number;
  runPressed: boolean;
  hasInput: boolean;
  hasTouchInput: boolean;
  moveDir: Vector3;
  dashDirection: Vector3;
  forward: Vector3;
  up: Vector3;
  rotation: Quaternion;
  bodyQuaternion: Quaternion;
};

export function wakeBodyForInput(
  body: BodyLike,
  hasInput: boolean,
  jumpPressed: boolean,
  dashJustPressed: boolean,
  rollJustPressed: boolean,
  attackJustPressed: boolean,
) {
  if (hasInput || jumpPressed || dashJustPressed || rollJustPressed || attackJustPressed) {
    body.wakeUp();
  }
}

export function resolveMotion({
  body,
  delta,
  runPressed,
  hasInput,
  hasTouchInput,
  moveDir,
  dashDirection,
  forward,
  up,
  rotation,
  bodyQuaternion,
}: ResolveMotionParams) {
  const targetSpeed = runPressed ? RUN_SPEED : WALK_SPEED;
  let targetX = 0;
  let targetZ = 0;

  if (hasInput) {
    const inputMagnitude = Math.min(1, moveDir.length());
    dashDirection.copy(moveDir).normalize();
    const speedScale = hasTouchInput ? Math.max(0.2, inputMagnitude) : 1;
    moveDir.copy(dashDirection).multiplyScalar(targetSpeed * speedScale);
    targetX = moveDir.x;
    targetZ = moveDir.z;
    rotation.setFromAxisAngle(up, Math.atan2(moveDir.x, moveDir.z));
    body.setRotation(rotation, true);
  } else {
    const bodyRotation = body.rotation();
    bodyQuaternion.set(bodyRotation.x, bodyRotation.y, bodyRotation.z, bodyRotation.w);
    dashDirection.set(0, 0, 1).applyQuaternion(bodyQuaternion);
    dashDirection.y = 0;
    if (dashDirection.lengthSq() < 1e-4) {
      dashDirection.set(forward.x, 0, forward.z);
    }
    dashDirection.normalize();
  }

  const linvel = body.linvel();
  const smoothing = 1 - Math.exp(-SMOOTHING * delta);
  const smoothX = MathUtils.lerp(linvel.x, targetX, smoothing);
  const smoothZ = MathUtils.lerp(linvel.z, targetZ, smoothing);

  return { targetX, targetZ, smoothX, smoothZ };
}
