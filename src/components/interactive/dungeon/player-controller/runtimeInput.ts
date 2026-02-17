import type { MutableRefObject } from 'react';
import type { Camera, Vector3 } from 'three';
import { useDungeonInput } from '@/lib/dungeonInput';
import { MOVE_AXIS_DEADZONE, MOVE_AXIS_RUN_THRESHOLD } from './constants';
import type { PlayerInputState } from './types';

type ResolveFrameInputParams = {
  inputRef: MutableRefObject<PlayerInputState>;
  dashButtonPrevRef: MutableRefObject<boolean>;
  jumpButtonHeldRef: MutableRefObject<boolean>;
  rollButtonHeldRef: MutableRefObject<boolean>;
  attackButtonHeldRef: MutableRefObject<boolean>;
  forward: Vector3;
  right: Vector3;
  moveDir: Vector3;
};

export type ResolvedFrameInput = {
  runPressed: boolean;
  dashPressed: boolean;
  jumpPressed: boolean;
  rollPressed: boolean;
  attackPressed: boolean;
  jumpJustPressed: boolean;
  rollJustPressed: boolean;
  attackJustPressed: boolean;
  dashJustPressed: boolean;
  hasTouchInput: boolean;
  hasInput: boolean;
};

export function updateFacingBasis(
  camera: Camera,
  cameraYawValue: number | undefined,
  forward: Vector3,
  right: Vector3,
) {
  if (Number.isFinite(cameraYawValue)) {
    const safeYaw = cameraYawValue as number;
    forward.set(Math.sin(safeYaw), 0, Math.cos(safeYaw));
  } else {
    camera.getWorldDirection(forward);
    forward.y = 0;
  }

  if (forward.lengthSq() < 1e-4) forward.set(0, 0, 1);
  forward.normalize();
  right.set(forward.z, 0, -forward.x).normalize();
}

export function resolveFrameInput({
  inputRef,
  dashButtonPrevRef,
  jumpButtonHeldRef,
  rollButtonHeldRef,
  attackButtonHeldRef,
  forward,
  right,
  moveDir,
}: ResolveFrameInputParams): ResolvedFrameInput {
  const inputState = useDungeonInput.getState();
  const keys = inputState.keys;
  const moveAxis = inputState.moveAxis;

  const forwardPressed = keys.forward || inputRef.current.forward;
  const backwardPressed = keys.backward || inputRef.current.backward;
  const leftPressed = keys.left || inputRef.current.left;
  const rightPressed = keys.right || inputRef.current.right;

  const touchAxisX = Math.abs(moveAxis.x) > MOVE_AXIS_DEADZONE ? moveAxis.x : 0;
  const touchAxisY = Math.abs(moveAxis.y) > MOVE_AXIS_DEADZONE ? moveAxis.y : 0;
  const touchAxisMagnitude = Math.min(1, Math.hypot(touchAxisX, touchAxisY));
  const hasTouchInput = touchAxisMagnitude > 0.001;

  const runPressed = keys.run || inputRef.current.run || touchAxisMagnitude >= MOVE_AXIS_RUN_THRESHOLD;
  const dashPressed = keys.dash || inputRef.current.dash;
  const jumpPressed = keys.jump || inputRef.current.jump;
  const rollPressed = keys.roll || inputRef.current.roll;
  const attackPressed = keys.attack || inputRef.current.attack;

  const jumpJustPressed = jumpPressed && !jumpButtonHeldRef.current;
  const rollJustPressed = rollPressed && !rollButtonHeldRef.current;
  const attackJustPressed = attackPressed && !attackButtonHeldRef.current;

  moveDir.set(0, 0, 0);
  if (forwardPressed) moveDir.add(forward);
  if (backwardPressed) moveDir.sub(forward);
  if (leftPressed) moveDir.sub(right);
  if (rightPressed) moveDir.add(right);
  if (touchAxisY !== 0) moveDir.addScaledVector(forward, touchAxisY);
  if (touchAxisX !== 0) moveDir.addScaledVector(right, touchAxisX);

  const hasInput = moveDir.lengthSq() > 0.001;
  const dashJustPressed = dashPressed && !dashButtonPrevRef.current;
  dashButtonPrevRef.current = dashPressed;

  return {
    runPressed,
    dashPressed,
    jumpPressed,
    rollPressed,
    attackPressed,
    jumpJustPressed,
    rollJustPressed,
    attackJustPressed,
    dashJustPressed,
    hasTouchInput,
    hasInput,
  };
}
