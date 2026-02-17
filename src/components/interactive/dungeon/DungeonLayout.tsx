'use client';

import { useMemo } from 'react';
import {
  DUNGEON_LAYOUT,
  DUNGEON_SCALE,
  DUNGEON_FLOOR_THICKNESS,
  DUNGEON_WALL_HEIGHT,
  type DungeonPlacement,
} from '@/constants/dungeonLayout';
import { ceilingGeometry, ceilingMaterial, getPrimitiveSpec } from './dungeon-layout/primitives';

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
