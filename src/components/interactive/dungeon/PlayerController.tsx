'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Group, MathUtils, Vector3 } from 'three';
import { Suspense } from 'react';
import PlayerCharacter, { type PlayerAnimation } from './PlayerCharacter';
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
  GRAVITY,
  JUMP_BUFFER_TIME,
  JUMP_SPEED,
  ROLL_COOLDOWN,
  ROLL_DURATION,
  RUN_SPEED,
  SMOOTHING,
  START_POSITION,
  WALK_SPEED,
  frameScratch,
} from './player-controller/constants';
import {
  clampPlayerX,
  clampPlayerZ,
  isPerspectiveCamera,
} from './player-controller/helpers';
import { updateGroundRuntime } from './player-controller/runtimeGround';
import { resolveFrameInput, updateFacingBasis } from './player-controller/runtimeInput';
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

    if (hasInput || jumpPressed || dashJustPressed || rollJustPressed || attackJustPressed) {
      body.wakeUp();
    }

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
      const desiredYaw = Math.atan2(moveDir.x, moveDir.z);
      rotation.setFromAxisAngle(up, desiredYaw);
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

    const now = performance.now() / 1000;
    if (
      dashJustPressed &&
      !dashRef.current.active &&
      now >= dashCooldownRef.current &&
      rollTimer.current <= 0 &&
      attackTimerRef.current <= 0
    ) {
      const ray = new rapier.Ray(
        {
          x: position.x,
          y: position.y + 1,
          z: position.z,
        },
        {
          x: dashDirection.x,
          y: 0,
          z: dashDirection.z,
        },
      );
      const hit = world.castRay(
        ray,
        DASH_MAX_DISTANCE + DASH_RAY_BUFFER,
        true,
        undefined,
        undefined,
        undefined,
        body,
      );

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

    if (rollCooldownRef.current > 0) {
      rollCooldownRef.current = Math.max(0, rollCooldownRef.current - delta);
    }
    if (attackCooldownRef.current > 0) {
      attackCooldownRef.current = Math.max(0, attackCooldownRef.current - delta);
    }

    if (
      groundedTimer.current <= COYOTE_TIME &&
      rollJustPressed &&
      !dashRef.current.active &&
      rollTimer.current <= 0 &&
      rollCooldownRef.current <= 0 &&
      attackTimerRef.current <= 0
    ) {
      rollTimer.current = ROLL_DURATION;
      rollCooldownRef.current = ROLL_COOLDOWN;
      rollDirectionRef.current.copy(dashDirection);
      const rollYaw = Math.atan2(rollDirectionRef.current.x, rollDirectionRef.current.z);
      rotation.setFromAxisAngle(up, rollYaw);
      body.setRotation(rotation, true);
    }

    if (
      grounded &&
      attackJustPressed &&
      !dashRef.current.active &&
      rollTimer.current <= 0 &&
      attackTimerRef.current <= 0 &&
      attackCooldownRef.current <= 0
    ) {
      attackTimerRef.current = ATTACK_DURATION;
      attackCooldownRef.current = ATTACK_COOLDOWN;
      attackDirectionRef.current.copy(hasInput ? dashDirection : forward);
      const attackYaw = Math.atan2(attackDirectionRef.current.x, attackDirectionRef.current.z);
      rotation.setFromAxisAngle(up, attackYaw);
      body.setRotation(rotation, true);
    }

    const desiredX = targetX;
    const desiredZ = targetZ;
    const smoothing = 1 - Math.exp(-SMOOTHING * delta);
    const smoothX = MathUtils.lerp(linvel.x, desiredX, smoothing);
    const smoothZ = MathUtils.lerp(linvel.z, desiredZ, smoothing);

    if (jumpJustPressed) {
      jumpBuffer.current = 0;
    } else if (Number.isFinite(jumpBuffer.current)) {
      jumpBuffer.current += delta;
    }
    const canJump =
      jumpBuffer.current <= JUMP_BUFFER_TIME &&
      groundedTimer.current <= COYOTE_TIME &&
      !dashRef.current.active &&
      rollTimer.current <= 0 &&
      attackTimerRef.current <= 0;
    let nextY = linvel.y - GRAVITY * delta;
    if (canJump) {
      const horizontalIntentSpeed = Math.hypot(desiredX, desiredZ);
      const jumpBoost = MathUtils.clamp(1 + (horizontalIntentSpeed / RUN_SPEED) * 0.08, 1, 1.1);
      nextY = JUMP_SPEED * jumpBoost;
      if (jumpAudioRef.current.length > 0 && jumpJustPressed && !jumpSoundLockedUntilLandRef.current) {
        const jumpAudio = jumpAudioRef.current[jumpAudioIndexRef.current % jumpAudioRef.current.length];
        jumpAudioIndexRef.current += 1;
        jumpAudio.currentTime = 0;
        jumpAudio.playbackRate = 0.98 + Math.random() * 0.05;
        jumpAudio.play().catch(() => { });
        jumpSoundLockedUntilLandRef.current = true;
      }
      jumpBuffer.current = Number.POSITIVE_INFINITY;
      groundedTimer.current = COYOTE_TIME + 1;
    } else if (grounded) {
      nextY = 0;
    }

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

    // Hard physics border: player body cannot leave dungeon map bounds.
    const postStep = body.translation();
    const clampedX = clampPlayerX(postStep.x);
    const clampedZ = clampPlayerZ(postStep.z);
    if (Math.abs(clampedX - postStep.x) > 0.001 || Math.abs(clampedZ - postStep.z) > 0.001) {
      body.setTranslation({ x: clampedX, y: postStep.y, z: clampedZ }, true);
      const currentVel = body.linvel();
      body.setLinvel(
        {
          x: clampedX !== postStep.x ? 0 : currentVel.x,
          y: currentVel.y,
          z: clampedZ !== postStep.z ? 0 : currentVel.z,
        },
        true,
      );
    }

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
