'use client';

import { useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { MathUtils, Quaternion, Vector3, type Group, type PositionalAudio as PositionalAudioImpl } from 'three';
import PlayerCharacter, { type PlayerAnimation } from '@/components/dungeon/PlayerCharacter';
import { usePlayerState } from '@/lib/playerState';

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
const moveForward = new Vector3();
const moveRight = new Vector3();
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
}: {
  playerRef?: RefObject<Group>;
  cameraYawRef?: MutableRefObject<number>;
}) {
  const internalRef = useRef<Group>(null);
  const groupRef = playerRef ?? internalRef;
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const groundedRef = useRef(false);
  const { rapier, world } = useRapier();
  const facingRef = useRef(0);

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

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
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

    const resetInputs = () => {
      inputRef.current.forward = false;
      inputRef.current.backward = false;
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.run = false;
      inputRef.current.jump = false;
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
  }, []);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const position = body.translation();
    const rayOrigin = { x: position.x, y: position.y - 0.2, z: position.z };
    const ray = new rapier.Ray(rayOrigin, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 0.7, true);
    groundedRef.current = Boolean(hit && hit.toi < 0.5);

    if (!wasGroundedRef.current && groundedRef.current) {
      landRef.current?.play();
    }
    wasGroundedRef.current = groundedRef.current;

    const yaw = cameraYawRef?.current ?? 0;
    moveForward.set(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
    moveRight.set(moveForward.z, 0, -moveForward.x).normalize();

    direction.set(0, 0, 0);
    if (inputRef.current.forward) direction.add(moveForward);
    if (inputRef.current.backward) direction.sub(moveForward);
    if (inputRef.current.left) direction.sub(moveRight);
    if (inputRef.current.right) direction.add(moveRight);

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

    if (inputActive) {
      const desiredYaw = Math.atan2(direction.x, direction.z);
      facingRef.current = lerpAngle(facingRef.current, desiredYaw, 1 - Math.pow(0.001, delta));
      setAnimation(inputRef.current.run ? 'run' : 'walk');
    } else {
      const speedOnGround = Math.hypot(nextVelocityX, nextVelocityZ);
      if (groundedRef.current && speedOnGround < 0.15) {
        setAnimation('idle');
      }
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
      ref={bodyRef}
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
