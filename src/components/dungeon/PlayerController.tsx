'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { MathUtils, Quaternion, Vector3, type Group, type PositionalAudio as PositionalAudioImpl } from 'three';
import PlayerCharacter, { type PlayerAnimation } from '@/components/dungeon/PlayerCharacter';
import { usePlayerState } from '@/lib/playerState';
import { useDungeonInput } from '@/lib/dungeonInput';
import { getNextAnimationState } from '@/components/dungeon/math/animationMath';
import { computeMoveVector } from '@/components/dungeon/math/movementMath';

const WALK_SPEED = 2.4;
const RUN_SPEED = 4.2;
const ACCELERATION = 16;
const FRICTION = 20;
const JUMP_SPEED = 5.2;
const GRAVITY = 14;
// Spawn position: Room A center, Y = capsule half-height (0.8) + radius (0.35) + margin = ~1.5
const START_POSITION: [number, number, number] = [0, 1.5, 0];

// Debug mode - set to true to log movement vectors
const DEBUG_MOVEMENT = false;

const direction = new Vector3();
const targetVelocity = new Vector3();
const rotation = new Quaternion();
const forwardVector = new Vector3();

const FOOTSTEP_INTERVAL = {
  walk: 0.48,
  run: 0.32,
};

const FOOTSTEP_URLS = [
  '/sounds/footsteps/grassy_step.wav',
  '/sounds/footsteps/gravel_step.wav',
];

