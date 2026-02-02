'use client';

import { useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import {
  DUNGEON_LAYOUT,
  DUNGEON_SCALE,
  DUNGEON_TILE_SIZE,
  DUNGEON_FLOOR_THICKNESS,
  DUNGEON_WALL_HEIGHT,
  DUNGEON_WALL_THICKNESS,
  DUNGEON_COLUMN_RADIUS,
  DUNGEON_COLUMN_HEIGHT,
  type DungeonPlacement,
} from '@/constants/DungeonLayout';

// Collider Dimensions (Half-extents)
// Must match the visual mesh dimensions roughly.
const FLOOR_HALF = DUNGEON_TILE_SIZE / 2;
const FLOOR_HEIGHT = DUNGEON_FLOOR_THICKNESS / 2;
const WALL_HALF_LENGTH = DUNGEON_TILE_SIZE / 2;
const WALL_HALF_THICKNESS = DUNGEON_WALL_THICKNESS / 2;
const WALL_HALF_HEIGHT = DUNGEON_WALL_HEIGHT / 2;
const COLUMN_HALF = DUNGEON_COLUMN_RADIUS;
const COLUMN_HALF_HEIGHT = DUNGEON_COLUMN_HEIGHT / 2;

function isFloorKey(key: string) {
  return key.startsWith('Floor');
}

function isWallKey(key: string) {
  return (
    key.startsWith('Wall') ||
    key.startsWith('Arch') ||
    key.startsWith('Doors') ||
    key.startsWith('Window')
  );
}

function isColumnKey(key: string) {
  return key.startsWith('Column') || key.startsWith('Pillar');
}

export default function DungeonColliders() {
  const { floors, walls, columns } = useMemo(() => {
    const floors: DungeonPlacement[] = [];
    const walls: DungeonPlacement[] = [];
    const columns: DungeonPlacement[] = [];

    DUNGEON_LAYOUT.forEach((placement) => {
      if (isFloorKey(placement.key)) {
        floors.push(placement);
      } else if (isColumnKey(placement.key)) {
        columns.push(placement);
      } else if (isWallKey(placement.key)) {
        walls.push(placement);
      }
    });

    return { floors, walls, columns };
  }, []);

  return (
    <RigidBody type="fixed" colliders={false} name="dungeon-geometry" friction={1}>
      {/*
         Safety Net Floor:
         Catches player if they clip through the main floor.
         Positioned slightly below the lowest visual floor.
      */}
      <CuboidCollider
        args={[100 * DUNGEON_SCALE, 1 * DUNGEON_SCALE, 100 * DUNGEON_SCALE]}
        position={[0, -2 * DUNGEON_SCALE, 0]}
        name="safety-floor"
      />

      {/* Floors */}
      {floors.map((floor, index) => (
        <CuboidCollider
          key={`floor-${index}`}
          args={[FLOOR_HALF, FLOOR_HEIGHT, FLOOR_HALF]}
          // Floor visual is at Y=0. Collider center should be slightly below 0
          // Offset = -FLOOR_HEIGHT (-0.5 units * scale)
          position={[
            floor.pos[0] * DUNGEON_SCALE,
            (floor.pos[1] * DUNGEON_SCALE) - FLOOR_HEIGHT,
            floor.pos[2] * DUNGEON_SCALE
          ]}
        />
      ))}

      {/* Walls */}
      {walls.map((wall, index) => {
        const rotY = wall.rotY ?? 0;
        // Check if rotated 90 degrees (approx)
        const isRotated = Math.abs(Math.sin(rotY)) > 0.5;

        const halfX = isRotated ? WALL_HALF_THICKNESS : WALL_HALF_LENGTH;
        const halfZ = isRotated ? WALL_HALF_LENGTH : WALL_HALF_THICKNESS;

        return (
          <CuboidCollider
            key={`wall-${index}`}
            args={[halfX, WALL_HALF_HEIGHT, halfZ]}
            // Wall visual starts at Y=0 and goes up. Center at +Height/2
            position={[
              wall.pos[0] * DUNGEON_SCALE,
              (wall.pos[1] * DUNGEON_SCALE) + WALL_HALF_HEIGHT,
              wall.pos[2] * DUNGEON_SCALE
            ]}
          />
        );
      })}

      {/* Columns */}
      {columns.map((column, index) => (
        <CuboidCollider
          key={`column-${index}`}
          args={[COLUMN_HALF, COLUMN_HALF_HEIGHT, COLUMN_HALF]}
          position={[
            column.pos[0] * DUNGEON_SCALE,
            (column.pos[1] * DUNGEON_SCALE) + COLUMN_HALF_HEIGHT,
            column.pos[2] * DUNGEON_SCALE
          ]}
        />
      ))}
    </RigidBody>
  );
}
