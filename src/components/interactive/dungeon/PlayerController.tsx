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
  ATTACK_LUNGE_SPEED,
  ATTACK_LUNGE_WINDOW,
  COYOTE_TIME,
  DASH_CAMERA_KICK,
  DASH_COLLISION_OFFSET,
  DASH_COOLDOWN,
  DASH_DURATION,
  DASH_FOV_DAMPING,
  DASH_MAX_DISTANCE,
  DASH_MIN_DISTANCE,
  DASH_RAY_BUFFER,
  GRAVITY,
  GROUND_RAY_LENGTH,
  GROUND_RAY_ORIGIN_OFFSET,
  JUMP_BUFFER_TIME,
  JUMP_SPEED,
  MAX_GROUNDED_UP_VELOCITY,
  MIN_LAND_AIRBORNE_TIME,
  MIN_LAND_IMPACT_SPEED,
  MOVE_AXIS_DEADZONE,
  MOVE_AXIS_RUN_THRESHOLD,
  PLAYER_LIFT_DOWN_SMOOTHING,
  PLAYER_LIFT_UP_SMOOTHING,
  PLAYER_STATE_PUBLISH_INTERVAL,
  ROLL_COOLDOWN,
  ROLL_DURATION,
  ROLL_SPEED,
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
import { createEmptyInputState } from './player-controller/types';
import {
  createInitialPlayerSnapshot,
  resolvePlayerAnimation,
  shouldPublishPlayerSnapshot,
} from './player-controller/state';
import { updateMovementAudio } from './player-controller/audioRuntime';
import { usePlayerControllerInput } from './player-controller/usePlayerControllerInput';
import { usePlayerControllerAudio } from './player-controller/usePlayerControllerAudio';
import { useDungeonInput } from '@/lib/dungeonInput';
import { usePlayerState } from '@/lib/playerState';
import { useSettings } from '@/lib/settings';
import { getDungeonVisualLiftAt } from '@/lib/dungeonVisualLift';

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

    const position = body.translation();
    const linvel = body.linvel();

    const groundRay = new rapier.Ray(
      {
        x: position.x,
        y: position.y + GROUND_RAY_ORIGIN_OFFSET,
        z: position.z,
      },
      { x: 0, y: -1, z: 0 },
    );
    const groundHit = world.castRay(
      groundRay,
      GROUND_RAY_LENGTH,
      true,
      undefined,
      undefined,
      undefined,
      body,
    );
    const grounded =
      Boolean(groundHit && Number.isFinite(groundHit.timeOfImpact)) && linvel.y <= MAX_GROUNDED_UP_VELOCITY;

    const targetVisualLift = grounded ? getDungeonVisualLiftAt(position.x, position.z) : 0;
    const liftSmoothing =
      targetVisualLift >= visualLiftRef.current ? PLAYER_LIFT_UP_SMOOTHING : PLAYER_LIFT_DOWN_SMOOTHING;
    const liftLerp = 1 - Math.exp(-liftSmoothing * delta);
    visualLiftRef.current = MathUtils.lerp(visualLiftRef.current, targetVisualLift, liftLerp);
    if (characterRootRef.current) {
      characterRootRef.current.position.y = visualLiftRef.current;
    }
    if (!grounded) {
      airborneTimeRef.current += delta;
      maxFallSpeedRef.current = Math.max(maxFallSpeedRef.current, -linvel.y);
    } else if (!wasGroundedRef.current) {
      const hasMeaningfulImpact =
        maxFallSpeedRef.current >= MIN_LAND_IMPACT_SPEED ||
        airborneTimeRef.current >= MIN_LAND_AIRBORNE_TIME;
      if (hasMeaningfulImpact && landAudioRef.current.length > 0) {
        const landAudio = landAudioRef.current[landAudioIndexRef.current % landAudioRef.current.length];
        landAudioIndexRef.current += 1;
        landAudio.currentTime = 0;
        landAudio.playbackRate = 0.97 + Math.random() * 0.06;
        landAudio.play().catch(() => { });
        jumpSoundLockedUntilLandRef.current = false;
      }
      airborneTimeRef.current = 0;
      maxFallSpeedRef.current = 0;
    } else {
      airborneTimeRef.current = 0;
      maxFallSpeedRef.current = 0;
    }
    if (grounded) groundedTimer.current = 0;
    else groundedTimer.current += delta;

    const cameraYaw = cameraYawRef?.current;
    if (Number.isFinite(cameraYaw)) {
      const safeYaw = cameraYaw as number;
      forward.set(Math.sin(safeYaw), 0, Math.cos(safeYaw));
    } else {
      camera.getWorldDirection(forward);
      forward.y = 0;
    }
    if (forward.lengthSq() < 1e-4) forward.set(0, 0, 1);
    forward.normalize();
    right.set(forward.z, 0, -forward.x).normalize();

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
    } else if (rollTimer.current > 0) {
      const rollVertical = grounded ? Math.max(0, linvel.y) : nextY;
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

    if (rollTimer.current > 0) {
      rollTimer.current = Math.max(0, rollTimer.current - delta);
    }
    if (attackTimerRef.current > 0) {
      attackTimerRef.current = Math.max(0, attackTimerRef.current - delta);
    }

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
    const isMovingState = horizontalSpeed > 0.15;
    const nextState = {
      position: { x: finalPosition.x, y: finalPosition.y, z: finalPosition.z },
      forward: { x: stateForward.x, y: stateForward.y, z: stateForward.z },
      look: { x: forward.x, y: 0, z: forward.z },
      speed: horizontalSpeed,
      grounded,
      isMoving: isMovingState,
    };
    const lastState = lastPublishedPlayerStateRef.current;

    playerStatePublishTimerRef.current += delta;
    const shouldPublish =
      playerStatePublishTimerRef.current >= PLAYER_STATE_PUBLISH_INTERVAL ||
      shouldPublishPlayerSnapshot(nextState, lastState);

    if (shouldPublish) {
      playerStatePublishTimerRef.current = 0;
      lastPublishedPlayerStateRef.current = nextState;
      setPlayerState(nextState);
    }

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
      const dashFovTarget = dashRef.current.active ? baseFovRef.current + DASH_CAMERA_KICK : baseFovRef.current;
      const fovBlend = 1 - Math.exp(-DASH_FOV_DAMPING * delta);
      const nextFov = MathUtils.lerp(camera.fov, dashFovTarget, fovBlend);
      if (Math.abs(nextFov - camera.fov) > 0.001) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
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
