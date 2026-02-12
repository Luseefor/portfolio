'use client';

import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';
import { buildDungeon, type DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { clearDungeonVisualLiftTiles, setDungeonVisualLiftTiles } from '@/lib/dungeonVisualLift';

const MATERIALS: Record<string, MeshStandardMaterial> = {
  floor: new MeshStandardMaterial({ color: '#2d2f2c', roughness: 0.95, metalness: 0.03 }),
  spawnPlatform: new MeshStandardMaterial({ color: '#4e5946', roughness: 0.9, metalness: 0.06 }),
  roomWall: new MeshStandardMaterial({ color: '#343733', roughness: 0.92, metalness: 0.04 }),
  corridorWall: new MeshStandardMaterial({ color: '#303430', roughness: 0.94, metalness: 0.03 }),
  arch: new MeshStandardMaterial({ color: '#4a4f47', roughness: 0.88, metalness: 0.05 }),
  pillar: new MeshStandardMaterial({ color: '#57544b', roughness: 0.88, metalness: 0.06 }),
  boundaryWall: new MeshStandardMaterial({ color: '#202420', roughness: 0.96, metalness: 0.02 }),
  prop: new MeshStandardMaterial({ color: '#6c583f', roughness: 0.82, metalness: 0.08 }),
};

function materialForPiece(piece: DungeonBuildPiece) {
  switch (piece.kind) {
    case 'floor':
    case 'corridor-floor':
      return MATERIALS.floor;
    case 'spawn-platform':
      return MATERIALS.spawnPlatform;
    case 'room-wall':
      return MATERIALS.roomWall;
    case 'corridor-wall':
      return MATERIALS.corridorWall;
    case 'arch':
      return MATERIALS.arch;
    case 'pillar':
      return MATERIALS.pillar;
    case 'boundary-wall':
      return MATERIALS.boundaryWall;
    case 'prop':
      return MATERIALS.prop;
    default:
      return MATERIALS.roomWall;
  }
}

export default function DungeonWorld() {
  const dungeon = useMemo(() => buildDungeon(DUNGEON_LAYOUT_GRAPH), []);

  useEffect(() => {
    setDungeonVisualLiftTiles(dungeon.walkableTiles);
    return () => {
      clearDungeonVisualLiftTiles();
    };
  }, [dungeon.walkableTiles]);

  return (
    <group name="dungeon-world">
      {dungeon.pieces.map((piece) => (
        <mesh
          key={piece.id}
          position={piece.position}
          rotation={[0, piece.rotationY, 0]}
          material={materialForPiece(piece)}
          castShadow={piece.kind !== 'floor' && piece.kind !== 'corridor-floor'}
          receiveShadow
        >
          <boxGeometry args={piece.size} />
        </mesh>
      ))}

      <RigidBody type="fixed" colliders={false} name="dungeon-colliders">
        {dungeon.colliders.map((collider) => (
          <CuboidCollider
            key={collider.id}
            args={[
              collider.size[0] / 2,
              collider.size[1] / 2,
              collider.size[2] / 2,
            ]}
            position={collider.position}
          />
        ))}
        <CuboidCollider args={[220, 0.2, 220]} position={[0, -0.3, 0]} />
      </RigidBody>
    </group>
  );
}
