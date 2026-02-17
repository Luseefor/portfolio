import type { MutableRefObject } from 'react';
import type { Quaternion, Vector3 } from 'three';
import {
  ATTACK_COOLDOWN,
  ATTACK_DURATION,
  COYOTE_TIME,
  DASH_COLLISION_OFFSET,
  DASH_COOLDOWN,
  DASH_DURATION,
  DASH_MAX_DISTANCE,
  DASH_MIN_DISTANCE,
  DASH_RAY_BUFFER,
  ROLL_COOLDOWN,
  ROLL_DURATION,
} from './constants';
import type { DashRuntimeState } from './types';

type BodyLike = {
  setRotation: (rotation: Quaternion, wakeUp: boolean) => void;
};

type RayHit = { timeOfImpact: number };
type RayCasterWorld = { castRay: (...args: unknown[]) => RayHit | null };
type RapierApi = {
  Ray: new (origin: { x: number; y: number; z: number }, direction: { x: number; y: number; z: number }) => unknown;
};

type StartDashParams = {
  body: BodyLike;
  rapier: RapierApi;
  world: RayCasterWorld;
  position: { x: number; y: number; z: number };
  dashDirection: Vector3;
  dashJustPressed: boolean;
  dashRef: MutableRefObject<DashRuntimeState>;
  dashCooldownRef: MutableRefObject<number>;
  rollTimerRef: MutableRefObject<number>;
  attackTimerRef: MutableRefObject<number>;
};

export function updateAbilityCooldowns(
  delta: number,
  rollCooldownRef: MutableRefObject<number>,
  attackCooldownRef: MutableRefObject<number>,
) {
  if (rollCooldownRef.current > 0) rollCooldownRef.current = Math.max(0, rollCooldownRef.current - delta);
  if (attackCooldownRef.current > 0) attackCooldownRef.current = Math.max(0, attackCooldownRef.current - delta);
}

export function tryStartDash({
  body,
  rapier,
  world,
  position,
  dashDirection,
  dashJustPressed,
  dashRef,
  dashCooldownRef,
  rollTimerRef,
  attackTimerRef,
}: StartDashParams) {
  const now = performance.now() / 1000;
  if (!dashJustPressed || dashRef.current.active || now < dashCooldownRef.current || rollTimerRef.current > 0 || attackTimerRef.current > 0) {
    return;
  }

  const ray = new rapier.Ray(
    { x: position.x, y: position.y + 1, z: position.z },
    { x: dashDirection.x, y: 0, z: dashDirection.z },
  );
  const hit = world.castRay(ray, DASH_MAX_DISTANCE + DASH_RAY_BUFFER, true, undefined, undefined, undefined, body);
  let allowedDistance = DASH_MAX_DISTANCE;
  if (hit && Number.isFinite(hit.timeOfImpact)) {
    allowedDistance = Math.max(DASH_MIN_DISTANCE, hit.timeOfImpact - DASH_COLLISION_OFFSET);
  }

  dashRef.current.active = true;
  dashRef.current.timeLeft = DASH_DURATION;
  dashRef.current.speed = allowedDistance / DASH_DURATION;
  dashRef.current.direction.copy(dashDirection);
  dashCooldownRef.current = now + DASH_COOLDOWN;
}

export function tryStartRoll(
  groundedTimer: number,
  rollJustPressed: boolean,
  dashRef: DashRuntimeState,
  rollTimerRef: MutableRefObject<number>,
  rollCooldownRef: MutableRefObject<number>,
  attackTimerRef: MutableRefObject<number>,
  rollDirectionRef: MutableRefObject<Vector3>,
  dashDirection: Vector3,
  rotation: Quaternion,
  up: Vector3,
  body: BodyLike,
) {
  if (
    groundedTimer > COYOTE_TIME ||
    !rollJustPressed ||
    dashRef.active ||
    rollTimerRef.current > 0 ||
    rollCooldownRef.current > 0 ||
    attackTimerRef.current > 0
  ) {
    return;
  }
  rollTimerRef.current = ROLL_DURATION;
  rollCooldownRef.current = ROLL_COOLDOWN;
  rollDirectionRef.current.copy(dashDirection);
  rotation.setFromAxisAngle(up, Math.atan2(rollDirectionRef.current.x, rollDirectionRef.current.z));
  body.setRotation(rotation, true);
}

export function tryStartAttack(
  grounded: boolean,
  attackJustPressed: boolean,
  hasInput: boolean,
  dashRef: DashRuntimeState,
  rollTimerRef: MutableRefObject<number>,
  attackTimerRef: MutableRefObject<number>,
  attackCooldownRef: MutableRefObject<number>,
  attackDirectionRef: MutableRefObject<Vector3>,
  dashDirection: Vector3,
  forward: Vector3,
  rotation: Quaternion,
  up: Vector3,
  body: BodyLike,
) {
  if (!grounded || !attackJustPressed || dashRef.active || rollTimerRef.current > 0 || attackTimerRef.current > 0 || attackCooldownRef.current > 0) {
    return;
  }
  attackTimerRef.current = ATTACK_DURATION;
  attackCooldownRef.current = ATTACK_COOLDOWN;
  attackDirectionRef.current.copy(hasInput ? dashDirection : forward);
  rotation.setFromAxisAngle(up, Math.atan2(attackDirectionRef.current.x, attackDirectionRef.current.z));
  body.setRotation(rotation, true);
}
