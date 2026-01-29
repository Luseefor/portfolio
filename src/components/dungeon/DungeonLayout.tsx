'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { Object3D } from 'three';
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

  // Optional debug: enable with ?debug=1 or ?debugDungeon=1
  const debugDungeon =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('debug') === '1' ||
      new URLSearchParams(window.location.search).get('debugDungeon') === '1');

  const missingKeys = useMemo(() => {
    const missing = new Set<string>();
    for (const p of placements) {
      if (!nodes[p.key]) missing.add(p.key);
    }
    return Array.from(missing);
  }, [nodes, placements]);

  // Group placements by key to reduce repeated lookups
  const grouped = useMemo(() => {
    const map = new Map<string, DungeonPlacement[]>();
    for (const p of placements) {
      const list = map.get(p.key) ?? [];
      list.push(p);
      map.set(p.key, list);
    }
    return map;
  }, [placements]);

  useEffect(() => {
    if (placements.length === 0) {
      console.warn('[DungeonLayout] DUNGEON_LAYOUT is empty.');
    }

    if (missingKeys.length > 0) {
      console.warn('[DungeonLayout] Missing placement keys:', missingKeys);
      // Helpful: print available keys once
      console.warn('[DungeonLayout] Available node keys:', nodeKeys);
    }

    // Warn if nodes rely on non-unit scale (common reason mesh/instancing breaks)
    // This is informational now since we are using <primitive>.
    for (const [key] of grouped.entries()) {
      const node = nodes[key];
      if (!node) continue;
      const s = node.scale;
      if (s.x !== 1 || s.y !== 1 || s.z !== 1) {
        console.warn('[DungeonLayout] Non-unit scale node (OK with primitive):', key, {
          x: s.x,
          y: s.y,
          z: s.z,
        });
      }
    }
  }, [grouped, missingKeys, nodeKeys, nodes, placements.length]);

  // Debug: force draw a known node at origin to confirm GLB visibility
  const debugNode = useMemo(() => getNode(nodes, 'Floor_Standard'), [nodes]);

  return (
    <group>
      {/* DEBUG: render a known piece at origin */}
      {debugDungeon && debugNode && (
        <primitive
          object={debugNode.clone(true)}
          position={[0, 0, 0]}
          frustumCulled={false as any}
        />
      )}

      {/* Render dungeon pieces as full Object3D clones to preserve hierarchy transforms */}
      {Array.from(grouped.entries()).flatMap(([key, items]) => {
        const base = getNode(nodes, key);
        if (!base) return [];

        return items.map((p, index) => (
          <primitive
            key={`${key}-${index}`}
            object={base.clone(true)}
            position={p.pos}
            rotation={[0, p.rotY ?? 0, 0]}
            scale={p.scale ?? 1}
            frustumCulled={false as any} // avoids accidental culling while debugging
          />
        ));
      })}
    </group>
  );
}

useGLTF.preload('/models/dungeon/structure/Modular Ruins Pack.glb');
