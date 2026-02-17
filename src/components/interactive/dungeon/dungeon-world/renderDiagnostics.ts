import type { Object3D } from 'three';
import type { DungeonPlacement } from '@/constants/dungeonLayout';
import { buildScaledFloorObject, setObjectMaterialsDoubleSided } from './floorUtils';

const ORIGIN_PROBE_NODE_KEYS = ['Floor_Standard', 'Floor_SquareLarge', 'Wall'] as const;

type VisualEntry =
  | { object?: Object3D | null; intactObject?: Object3D | null; brokenObject?: Object3D | null }
  | null
  | undefined;

export function warnAboutDungeonLayoutNodes(
  layout: DungeonPlacement[],
  nodes: Record<string, Object3D>,
) {
  const availableKeys = Object.keys(nodes);
  if (layout.length === 0) {
    console.warn('[DungeonWorld] DUNGEON_LAYOUT is empty; render diagnostics enabled.');
    return;
  }

  const missingKeys = new Set<string>();
  for (let i = 0; i < layout.length; i += 1) {
    if (!nodes[layout[i].key]) {
      missingKeys.add(layout[i].key);
    }
  }

  missingKeys.forEach((key) => {
    console.warn('Missing node:', key, availableKeys);
  });
}

export function buildOriginProbeObject(nodes: Record<string, Object3D>) {
  for (let i = 0; i < ORIGIN_PROBE_NODE_KEYS.length; i += 1) {
    const key = ORIGIN_PROBE_NODE_KEYS[i];
    const node = nodes[key];
    if (!node) continue;
    const targetSize: [number, number, number] = key.startsWith('Wall') ? [6, 6, 1.2] : [10, 0.6, 10];
    const object = buildScaledFloorObject(node, targetSize);
    if (!object) continue;
    setObjectMaterialsDoubleSided(object);
    return object;
  }
  return null;
}

export function hasRenderableVisualObjects(...groups: VisualEntry[][]) {
  for (let g = 0; g < groups.length; g += 1) {
    const group = groups[g];
    for (let i = 0; i < group.length; i += 1) {
      if (group[i]?.object || group[i]?.intactObject || group[i]?.brokenObject) return true;
    }
  }
  return false;
}
