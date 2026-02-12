'use client';

import { useMemo } from 'react';
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three';
import {
  DUNGEON_LAYOUT,
  DUNGEON_SCALE,
  DUNGEON_TILE_SIZE,
  DUNGEON_FLOOR_THICKNESS,
  DUNGEON_WALL_HEIGHT,
  DUNGEON_WALL_THICKNESS,
  DUNGEON_COLUMN_HEIGHT,
  DUNGEON_COLUMN_RADIUS,
  type DungeonPlacement,
} from '@/constants/dungeonLayout';

const floorGeometry = new BoxGeometry(DUNGEON_TILE_SIZE, DUNGEON_FLOOR_THICKNESS, DUNGEON_TILE_SIZE);
const wallGeometry = new BoxGeometry(DUNGEON_TILE_SIZE, DUNGEON_WALL_HEIGHT, DUNGEON_WALL_THICKNESS);
const ceilingGeometry = new BoxGeometry(
  DUNGEON_TILE_SIZE,
  DUNGEON_FLOOR_THICKNESS,
  DUNGEON_TILE_SIZE,
);
const columnGeometry = new CylinderGeometry(
  DUNGEON_COLUMN_RADIUS,
  DUNGEON_COLUMN_RADIUS,
  DUNGEON_COLUMN_HEIGHT,
  12,
);
const propGeometry = new BoxGeometry(
  DUNGEON_TILE_SIZE * 0.4,
  DUNGEON_TILE_SIZE * 0.5,
  DUNGEON_TILE_SIZE * 0.4,
);

const floorMaterial = new MeshStandardMaterial({ color: '#2a2b28', roughness: 0.95, metalness: 0.0 });
const wallMaterial = new MeshStandardMaterial({ color: '#3a332e', roughness: 0.9, metalness: 0.05 });
const ceilingMaterial = new MeshStandardMaterial({ color: '#242320', roughness: 0.95, metalness: 0.0 });
const columnMaterial = new MeshStandardMaterial({ color: '#4a433a', roughness: 0.85, metalness: 0.05 });
const propMaterial = new MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.8, metalness: 0.05 });

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

function getPrimitiveSpec(key: string) {
  if (isFloorKey(key)) {
    return {
      geometry: floorGeometry,
      material: floorMaterial,
      yOffset: -DUNGEON_FLOOR_THICKNESS / 2,
      isFloor: true,
    };
  }

  if (isWallKey(key)) {
    return {
      geometry: wallGeometry,
      material: wallMaterial,
      yOffset: DUNGEON_WALL_HEIGHT / 2,
      isFloor: false,
    };
  }

  if (isColumnKey(key)) {
    return {
      geometry: columnGeometry,
      material: columnMaterial,
      yOffset: DUNGEON_COLUMN_HEIGHT / 2,
      isFloor: false,
    };
  }

  return {
    geometry: propGeometry,
    material: propMaterial,
    yOffset: (DUNGEON_TILE_SIZE * 0.5) / 2,
    isFloor: false,
  };
}

export default function DungeonLayout() {
  const placements = useMemo(() => DUNGEON_LAYOUT, []);

  const dungeonPieces = useMemo(
    () =>
      placements.map((p: DungeonPlacement, i: number) => {
        const { geometry, material, yOffset, isFloor } = getPrimitiveSpec(p.key);
        const scale = p.scale ?? 1;
        const position: [number, number, number] = [
          p.pos[0] * DUNGEON_SCALE,
          p.pos[1] * DUNGEON_SCALE + yOffset,
          p.pos[2] * DUNGEON_SCALE,
        ];

        if (isFloor) {
          const ceilingPosition: [number, number, number] = [
            p.pos[0] * DUNGEON_SCALE,
            p.pos[1] * DUNGEON_SCALE + DUNGEON_WALL_HEIGHT + DUNGEON_FLOOR_THICKNESS / 2,
            p.pos[2] * DUNGEON_SCALE,
          ];
          return (
            <group key={`${p.key}-${i}`}>
              <mesh
                geometry={geometry}
                material={material}
                position={position}
                rotation={[0, p.rotY ?? 0, 0]}
                scale={[scale, scale, scale]}
                castShadow
                receiveShadow
              />
              <mesh
                geometry={ceilingGeometry}
                material={ceilingMaterial}
                position={ceilingPosition}
                rotation={[0, p.rotY ?? 0, 0]}
                scale={[scale, scale, scale]}
                castShadow
                receiveShadow
              />
            </group>
          );
        }

        return (
          <mesh
            key={`${p.key}-${i}`}
            geometry={geometry}
            material={material}
            position={position}
            rotation={[0, p.rotY ?? 0, 0]}
            scale={[scale, scale, scale]}
            castShadow
            receiveShadow
          />
        );
      }),
    [placements],
  );

  return <group>{dungeonPieces}</group>;
}
