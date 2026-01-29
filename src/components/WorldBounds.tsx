'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';

const BOUNDS_SIZE = 180;
const WALL_HEIGHT = 40;
const SEABED_Y = -20;

export default function WorldBounds() {
  return (
    <RigidBody type="fixed" colliders={false} restitution={0.1} friction={0.8}>
      <CuboidCollider args={[BOUNDS_SIZE, 2, BOUNDS_SIZE]} position={[0, SEABED_Y, 0]} />
      <CuboidCollider
        args={[BOUNDS_SIZE, WALL_HEIGHT, 2]}
        position={[0, SEABED_Y + WALL_HEIGHT - 2, -BOUNDS_SIZE]}
      />
      <CuboidCollider
        args={[BOUNDS_SIZE, WALL_HEIGHT, 2]}
        position={[0, SEABED_Y + WALL_HEIGHT - 2, BOUNDS_SIZE]}
      />
      <CuboidCollider
        args={[2, WALL_HEIGHT, BOUNDS_SIZE]}
        position={[BOUNDS_SIZE, SEABED_Y + WALL_HEIGHT - 2, 0]}
      />
      <CuboidCollider
        args={[2, WALL_HEIGHT, BOUNDS_SIZE]}
        position={[-BOUNDS_SIZE, SEABED_Y + WALL_HEIGHT - 2, 0]}
      />
    </RigidBody>
  );
}
