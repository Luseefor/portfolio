'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Mesh, MeshStandardMaterial, Object3D, type Vector3 } from 'three';
import { DUNGEON_LAYOUT_GRAPH, DUNGEON_STRUCTURAL_KEYS } from '@/constants/dungeonLayout';
import { buildDungeon, type DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { createNodeMeasurementCache, createSafeNodeResolver } from '@/game/dungeon/utils';
import { clearDungeonVisualLiftTiles, setDungeonVisualLiftTiles } from '@/lib/dungeonVisualLift';

const DUNGEON_RUINS_GLB_URL = '/models/dungeon/structure/Modular%20Ruins%20Pack.glb';

const FALLBACK_MATERIALS: Record<string, MeshStandardMaterial> = {
  floor: new MeshStandardMaterial({ color: '#2d2f2c', roughness: 0.95, metalness: 0.03 }),
  spawnPlatform: new MeshStandardMaterial({ color: '#4e5946', roughness: 0.9, metalness: 0.06 }),
  roomWall: new MeshStandardMaterial({ color: '#343733', roughness: 0.92, metalness: 0.04 }),
  corridorWall: new MeshStandardMaterial({ color: '#303430', roughness: 0.94, metalness: 0.03 }),
  arch: new MeshStandardMaterial({ color: '#4a4f47', roughness: 0.88, metalness: 0.05 }),
  pillar: new MeshStandardMaterial({ color: '#57544b', roughness: 0.88, metalness: 0.06 }),
  boundaryWall: new MeshStandardMaterial({ color: '#202420', roughness: 0.96, metalness: 0.02 }),
  prop: new MeshStandardMaterial({ color: '#6c583f', roughness: 0.82, metalness: 0.08 }),
};

function fallbackMaterialForPiece(piece: DungeonBuildPiece) {
  switch (piece.kind) {
    case 'floor':
    case 'corridor-floor':
      return FALLBACK_MATERIALS.floor;
    case 'spawn-platform':
      return FALLBACK_MATERIALS.spawnPlatform;
    case 'room-wall':
      return FALLBACK_MATERIALS.roomWall;
    case 'corridor-wall':
      return FALLBACK_MATERIALS.corridorWall;
    case 'arch':
      return FALLBACK_MATERIALS.arch;
    case 'pillar':
      return FALLBACK_MATERIALS.pillar;
    case 'boundary-wall':
      return FALLBACK_MATERIALS.boundaryWall;
    case 'prop':
      return FALLBACK_MATERIALS.prop;
    default:
      return FALLBACK_MATERIALS.roomWall;
  }
}

function fallbackKeysForPiece(piece: DungeonBuildPiece): readonly string[] {
  switch (piece.kind) {
    case 'floor':
    case 'corridor-floor':
    case 'spawn-platform':
      return DUNGEON_STRUCTURAL_KEYS.floors;
    case 'room-wall':
    case 'corridor-wall':
    case 'boundary-wall':
      return DUNGEON_STRUCTURAL_KEYS.walls;
    case 'arch':
      return DUNGEON_STRUCTURAL_KEYS.arches;
    case 'pillar':
      return DUNGEON_STRUCTURAL_KEYS.pillars;
    case 'prop':
      return [...DUNGEON_STRUCTURAL_KEYS.torches, ...DUNGEON_STRUCTURAL_KEYS.pillars];
    default:
      return [];
  }
}

function rotationCandidatesForPiece(piece: DungeonBuildPiece) {
  if (piece.kind === 'floor' || piece.kind === 'corridor-floor' || piece.kind === 'spawn-platform') {
    return [-Math.PI / 2, 0, Math.PI / 2];
  }
  if (piece.kind === 'arch' || piece.kind === 'prop') {
    return [0, -Math.PI / 2, Math.PI / 2];
  }
  return [0, -Math.PI / 2];
}

function fitNodeToPiece(
  sourceNode: Object3D,
  piece: DungeonBuildPiece,
  measureNode: (node: Object3D, rotationX: number) => { size: Vector3; center: Vector3 },
) {
  const candidates = rotationCandidatesForPiece(piece);

  let bestRotationX = 0;
  let bestScaleX = 1;
  let bestScaleY = 1;
  let bestScaleZ = 1;
  let bestCenter = { x: 0, y: 0, z: 0 };
  let bestScore = Number.POSITIVE_INFINITY;

  for (let i = 0; i < candidates.length; i += 1) {
    const rotationX = candidates[i];
    const measurement = measureNode(sourceNode, rotationX);
    const sx = measurement.size.x > 1e-3 ? piece.size[0] / measurement.size.x : 1;
    const sy = measurement.size.y > 1e-3 ? piece.size[1] / measurement.size.y : 1;
    const sz = measurement.size.z > 1e-3 ? piece.size[2] / measurement.size.z : 1;

    const uniformXZKinds = new Set(['floor', 'corridor-floor', 'spawn-platform', 'room-wall', 'corridor-wall', 'boundary-wall', 'arch']);
    const uniformXZ = uniformXZKinds.has(piece.kind);
    const scaleX = uniformXZ ? (sx + sz) * 0.5 : sx;
    const scaleZ = uniformXZ ? (sx + sz) * 0.5 : sz;
    const scaleY = sy;

    const fittedX = measurement.size.x * scaleX;
    const fittedY = measurement.size.y * scaleY;
    const fittedZ = measurement.size.z * scaleZ;

    const score =
      Math.abs(fittedX - piece.size[0]) +
      Math.abs(fittedY - piece.size[1]) +
      Math.abs(fittedZ - piece.size[2]);

    if (score < bestScore) {
      bestScore = score;
      bestRotationX = rotationX;
      bestScaleX = scaleX;
      bestScaleY = scaleY;
      bestScaleZ = scaleZ;
      bestCenter = {
        x: measurement.center.x,
        y: measurement.center.y,
        z: measurement.center.z,
      };
    }
  }

  const clone = sourceNode.clone(true);
  clone.rotation.set(bestRotationX, 0, 0);
  clone.scale.set(bestScaleX, bestScaleY, bestScaleZ);
  clone.position.set(
    -bestCenter.x * bestScaleX,
    -bestCenter.y * bestScaleY,
    -bestCenter.z * bestScaleZ,
  );
  clone.updateMatrixWorld(true);

  clone.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = piece.kind !== 'floor' && piece.kind !== 'corridor-floor';
      child.receiveShadow = true;
    }
  });

  return clone;
}

