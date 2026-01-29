'use client';

import { useEffect, useMemo } from 'react';
import { Instance, Instances, useGLTF } from '@react-three/drei';
import type { Mesh, Object3D } from 'three';
import { DUNGEON_LAYOUT, type DungeonPlacement } from '@/constants/DungeonLayout';

function getNode(nodes: Record<string, Object3D>, name: string) {
  return nodes[name] ?? null;
}

export default function DungeonLayout() {
  const { nodes } = useGLTF('/models/dungeon/structure/Modular Ruins Pack.glb') as unknown as {
    nodes: Record<string, Object3D>;
  };

  const placements = useMemo(() => DUNGEON_LAYOUT, []);
  const nodeKeys = useMemo(() => Object.keys(nodes), [nodes]);
  const missingKeys = useMemo(() => {
    const missing = new Set<string>();
    placements.forEach((placement) => {
      if (!nodes[placement.key]) {
        missing.add(placement.key);
      }
    });
    return Array.from(missing);
  }, [nodes, placements]);

  const fallbackMesh = useMemo(() => {
    const preferred = ['Floor_Standard', 'Wall', 'Floor_Squares'];
    for (const name of preferred) {
      const node = nodes[name];
      if (node && (node as Mesh).isMesh) return node as Mesh;
    }
    const firstMesh = Object.values(nodes).find((node) => (node as Mesh).isMesh);
    return (firstMesh as Mesh) ?? null;
  }, [nodes]);

  useEffect(() => {
    if (placements.length === 0) {
      console.warn('[DungeonLayout] DUNGEON_LAYOUT is empty.');
    }
    if (missingKeys.length > 0) {
      missingKeys.forEach((key) => {
        console.warn('[DungeonLayout] Missing node:', key, nodeKeys);
      });
    }
  }, [missingKeys, nodeKeys, placements.length]);
  const grouped = useMemo(() => {
    const map = new Map<string, DungeonPlacement[]>();
    placements.forEach((placement) => {
      const list = map.get(placement.key) ?? [];
      list.push(placement);
      map.set(placement.key, list);
    });
    return map;
  }, [placements]);
  const hasRenderable = useMemo(() => placements.some((placement) => Boolean(nodes[placement.key])), [nodes, placements]);

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
      {placements.length > 0 && !hasRenderable && fallbackMesh && (
        <mesh
          geometry={fallbackMesh.geometry}
          material={fallbackMesh.material}
          position={[0, 0, 0]}
          castShadow
          receiveShadow
        />
      )}
      {Array.from(grouped.entries()).map(([key, items]) => {
        const node = getNode(nodes, key);
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
