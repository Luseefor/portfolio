'use client';

import { useMemo } from 'react';
import { Instance, Instances, useGLTF } from '@react-three/drei';
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
  const grouped = useMemo(() => {
    const map = new Map<string, DungeonPlacement[]>();
    placements.forEach((placement) => {
      const list = map.get(placement.key) ?? [];
      list.push(placement);
      map.set(placement.key, list);
    });
    return map;
  }, [placements]);

  const instancedKeys = useMemo(
    () =>
      new Set([
        'Floor_Standard',
        'Floor_Squares',
        'Floor_SquareLarge',
        'Floor_Standard_Half',
        'Floor_Diamond',
        'Wall',
        'Wall_Broken',
        'Wall_Overgrown',
        'Wall_Hole',
        'Column_Round',
        'Column_Square',
      ]),
    []
  );

  return (
    <group>
      {Array.from(grouped.entries()).map(([key, items]) => {
        const node = resolveNode(nodes, key);
        if (!node) return null;

        const isMesh = (node as Mesh).isMesh;
        if (!isMesh) {
          return items.map((placement, index) => (
            <primitive
              key={`${key}-${index}`}
              object={node.clone(true)}
              position={placement.pos}
              rotation={[0, placement.rotY ?? 0, 0]}
              scale={placement.scale ?? 1}
            />
          ));
        }

        const mesh = node as Mesh;
        const useInstances = instancedKeys.has(key) && items.length > 1;

        if (useInstances) {
          return (
            <Instances
              key={`inst-${key}`}
              geometry={mesh.geometry}
              material={mesh.material}
              castShadow
              receiveShadow
            >
              {items.map((placement, index) => (
                <Instance
                  key={`${key}-${index}`}
                  position={placement.pos}
                  rotation={[0, placement.rotY ?? 0, 0]}
                  scale={placement.scale ?? 1}
                />
              ))}
            </Instances>
          );
        }

        return items.map((placement, index) => (
          <mesh
            key={`${key}-${index}`}
            geometry={mesh.geometry}
            material={mesh.material}
            position={placement.pos}
            rotation={[0, placement.rotY ?? 0, 0]}
            scale={placement.scale ?? 1}
            castShadow
            receiveShadow
          />
        ));
      })}
    </group>
  );
}

useGLTF.preload('/models/dungeon/structure/Modular Ruins Pack.glb');
