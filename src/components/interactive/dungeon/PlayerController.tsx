'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Group, Vector3 } from 'three';
import { Suspense } from 'react';
import PlayerCharacter, { type PlayerAnimation } from './PlayerCharacter';
import {
  START_POSITION,
  frameScratch,
} from './player-controller/constants';
import {
  isPerspectiveCamera,
} from './player-controller/helpers';
import {
  tryStartAttack,
  tryStartDash,
  tryStartRoll,
  updateAbilityCooldowns,
} from './player-controller/runtimeAbilities';
import { clampBodyToDungeonBounds } from './player-controller/runtimeBounds';
import { updateGroundRuntime } from './player-controller/runtimeGround';
import { resolveFrameInput, updateFacingBasis } from './player-controller/runtimeInput';
import { resolveJumpVerticalVelocity } from './player-controller/runtimeJump';
import { resolveMotion, wakeBodyForInput } from './player-controller/runtimeMotion';
import { applyActionVelocity } from './player-controller/runtimeVelocity';
import { createEmptyInputState } from './player-controller/types';
import {
  createInitialPlayerSnapshot,
  resolvePlayerAnimation,
} from './player-controller/state';
import { updateMovementAudio } from './player-controller/audioRuntime';
import { publishPlayerStateIfNeeded, updateDashFov } from './player-controller/runtimeCameraState';
import { usePlayerControllerInput } from './player-controller/usePlayerControllerInput';
import { usePlayerControllerAudio } from './player-controller/usePlayerControllerAudio';
import { usePlayerState } from '@/lib/playerState';
import { useSettings } from '@/lib/settings';

const { forward, right, up, moveDir, dashDirection, rotation, bodyQuaternion, stateForward } = frameScratch;