export default function DungeonWorld() {
  const { nodes } = useGLTF(DUNGEON_RUINS_GLB_URL) as { nodes: Record<string, Object3D> };
  const dungeon = useMemo(() => buildDungeon(DUNGEON_LAYOUT_GRAPH), []);

  const resolveNode = useMemo(() => createSafeNodeResolver(nodes), [nodes]);
  const measureNode = useMemo(() => createNodeMeasurementCache(), []);

  const preparedPieces = useMemo(
    () =>
      dungeon.pieces.map((piece) => {
        const sourceNode = resolveNode(piece.nodeKey, fallbackKeysForPiece(piece), piece.id);
        if (!sourceNode) {
          return {
            piece,
            object: null,
          };
        }

        return {
          piece,
          object: fitNodeToPiece(sourceNode, piece, measureNode),
        };
      }),
    [dungeon.pieces, measureNode, resolveNode],
  );

  useEffect(() => {
    setDungeonVisualLiftTiles(dungeon.walkableTiles);
    return () => {
      clearDungeonVisualLiftTiles();
    };
  }, [dungeon.walkableTiles]);

  return (
    <group name="dungeon-world">
      {preparedPieces.map(({ piece, object }) => {
        if (object) {
          return (
            <group key={piece.id} position={piece.position} rotation={[0, piece.rotationY, 0]}>
              <primitive object={object} />
            </group>
          );
        }

        return (
          <mesh
            key={piece.id}
            position={piece.position}
            rotation={[0, piece.rotationY, 0]}
            material={fallbackMaterialForPiece(piece)}
            castShadow={piece.kind !== 'floor' && piece.kind !== 'corridor-floor'}
            receiveShadow
          >
            <boxGeometry args={piece.size} />
          </mesh>
        );
      })}

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

useGLTF.preload(DUNGEON_RUINS_GLB_URL);