export default function PlayerController({
  playerRef,
  cameraYawRef,
  bodyRef,
}: {
  playerRef?: RefObject<Group>;
  cameraYawRef?: MutableRefObject<number>;
  bodyRef?: MutableRefObject<RapierRigidBody | null>;
}) {
  const internalRef = useRef<Group>(null);
  const groupRef = playerRef ?? internalRef;
  const internalBodyRef = useRef<RapierRigidBody | null>(null);
  const rigidBodyRef = bodyRef ?? internalBodyRef;
  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const groundedRef = useRef(false);
  const { rapier, world } = useRapier();
  const facingRef = useRef(0);
  const hasFocus = useDungeonInput((state) => state.hasFocus);
  const devErrorTimer = useRef(0);
  const isDev = process.env.NODE_ENV !== 'production';

  const footstepRefs = useRef<PositionalAudioImpl[]>([]);
  const jumpRef = useRef<PositionalAudioImpl | null>(null);
  const landRef = useRef<PositionalAudioImpl | null>(null);
  const footstepTimer = useRef(0);
  const wasGroundedRef = useRef(false);

  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
  });

  const resetInputs = useCallback(() => {
    inputRef.current.forward = false;
    inputRef.current.backward = false;
    inputRef.current.left = false;
    inputRef.current.right = false;
    inputRef.current.run = false;
    inputRef.current.jump = false;
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      if (!hasFocus) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      switch (event.code) {
        case 'KeyW':
          inputRef.current.forward = pressed;
          break;
        case 'KeyS':
          inputRef.current.backward = pressed;
          break;
        case 'KeyA':
          inputRef.current.left = pressed;
          break;
        case 'KeyD':
          inputRef.current.right = pressed;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.run = pressed;
          break;
        case 'Space':
          if (pressed) inputRef.current.jump = true;
          break;
        default:
          break;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => handleKey(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleKey(event, false);
    const handleBlur = () => resetInputs();
    const handlePointerLockChange = () => {
      if (document.pointerLockElement === null) {
        resetInputs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [hasFocus, resetInputs]);

  useEffect(() => {
    if (!hasFocus) {
      resetInputs();
    }
  }, [hasFocus, resetInputs]);

  useFrame((_, delta) => {
    if (isDev) {
      devErrorTimer.current += delta;
    }
    const body = rigidBodyRef.current;
    if (!body) return;

    const position = body.translation();
    if (isDev && (!Number.isFinite(position.x) || !Number.isFinite(position.y) || !Number.isFinite(position.z))) {
      if (devErrorTimer.current > 0.5) {
        console.error('[PlayerController] Non-finite player position detected.', position);
        devErrorTimer.current = 0;
      }
      return;
    }
    const rayOrigin = { x: position.x, y: position.y - 0.2, z: position.z };
    const ray = new rapier.Ray(rayOrigin, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 0.7, true);
    groundedRef.current = Boolean(hit && hit.toi < 0.5);

    if (!wasGroundedRef.current && groundedRef.current) {
      landRef.current?.play();
    }
    wasGroundedRef.current = groundedRef.current;

    const yaw = cameraYawRef?.current ?? 0;
    if (isDev && !Number.isFinite(yaw)) {
      if (devErrorTimer.current > 0.5) {
        console.error('[PlayerController] Non-finite camera yaw detected.', yaw);
        devErrorTimer.current = 0;
      }
      return;
    }
    const moveVector = computeMoveVector(
      {
        forward: inputRef.current.forward,
        backward: inputRef.current.backward,
        left: inputRef.current.left,
        right: inputRef.current.right,
      },
      yaw
    );
    direction.set(moveVector.x, moveVector.y, moveVector.z);

    const inputActive = direction.lengthSq() > 0.001;
    const targetSpeed = inputRef.current.run ? RUN_SPEED : WALK_SPEED;

    if (inputActive) {
      direction.normalize();
      targetVelocity.copy(direction).multiplyScalar(targetSpeed);
    } else {
      targetVelocity.set(0, 0, 0);
    }

    const currentVelocity = body.linvel();
    const accel = inputActive ? ACCELERATION : FRICTION;
    const nextVelocityX = moveToward(currentVelocity.x, targetVelocity.x, accel * delta);
    const nextVelocityZ = moveToward(currentVelocity.z, targetVelocity.z, accel * delta);

    let nextVelocityY = currentVelocity.y;
    if (groundedRef.current) {
      nextVelocityY = Math.max(currentVelocity.y, -1);
      if (inputRef.current.jump) {
        nextVelocityY = JUMP_SPEED;
        groundedRef.current = false;
        jumpRef.current?.play();
      }
    }
    inputRef.current.jump = false;
    nextVelocityY -= GRAVITY * delta;

    if (
      isDev &&
      (!Number.isFinite(nextVelocityX) || !Number.isFinite(nextVelocityY) || !Number.isFinite(nextVelocityZ))
    ) {
      if (devErrorTimer.current > 0.5) {
        console.error('[PlayerController] Non-finite velocity detected.', {
          x: nextVelocityX,
          y: nextVelocityY,
          z: nextVelocityZ,
        });
        devErrorTimer.current = 0;
      }
      return;
    }

    // Wake the body and apply velocity
    body.wakeUp();
    body.setLinvel({ x: nextVelocityX, y: nextVelocityY, z: nextVelocityZ }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    // Debug logging
    if (DEBUG_MOVEMENT && inputActive) {
      console.log('[Movement]', {
        input: { ...inputRef.current },
        direction: direction.toArray(),
        velocity: { x: nextVelocityX, y: nextVelocityY, z: nextVelocityZ },
        position: body.translation(),
        grounded: groundedRef.current,
      });
    }

    const speedOnGround = Math.hypot(nextVelocityX, nextVelocityZ);
    if (inputActive) {
      const desiredYaw = Math.atan2(direction.x, direction.z);
      facingRef.current = lerpAngle(facingRef.current, desiredYaw, 1 - Math.pow(0.001, delta));
    }
    const nextAnimation = getNextAnimationState(animation, {
      inputActive,
      isRunning: inputRef.current.run,
      grounded: groundedRef.current,
      speedOnGround,
    });
    if (nextAnimation !== animation) {
      setAnimation(nextAnimation);
    }

    rotation.setFromAxisAngle(new Vector3(0, 1, 0), facingRef.current);
    body.setRotation(rotation, true);

    if (groundedRef.current && inputActive) {
      footstepTimer.current += delta;
      const interval = inputRef.current.run ? FOOTSTEP_INTERVAL.run : FOOTSTEP_INTERVAL.walk;
      if (footstepTimer.current >= interval) {
        footstepTimer.current = 0;
        const index = Math.floor(Math.random() * footstepRefs.current.length);
        footstepRefs.current[index]?.play();
      }
    } else {
      footstepTimer.current = 0;
    }

    const speed = Math.hypot(nextVelocityX, nextVelocityZ);
    forwardVector.set(0, 0, 1).applyQuaternion(rotation);
    usePlayerState.getState()._setPlayerState({
      position: { x: position.x, y: position.y, z: position.z },
      forward: { x: forwardVector.x, y: forwardVector.y, z: forwardVector.z },
      speed,
      grounded: groundedRef.current,
      isMoving: inputActive && speed > 0.1,
    });
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={START_POSITION}
      colliders={false}
      type="dynamic"
      mass={1}
      enabledRotations={[false, false, false]}
      lockRotations
      gravityScale={0}
      linearDamping={0.5}
      angularDamping={1}
      ccd
    >
      {/* Capsule: half-height=0.8, radius=0.35, total height ~2.3 */}
      <CapsuleCollider args={[0.8, 0.35]} position={[0, 1.15, 0]} />
      <group ref={groupRef}>
        <PlayerCharacter animation={animation} />
        {FOOTSTEP_URLS.map((url, index) => (
          <PositionalAudio
            key={url}
            ref={(audio) => {
              if (audio) footstepRefs.current[index] = audio;
            }}
            url={url}
            distance={6}
            loop={false}
            autoplay={false}
            volume={0.5}
          />
        ))}
        <PositionalAudio
          ref={jumpRef}
          url="/sounds/player/jump.wav"
          distance={8}
          loop={false}
          autoplay={false}
          volume={0.6}
        />
        <PositionalAudio
          ref={landRef}
          url="/sounds/player/jump.wav"
          distance={8}
          loop={false}
          autoplay={false}
          volume={0.6}
        />
      </group>
    </RigidBody>
  );
}

function moveToward(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

function lerpAngle(a: number, b: number, t: number) {
  const delta = MathUtils.euclideanModulo(b - a + Math.PI, Math.PI * 2) - Math.PI;
  return a + delta * t;
}
