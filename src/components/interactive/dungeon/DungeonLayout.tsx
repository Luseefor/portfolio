'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Object3D, Mesh, MeshStandardMaterial, BoxGeometry } from 'three';
import { DUNGEON_LAYOUT, DUNGEON_SCALE, type DungeonPlacement } from '@/constants/DungeonLayout';

const FALLBACK_GEOMETRY = new BoxGeometry(1, 1, 1);
const FALLBACK_MATERIAL = new MeshStandardMaterial({ color: '#ff00ff' });

export default function DungeonLayout() {
  const { nodes } = useGLTF('/models/dungeon/structure/Modular Ruins Pack.glb') as unknown as {
    nodes: Record<string, Object3D>;
  };

  const placements = useMemo(() => DUNGEON_LAYOUT, []);

  // Debug flags
  const debugDungeon =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('debug') === '1' ||
      new URLSearchParams(window.location.search).get('debugDungeon') === '1');

  // Validate nodes on mount
  useEffect(() => {
    const missing = new Set<string>();
    for (const p of placements) {
      if (!nodes[p.key]) missing.add(p.key);
    }

    if (missing.size > 0) {
      console.warn('[DungeonLayout] Missing nodes from GLB:', Array.from(missing));
      console.log('[DungeonLayout] Available nodes:', Object.keys(nodes));
    }
  }, [nodes, placements]);

  // Create layout instances
  const dungeonPieces = useMemo(() => {
    return placements.map((p, i) => {
      const base = nodes[p.key];

      // Scale positions relative to origin
      const finalPos: [number, number, number] = [
        p.pos[0] * DUNGEON_SCALE,
        p.pos[1] * DUNGEON_SCALE,
        p.pos[2] * DUNGEON_SCALE
      ];

      // Apply global scale factor
      const finalScale = (p.scale ?? 1) * DUNGEON_SCALE;

      if (!base) {
        // Return fallback mesh if node missing
        if (debugDungeon) {
          return (
            <mesh
              key={`fallback-${i}`}
              position={finalPos}
              scale={[finalScale, finalScale, finalScale]}
              geometry={FALLBACK_GEOMETRY}
              material={FALLBACK_MATERIAL}
            />
          );
        }
        return null;
      }

      return (
        <primitive
          key={`${p.key}-${i}`}
          object={base.clone(true)}
          position={finalPos}
          rotation={[0, p.rotY ?? 0, 0]}
          scale={finalScale}
        />
      );
    });
  }, [placements, nodes, debugDungeon]);

  return (
    <group>
      {dungeonPieces}
    </group>
  );
}

useGLTF.preload('/models/dungeon/structure/Modular Ruins Pack.glb');