export default function PlayerController({
  bodyRef,
  cameraYawRef,
}: {
  bodyRef?: MutableRefObject<RapierRigidBody | null>;
  cameraYawRef?: MutableRefObject<number>;
}) {
  const internalBodyRef = useRef<RapierRigidBody | null>(null);
  const rigidBodyRef = bodyRef ?? internalBodyRef;
  const { camera } = useThree();
  const { rapier, world } = useRapier();
  const setPlayerState = usePlayerState((state) => state._setPlayerState);
  const masterVolume = useSettings((state) => state.masterVolume);
  const inputRef = useRef(createEmptyInputState());

  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const groundedTimer = useRef(0);
  const jumpBuffer = useRef(Number.POSITIVE_INFINITY);
  const rollTimer = useRef(0);
  const stepTimer = useRef(0);
  const stepIndex = useRef(0);
  const characterRootRef = useRef<Group | null>(null);
  const visualLiftRef = useRef(0);
  const {
    stepAudioRef,
    runningLoopAudioRef,
    jumpAudioRef,
    landAudioRef,
    jumpAudioIndexRef,
    landAudioIndexRef,
  } = usePlayerControllerAudio(masterVolume);
  const wasGroundedRef = useRef(true);
  const airborneTimeRef = useRef(0);
  const maxFallSpeedRef = useRef(0);
  const jumpSoundLockedUntilLandRef = useRef(false);
  const jumpButtonHeldRef = useRef(false);
  const rollButtonHeldRef = useRef(false);
  const attackButtonHeldRef = useRef(false);
  const dashRef = useRef({
    active: false,
    timeLeft: 0,
    speed: 0,
    direction: new Vector3(0, 0, 1),
  });
  const dashCooldownRef = useRef(0);
  const rollCooldownRef = useRef(0);
  const rollDirectionRef = useRef(new Vector3(0, 0, 1));
  const attackTimerRef = useRef(0);
  const attackCooldownRef = useRef(0);
  const attackDirectionRef = useRef(new Vector3(0, 0, 1));
  const dashButtonPrevRef = useRef(false);
  const baseFovRef = useRef(isPerspectiveCamera(camera) ? camera.fov : 50);
  const playerStatePublishTimerRef = useRef(0);
  const lastPublishedPlayerStateRef = useRef(createInitialPlayerSnapshot());

  useEffect(() => {
    if (!isPerspectiveCamera(camera)) return;
    baseFovRef.current = camera.fov;
    return () => {
      camera.fov = baseFovRef.current;
      camera.updateProjectionMatrix();
    };
  }, [camera]);

  usePlayerControllerInput({
    inputRef,
    dashButtonPrevRef,
    dashRef,
    jumpButtonHeldRef,
    rollButtonHeldRef,
    attackButtonHeldRef,
    rollCooldownRef,
    attackTimerRef,
    attackCooldownRef,
    jumpBuffer,
    groundedTimer,
    runningLoopAudioRef,
  });

  useFrame((_, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    const { grounded, linvel, position } = updateGroundRuntime({
      body,
      rapier,
      world,
      delta,
      visualLiftRef,
      characterRootRef,
      wasGroundedRef,
      airborneTimeRef,
      maxFallSpeedRef,
      landAudioRef,
      landAudioIndexRef,
      jumpSoundLockedUntilLandRef,
      groundedTimerRef: groundedTimer,
    });

    updateFacingBasis(camera, cameraYawRef?.current, forward, right);

    const {
      runPressed,
      jumpPressed,
      rollPressed,
      attackPressed,
      jumpJustPressed,
      rollJustPressed,
      attackJustPressed,
      dashJustPressed,
      hasTouchInput,
      hasInput,
    } = resolveFrameInput({
      inputRef,
      dashButtonPrevRef,
      jumpButtonHeldRef,
      rollButtonHeldRef,
      attackButtonHeldRef,
      forward,
      right,
      moveDir,
    });

    wakeBodyForInput(body, hasInput, jumpPressed, dashJustPressed, rollJustPressed, attackJustPressed);

    const { targetX: desiredX, targetZ: desiredZ, smoothX, smoothZ } = resolveMotion({
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
    });

    tryStartDash({
      body,
      rapier,
      world,
      position,
      dashDirection,
      dashJustPressed,
      dashRef,
      dashCooldownRef,
      rollTimerRef: rollTimer,
      attackTimerRef,
    });

    updateAbilityCooldowns(delta, rollCooldownRef, attackCooldownRef);
    tryStartRoll(
      groundedTimer.current,
      rollJustPressed,
      dashRef.current,
      rollTimer,
      rollCooldownRef,
      attackTimerRef,
      rollDirectionRef,
      dashDirection,
      rotation,
      up,
      body,
    );
    tryStartAttack(
      grounded,
      attackJustPressed,
      hasInput,
      dashRef.current,
      rollTimer,
      attackTimerRef,
      attackCooldownRef,
      attackDirectionRef,
      dashDirection,
      forward,
      rotation,
      up,
      body,
    );

    const nextY = resolveJumpVerticalVelocity({
      delta,
      jumpJustPressed,
      jumpBufferRef: jumpBuffer,
      groundedTimerRef: groundedTimer,
      dashRef,
      rollTimerRef: rollTimer,
      attackTimerRef,
      grounded,
      linvelY: linvel.y,
      desiredX,
      desiredZ,
      jumpAudioRef,
      jumpAudioIndexRef,
      jumpSoundLockedUntilLandRef,
    });

    applyActionVelocity({
      body,
      delta,
      grounded,
      hasInput,
      smoothX,
      smoothZ,
      nextY,
      dashRef,
      rollTimerRef: rollTimer,
      rollDirectionRef,
      attackTimerRef,
      attackDirectionRef,
    });

    clampBodyToDungeonBounds(body);

    publishPlayerStateIfNeeded({
      body,
      bodyQuaternion,
      stateForward,
      lookForward: forward,
      grounded,
      delta,
      playerStatePublishTimerRef,
      lastPublishedPlayerStateRef,
      setPlayerState,
    });

    const speed = Math.hypot(smoothX, smoothZ);
    updateMovementAudio({
      grounded,
      speed,
      runPressed,
      isRolling: rollTimer.current > 0,
      isAttacking: attackTimerRef.current > 0,
      isDashing: dashRef.current.active,
      delta,
      masterVolume,
      stepTimerRef: stepTimer,
      stepIndexRef: stepIndex,
      stepAudioRef,
      runningLoopAudioRef,
    });
    jumpButtonHeldRef.current = jumpPressed;
    rollButtonHeldRef.current = rollPressed;
    attackButtonHeldRef.current = attackPressed;
    wasGroundedRef.current = grounded;

    if (isPerspectiveCamera(camera)) {
      updateDashFov(camera, dashRef.current.active, baseFovRef.current, delta);
    }

    const nextAnim: PlayerAnimation = resolvePlayerAnimation(
      grounded,
      speed,
      dashRef.current.active,
      attackTimerRef.current,
      rollTimer.current,
      runPressed,
    );
    if (nextAnim !== animation) setAnimation(nextAnim);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={START_POSITION}
      colliders={false}
      ccd
      enabledRotations={[false, false, false]}
      linearDamping={0.2}
      angularDamping={0.2}
    >
      <CapsuleCollider args={[0.8, 0.35]} position={[0, 1.1, 0]} />
      <group ref={characterRootRef}>
        <Suspense
          fallback={
            <mesh position={[0, 1.1, 0]}>
              <capsuleGeometry args={[0.35, 1.6, 6, 12]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          }
        >
          <PlayerCharacter animation={animation} />
        </Suspense>
      </group>
    </RigidBody>
  );
}
