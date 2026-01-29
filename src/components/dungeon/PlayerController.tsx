'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Quaternion, Vector3, type Group, type PositionalAudio as PositionalAudioImpl } from 'three';
import PlayerCharacter, { type PlayerAnimation } from '@/components/dungeon/PlayerCharacter';
import { usePlayerState } from '@/lib/playerState';

const WALK_SPEED = 2.4;
const RUN_SPEED = 4.2;
const ACCELERATION = 18;
const FRICTION = 14;
const JUMP_SPEED = 5.2;
const GRAVITY = 14;
const START_POSITION: [number, number, number] = [0, -1.5, 0];

const direction = new Vector3();
const targetVelocity = new Vector3();
const rotation = new Quaternion();
const forwardVector = new Vector3();

const FOOTSTEP_INTERVAL = {
  walk: 0.48,
  run: 0.32,
};

const FOOTSTEP_URLS = [
  '/sounds/footsteps/footstep_1.wav',
  '/sounds/footsteps/footstep_2.wav',
  '/sounds/footsteps/footstep_3.wav',
];

export default function PlayerController({
  playerRef,
}: {
  playerRef?: RefObject<Group>;
}) {
  const internalRef = useRef<Group>(null);
  const groupRef = playerRef ?? internalRef;
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const groundedRef = useRef(false);
  const { rapier, world } = useRapier();
  const yawRef = useRef(0);

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

    const handleKeyDown = (event: KeyboardEvent) => handleKey(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleKey(event, false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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

    direction.set(0, 0, 0);
    if (inputRef.current.forward) direction.z -= 1;
    if (inputRef.current.backward) direction.z += 1;
    if (inputRef.current.left) direction.x -= 1;
    if (inputRef.current.right) direction.x += 1;

    const isMoving = direction.lengthSq() > 0;
    const targetSpeed = inputRef.current.run ? RUN_SPEED : WALK_SPEED;

    if (isMoving) {
      direction.normalize();
      targetVelocity.copy(direction).multiplyScalar(targetSpeed);
    } else {
      targetVelocity.set(0, 0, 0);
    }

    const currentVelocity = body.linvel();
    const nextVelocityX = moveToward(currentVelocity.x, targetVelocity.x, ACCELERATION * delta);
    const nextVelocityZ = moveToward(currentVelocity.z, targetVelocity.z, ACCELERATION * delta);

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

    body.setLinvel({ x: nextVelocityX, y: nextVelocityY, z: nextVelocityZ }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    if (isMoving) {
      yawRef.current = Math.atan2(nextVelocityX, nextVelocityZ);
      const targetAnimation = inputRef.current.run ? 'run' : 'walk';
      setAnimation(targetAnimation);
    } else if (groundedRef.current) {
      setAnimation('idle');
    }

    rotation.setFromAxisAngle(new Vector3(0, 1, 0), yawRef.current);
    body.setRotation(rotation, true);

    if (groundedRef.current && isMoving) {
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
    usePlayerState.getState().setPlayerState({
      position: { x: position.x, y: position.y, z: position.z },
      forward: { x: forwardVector.x, y: forwardVector.y, z: forwardVector.z },
      speed,
      grounded: groundedRef.current,
      isMoving: isMoving && speed > 0.1,
    });
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={START_POSITION}
      colliders={false}
      enabledRotations={[false, true, false]}
      gravityScale={0}
      linearDamping={1.4}
      angularDamping={1.2}
    >
      <CapsuleCollider args={[0.8, 0.35]} />
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
          url="/sounds/player/land.wav"
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
