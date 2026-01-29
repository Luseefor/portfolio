'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { Mesh, Object3D } from 'three';
import { DUNGEON_LAYOUT, type DungeonPlacement } from '@/constants/DungeonLayout';

function resolveNode(nodes: Record<string, Object3D>, key: string) {
  return nodes[key];
}

export default function DungeonLayout() {
  const { nodes } = useGLTF('/models/dungeon/structure/Modular Ruins Pack.glb') as unknown as {
    nodes: Record<string, Object3D>;
  };

  const placements = useMemo(() => DUNGEON_LAYOUT, []);

  return (
    <group>
      {placements.map((placement: DungeonPlacement, index: number) => {
        const node = resolveNode(nodes, placement.key);
        if (!node) return null;

        if ((node as Mesh).isMesh) {
          const mesh = node as Mesh;
          return (
            <mesh
              key={`${placement.key}-${index}`}
              geometry={mesh.geometry}
              material={mesh.material}
              position={placement.pos}
              rotation={[0, placement.rotY ?? 0, 0]}
              scale={placement.scale ?? 1}
              castShadow
              receiveShadow
            />
          );
        }

        return (
          <primitive
            key={`${placement.key}-${index}`}
            object={node.clone(true)}
            position={placement.pos}
            rotation={[0, placement.rotY ?? 0, 0]}
            scale={placement.scale ?? 1}
          />
        );
      })}
    </group>
  );
}

useGLTF.preload('/models/dungeon/structure/Modular Ruins Pack.glb');
