'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { MathUtils, Quaternion, Vector3 } from 'three';
import { Suspense } from 'react';
import PlayerCharacter, { type PlayerAnimation } from './PlayerCharacter';
import { useDungeonInput } from '@/lib/dungeonInput';

const WALK_SPEED = 2.6;
const RUN_SPEED = 4.6;
const ACCEL = 12;
const DECEL = 14;
const JUMP_SPEED = 7.2;
const GRAVITY = 24;
const START_POSITION: [number, number, number] = [0, 2, 0];

const forward = new Vector3();
const right = new Vector3();
const up = new Vector3(0, 1, 0);
const moveDir = new Vector3();
const rotation = new Quaternion();

export default function PlayerController({
  bodyRef,
}: {
  bodyRef?: MutableRefObject<RapierRigidBody | null>;
}) {
  const internalBodyRef = useRef<RapierRigidBody | null>(null);
  const rigidBodyRef = bodyRef ?? internalBodyRef;
  const { camera } = useThree();
  const keys = useDungeonInput((state) => state.keys);

  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const groundedTimer = useRef(0);
  const jumpBuffer = useRef(1);

  useFrame((_, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    const position = body.translation();
    const linvel = body.linvel();

    const rayOrigin = { x: position.x, y: position.y + 0.5, z: position.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const ray = { origin: rayOrigin, dir: rayDir } as any;

    // Very cheap ground check using vertical velocity + position threshold
    const grounded = Math.abs(linvel.y) < 0.2 && position.y <= 2.05;
    if (grounded) groundedTimer.current = 0;
    else groundedTimer.current += delta;

    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-4) forward.set(0, 0, 1);
    forward.normalize();
    right.copy(forward).cross(up).normalize().multiplyScalar(-1);

    moveDir.set(0, 0, 0);
    if (keys.forward) moveDir.add(forward);
    if (keys.backward) moveDir.sub(forward);
    if (keys.left) moveDir.sub(right);
    if (keys.right) moveDir.add(right);

    const hasInput = moveDir.lengthSq() > 0.001;
    const targetSpeed = keys.run ? RUN_SPEED : WALK_SPEED;
    let targetX = 0;
    let targetZ = 0;

    if (hasInput) {
      moveDir.normalize().multiplyScalar(targetSpeed);
      targetX = moveDir.x;
      targetZ = moveDir.z;
      const desiredYaw = Math.atan2(moveDir.x, moveDir.z);
      rotation.setFromAxisAngle(up, desiredYaw);
      body.setRotation(rotation, true);
    }

    const accel = hasInput ? ACCEL : DECEL;
    const nextX = moveToward(linvel.x, targetX, accel * delta);
    const nextZ = moveToward(linvel.z, targetZ, accel * delta);

    jumpBuffer.current = keys.jump ? 0 : jumpBuffer.current + delta;
    const canJump = jumpBuffer.current < 0.2 && groundedTimer.current < 0.2;
    let nextY = linvel.y - GRAVITY * delta;
    if (canJump) {
      nextY = JUMP_SPEED;
      jumpBuffer.current = 1;
      groundedTimer.current = 1;
    } else if (grounded) {
      nextY = 0;
    }

    body.setLinvel({ x: nextX, y: nextY, z: nextZ }, true);

    const speed = Math.hypot(nextX, nextZ);
    let nextAnim: PlayerAnimation = 'idle';
    if (!grounded && Math.abs(nextY) > 0.1) {
      nextAnim = 'jump';
    } else if (speed > 0.15) {
      nextAnim = keys.run ? 'run' : 'walk';
    }
    if (nextAnim !== animation) setAnimation(nextAnim);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={START_POSITION}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={0.2}
      angularDamping={0.2}
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
          <PlayerCharacter animation={animation} />
        </Suspense>
      </group>
    </RigidBody>
  );
}

function moveToward(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}
