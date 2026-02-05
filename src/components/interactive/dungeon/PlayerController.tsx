'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import PlayerCharacter from './PlayerCharacter';
import { Suspense } from 'react';
import { useDungeonInput } from '@/lib/dungeonInput';

const WALK_SPEED = 2.6;
const RUN_SPEED = 4.4;
const ACCEL = 14;
const FRICTION = 16;
const JUMP_SPEED = 7.2;
const GRAVITY = 24;
const START_POSITION: [number, number, number] = [0, 2, 0];

const forward = new Vector3();
const right = new Vector3();
const up = new Vector3(0, 1, 0);
const moveDir = new Vector3();

const FOOTSTEP_URLS = [
  '/sounds/footsteps/grassy_step.wav',
  '/sounds/footsteps/gravel_step.wav',
];

export default function PlayerController({
  bodyRef,
}: {
  bodyRef?: MutableRefObject<RapierRigidBody | null>;
}) {
  const internalBodyRef = useRef<RapierRigidBody | null>(null);
  const rigidBodyRef = bodyRef ?? internalBodyRef;
  const { camera } = useThree();
  const { rapier, world } = useRapier();

  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
  });
  const footstepAudio = useRef<HTMLAudioElement[]>([]);
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const mouseDown = useDungeonInput((state) => state.mouseDown);
  const stepTimer = useRef(0);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputRef.current.forward = pressed;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputRef.current.backward = pressed;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          inputRef.current.left = pressed;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputRef.current.right = pressed;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.run = pressed;
          break;
        case 'Space':
          inputRef.current.jump = pressed;
          break;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    const onBlur = () => {
      inputRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
        jump: false,
      };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    if (footstepAudio.current.length === 0) {
      footstepAudio.current = FOOTSTEP_URLS.map((url) => {
        const audio = new Audio(url);
        audio.volume = 0.35;
        return audio;
      });
    }
  }, []);

  useFrame((_, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    const linvel = body.linvel();
    const position = body.translation();

    // Ground check
    const ray = new rapier.Ray({ x: position.x, y: position.y + 0.3, z: position.z }, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 0.8, true);
    const grounded = Boolean(hit && (hit as any).toi < 0.35);

    // Camera-relative movement (fallback to forward if camera isn't ready)
    camera.getWorldDirection(forward);
    if (!Number.isFinite(forward.x) || !Number.isFinite(forward.z)) {
      forward.set(0, 0, 1);
    }
    forward.y = 0;
    if (forward.lengthSq() < 1e-4) {
      forward.set(0, 0, 1);
    }
    forward.normalize();
    right.copy(forward).cross(up).normalize().multiplyScalar(-1);

    moveDir.set(0, 0, 0);
    if (inputRef.current.forward) moveDir.add(forward);
    if (inputRef.current.backward) moveDir.sub(forward);
    if (inputRef.current.left) moveDir.sub(right);
    if (inputRef.current.right) moveDir.add(right);

    const hasInput = moveDir.lengthSq() > 0.001;
    if (hasInput || inputRef.current.jump) {
      body.wakeUp();
    }
    const targetSpeed = inputRef.current.run ? RUN_SPEED : WALK_SPEED;

    let targetX = 0;
    let targetZ = 0;
    if (hasInput) {
      moveDir.normalize().multiplyScalar(targetSpeed);
      targetX = moveDir.x;
      targetZ = moveDir.z;
    }

    const accel = hasInput ? ACCEL : FRICTION;
    const nextX = moveToward(linvel.x, targetX, accel * delta);
    const nextZ = moveToward(linvel.z, targetZ, accel * delta);
    let nextY = linvel.y;
    const wantsJump = inputRef.current.jump && grounded;
    if (wantsJump) {
      nextY = JUMP_SPEED;
    } else if (!grounded) {
      nextY = linvel.y - GRAVITY * delta;
    } else {
      nextY = 0;
    }

    body.setLinvel({ x: nextX, y: nextY, z: nextZ }, true);

    // Footsteps
    if (grounded && hasInput && (isPointerLocked || mouseDown)) {
      stepTimer.current -= delta;
      if (stepTimer.current <= 0) {
        stepTimer.current = inputRef.current.run ? 0.32 : 0.48;
        const idx = Math.floor(Math.random() * footstepAudio.current.length);
        const clip = footstepAudio.current[idx];
        if (clip) {
          clip.currentTime = 0;
          clip.play().catch(() => {});
        }
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={START_POSITION}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={0.2}
      angularDamping={0.2}
      friction={1}
    >
      <CapsuleCollider args={[0.8, 0.35]} position={[0, 1.1, 0]} />
      <group>
        <Suspense
          fallback={
            <mesh position={[0, 1.1, 0]}>
              <capsuleGeometry args={[0.35, 1.6, 6, 12]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          }
        >
          <PlayerCharacter />
        </Suspense>
      </group>
    </RigidBody>
  );
}

function moveToward(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}
