import { useFrame } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import type { MutableRefObject } from 'react';
import type { Camera } from 'three';
import {
  tryStartAttack,
  tryStartDash,
  tryStartRoll,
  updateAbilityCooldowns,
} from './runtimeAbilities';
import { updateMovementAudio } from './audioRuntime';
import { clampBodyToDungeonBounds } from './runtimeBounds';
import { publishPlayerStateIfNeeded, updateDashFov } from './runtimeCameraState';
import { updateGroundRuntime } from './runtimeGround';
import { resolveFrameInput, updateFacingBasis } from './runtimeInput';
import { resolveJumpVerticalVelocity } from './runtimeJump';
import { resolveMotion, wakeBodyForInput } from './runtimeMotion';
import { applyActionVelocity } from './runtimeVelocity';
import { isPerspectiveCamera } from './helpers';
import { resolvePlayerAnimation } from './state';
import { frameScratch } from './constants';
import { usePlayerControllerRuntimeState } from './usePlayerControllerRuntimeState';

const { forward, right, up, moveDir, dashDirection, rotation, bodyQuaternion, stateForward } = frameScratch;

type UsePlayerControllerFrameParams = {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  camera: Camera;
  cameraYawRef?: MutableRefObject<number>;
  rapier: { Ray: new (origin: { x: number; y: number; z: number }, direction: { x: number; y: number; z: number }) => unknown };
  world: { castRay: (...args: unknown[]) => { timeOfImpact: number } | null };
  masterVolume: number;
  setPlayerState: (state: ReturnType<typeof usePlayerControllerRuntimeState>['lastPublishedPlayerStateRef']['current']) => void;
  runtime: ReturnType<typeof usePlayerControllerRuntimeState>;
};

export function usePlayerControllerFrame({
  rigidBodyRef,
  camera,
  cameraYawRef,
  rapier,
  world,
  masterVolume,
  setPlayerState,
  runtime,
}: UsePlayerControllerFrameParams) {
  useFrame((_, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    const { grounded, linvel, position } = updateGroundRuntime({
      body, rapier, world, delta, visualLiftRef: runtime.visualLiftRef, characterRootRef: runtime.characterRootRef,
      wasGroundedRef: runtime.wasGroundedRef, airborneTimeRef: runtime.airborneTimeRef, maxFallSpeedRef: runtime.maxFallSpeedRef,
      landAudioRef: runtime.landAudioRef, landAudioIndexRef: runtime.landAudioIndexRef, jumpSoundLockedUntilLandRef: runtime.jumpSoundLockedUntilLandRef,
      groundedTimerRef: runtime.groundedTimer,
    });

    updateFacingBasis(camera, cameraYawRef?.current, forward, right);
    const input = resolveFrameInput({
      inputRef: runtime.inputRef, dashButtonPrevRef: runtime.dashButtonPrevRef,
      jumpButtonHeldRef: runtime.jumpButtonHeldRef, rollButtonHeldRef: runtime.rollButtonHeldRef, attackButtonHeldRef: runtime.attackButtonHeldRef,
      forward, right, moveDir,
    });
    wakeBodyForInput(body, input.hasInput, input.jumpPressed, input.dashJustPressed, input.rollJustPressed, input.attackJustPressed);

    const motion = resolveMotion({
      body, delta, runPressed: input.runPressed, hasInput: input.hasInput, hasTouchInput: input.hasTouchInput,
      moveDir, dashDirection, forward, up, rotation, bodyQuaternion,
    });

    tryStartDash({
      body, rapier, world, position, dashDirection, dashJustPressed: input.dashJustPressed, dashRef: runtime.dashRef,
      dashCooldownRef: runtime.dashCooldownRef, rollTimerRef: runtime.rollTimer, attackTimerRef: runtime.attackTimerRef,
    });
    updateAbilityCooldowns(delta, runtime.rollCooldownRef, runtime.attackCooldownRef);
    tryStartRoll(runtime.groundedTimer.current, input.rollJustPressed, runtime.dashRef.current, runtime.rollTimer, runtime.rollCooldownRef, runtime.attackTimerRef, runtime.rollDirectionRef, dashDirection, rotation, up, body);
    tryStartAttack(grounded, input.attackJustPressed, input.hasInput, runtime.dashRef.current, runtime.rollTimer, runtime.attackTimerRef, runtime.attackCooldownRef, runtime.attackDirectionRef, dashDirection, forward, rotation, up, body);

    const nextY = resolveJumpVerticalVelocity({
      delta, jumpJustPressed: input.jumpJustPressed, jumpBufferRef: runtime.jumpBuffer, groundedTimerRef: runtime.groundedTimer,
      dashRef: runtime.dashRef, rollTimerRef: runtime.rollTimer, attackTimerRef: runtime.attackTimerRef, grounded, linvelY: linvel.y,
      desiredX: motion.targetX, desiredZ: motion.targetZ, jumpAudioRef: runtime.jumpAudioRef, jumpAudioIndexRef: runtime.jumpAudioIndexRef,
      jumpSoundLockedUntilLandRef: runtime.jumpSoundLockedUntilLandRef,
    });

    applyActionVelocity({
      body, delta, grounded, hasInput: input.hasInput, smoothX: motion.smoothX, smoothZ: motion.smoothZ, nextY,
      dashRef: runtime.dashRef, rollTimerRef: runtime.rollTimer, rollDirectionRef: runtime.rollDirectionRef,
      attackTimerRef: runtime.attackTimerRef, attackDirectionRef: runtime.attackDirectionRef,
    });

    clampBodyToDungeonBounds(body);
    publishPlayerStateIfNeeded({
      body, bodyQuaternion, stateForward, lookForward: forward, grounded, delta,
      playerStatePublishTimerRef: runtime.playerStatePublishTimerRef, lastPublishedPlayerStateRef: runtime.lastPublishedPlayerStateRef, setPlayerState,
    });

    const speed = Math.hypot(motion.smoothX, motion.smoothZ);
    updateMovementAudio({
      grounded, speed, runPressed: input.runPressed, isRolling: runtime.rollTimer.current > 0, isAttacking: runtime.attackTimerRef.current > 0,
      isDashing: runtime.dashRef.current.active, delta, masterVolume, stepTimerRef: runtime.stepTimer, stepIndexRef: runtime.stepIndex,
      stepAudioRef: runtime.stepAudioRef, runningLoopAudioRef: runtime.runningLoopAudioRef,
    });

    runtime.jumpButtonHeldRef.current = input.jumpPressed;
    runtime.rollButtonHeldRef.current = input.rollPressed;
    runtime.attackButtonHeldRef.current = input.attackPressed;
    runtime.wasGroundedRef.current = grounded;
    if (isPerspectiveCamera(camera)) updateDashFov(camera, runtime.dashRef.current.active, runtime.baseFovRef.current, delta);

    const nextAnim = resolvePlayerAnimation(grounded, speed, runtime.dashRef.current.active, runtime.attackTimerRef.current, runtime.rollTimer.current, input.runPressed);
    if (nextAnim !== runtime.animation) runtime.setAnimation(nextAnim);
  });
}
