'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import PlayerCharacter, { type PlayerAnimation } from '@/components/dungeon/PlayerCharacter';

const WALK_SPEED = 2.4;
const RUN_SPEED = 4.2;
const ACCELERATION = 18;
const FRICTION = 14;
const JUMP_SPEED = 5.2;
const GRAVITY = 14;
const GROUND_Y = -1.5;

const direction = new Vector3();
const velocity = new Vector3();

export default function PlayerController({
  playerRef,
}: {
  playerRef?: RefObject<Group>;
}) {
  const internalRef = useRef<Group>(null);
  const groupRef = playerRef ?? internalRef;
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
  });
  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const groundedRef = useRef(true);

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
    const group = groupRef.current;
    if (!group) return;

    direction.set(0, 0, 0);
    if (inputRef.current.forward) direction.z -= 1;
    if (inputRef.current.backward) direction.z += 1;
    if (inputRef.current.left) direction.x -= 1;
    if (inputRef.current.right) direction.x += 1;

    const isMoving = direction.lengthSq() > 0;
    const targetSpeed = inputRef.current.run ? RUN_SPEED : WALK_SPEED;

    if (isMoving) {
      direction.normalize().multiplyScalar(targetSpeed);
      velocity.x = moveToward(velocity.x, direction.x, ACCELERATION * delta);
      velocity.z = moveToward(velocity.z, direction.z, ACCELERATION * delta);
    } else {
      velocity.x = moveToward(velocity.x, 0, FRICTION * delta);
      velocity.z = moveToward(velocity.z, 0, FRICTION * delta);
    }

    if (groundedRef.current && inputRef.current.jump) {
      velocity.y = JUMP_SPEED;
      groundedRef.current = false;
    }
    inputRef.current.jump = false;

    velocity.y -= GRAVITY * delta;

    group.position.x += velocity.x * delta;
    group.position.y += velocity.y * delta;
    group.position.z += velocity.z * delta;

    if (group.position.y <= GROUND_Y) {
      group.position.y = GROUND_Y;
      velocity.y = 0;
      groundedRef.current = true;
    }

    if (isMoving) {
      const targetAnimation = inputRef.current.run ? 'run' : 'walk';
      setAnimation(targetAnimation);
      group.rotation.y = Math.atan2(velocity.x, velocity.z);
    } else {
      setAnimation('idle');
    }
  });

  return (
    <group ref={groupRef} position={[0, GROUND_Y, 0]}>
      <PlayerCharacter animation={animation} />
    </group>
  );
}

function moveToward(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}
