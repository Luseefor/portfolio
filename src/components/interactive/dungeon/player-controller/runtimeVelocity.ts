import type { MutableRefObject } from 'react';
import type { Vector3 } from 'three';
import { ATTACK_DURATION, ATTACK_LUNGE_SPEED, ATTACK_LUNGE_WINDOW, ROLL_SPEED } from './constants';

type BodyLike = {
  setLinvel: (value: { x: number; y: number; z: number }, wakeUp: boolean) => void;
  linvel: () => { x: number; y: number; z: number };
};

type DashState = {
  active: boolean;
  timeLeft: number;
  speed: number;
  direction: Vector3;
};

type ApplyVelocityParams = {
  body: BodyLike;
  delta: number;
  grounded: boolean;
  hasInput: boolean;
  smoothX: number;
  smoothZ: number;
  nextY: number;
  dashRef: MutableRefObject<DashState>;
  rollTimerRef: MutableRefObject<number>;
  rollDirectionRef: MutableRefObject<Vector3>;
  attackTimerRef: MutableRefObject<number>;
  attackDirectionRef: MutableRefObject<Vector3>;
};

export function applyActionVelocity({
  body,
  delta,
  grounded,
  hasInput,
  smoothX,
  smoothZ,
  nextY,
  dashRef,
  rollTimerRef,
  rollDirectionRef,
  attackTimerRef,
  attackDirectionRef,
}: ApplyVelocityParams) {
  if (dashRef.current.active) {
    dashRef.current.timeLeft = Math.max(0, dashRef.current.timeLeft - delta);
    body.setLinvel(
      {
        x: dashRef.current.direction.x * dashRef.current.speed,
        y: nextY,
        z: dashRef.current.direction.z * dashRef.current.speed,
      },
      true,
    );
    if (dashRef.current.timeLeft <= 0) {
      dashRef.current.active = false;
    }
  } else if (rollTimerRef.current > 0) {
    const rollVertical = grounded ? Math.max(0, body.linvel().y) : nextY;
    body.setLinvel(
      {
        x: rollDirectionRef.current.x * ROLL_SPEED,
        y: rollVertical,
        z: rollDirectionRef.current.z * ROLL_SPEED,
      },
      true,
    );
  } else if (attackTimerRef.current > 0) {
    const isLungePhase = attackTimerRef.current > ATTACK_DURATION - ATTACK_LUNGE_WINDOW;
    const attackSpeed = isLungePhase ? ATTACK_LUNGE_SPEED : ATTACK_LUNGE_SPEED * 0.18;
    body.setLinvel(
      {
        x: attackDirectionRef.current.x * attackSpeed,
        y: nextY,
        z: attackDirectionRef.current.z * attackSpeed,
      },
      true,
    );
  } else if (!hasInput && Math.abs(smoothX) < 0.02 && Math.abs(smoothZ) < 0.02) {
    body.setLinvel({ x: 0, y: nextY, z: 0 }, true);
  } else {
    body.setLinvel({ x: smoothX, y: nextY, z: smoothZ }, true);
  }

  if (rollTimerRef.current > 0) {
    rollTimerRef.current = Math.max(0, rollTimerRef.current - delta);
  }
  if (attackTimerRef.current > 0) {
    attackTimerRef.current = Math.max(0, attackTimerRef.current - delta);
  }
}
