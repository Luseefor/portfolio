'use client';

import { useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { DUNGEON_LAYOUT, type DungeonPlacement } from '@/constants/DungeonLayout';

const FLOOR_HALF = 2;
const FLOOR_HEIGHT = 0.15;
const WALL_HALF_LENGTH = 2;
const WALL_HALF_THICKNESS = 0.2;
const WALL_HALF_HEIGHT = 2.2;
const COLUMN_HALF = 0.45;
const COLUMN_HALF_HEIGHT = 2.2;

function isFloorKey(key: string) {
  return key.startsWith('Floor');
}

function isWallKey(key: string) {
  return key.startsWith('Wall') || key.startsWith('Arch') || key.startsWith('Doors') || key.startsWith('Window');
}

function isColumnKey(key: string) {
  return key.startsWith('Column');
}

export default function DungeonColliders() {
  const { floors, walls, columns } = useMemo(() => {
    const floors: DungeonPlacement[] = [];
    const walls: DungeonPlacement[] = [];
    const columns: DungeonPlacement[] = [];

    DUNGEON_LAYOUT.forEach((placement) => {
      if (isFloorKey(placement.key)) {
        floors.push(placement);
        return;
      }
      if (isColumnKey(placement.key)) {
        columns.push(placement);
        return;
      }
      if (isWallKey(placement.key)) {
        walls.push(placement);
      }
    });

    return { floors, walls, columns };
  }, []);

  return (
    <RigidBody type="fixed" colliders={false}>
      {floors.map((floor, index) => (
        <CuboidCollider
          key={`floor-${index}`}
          args={[FLOOR_HALF, FLOOR_HEIGHT, FLOOR_HALF]}
          position={[floor.pos[0], floor.pos[1] - FLOOR_HEIGHT, floor.pos[2]]}
        />
      ))}

      {walls.map((wall, index) => {
        const rotY = wall.rotY ?? 0;
        const isSide = Math.abs(Math.sin(rotY)) > 0.5;
        const halfX = isSide ? WALL_HALF_THICKNESS : WALL_HALF_LENGTH;
        const halfZ = isSide ? WALL_HALF_LENGTH : WALL_HALF_THICKNESS;
        return (
          <CuboidCollider
            key={`wall-${index}`}
            args={[halfX, WALL_HALF_HEIGHT, halfZ]}
            position={[wall.pos[0], wall.pos[1] + WALL_HALF_HEIGHT, wall.pos[2]]}
          />
        );
      })}

      {columns.map((column, index) => (
        <CuboidCollider
          key={`column-${index}`}
          args={[COLUMN_HALF, COLUMN_HALF_HEIGHT, COLUMN_HALF]}
          position={[column.pos[0], column.pos[1] + COLUMN_HALF_HEIGHT, column.pos[2]]}
        />
      ))}
    </RigidBody>
  );
}
