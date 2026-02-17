import { useMemo } from 'react';
import type { Object3D } from 'three';
import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { buildScaledFloorObject, markFloorMeshForShadows } from './floorUtils';
import { bushNodeCandidates, hashString } from './nodeCandidates';
import { getInteriorSideForPanel, panelNormal } from './wallSpatial';
import type { BushVisual, WallPanel } from './types';

type ResolveNode = (primary: string, fallbacks: readonly string[], context: string) => Object3D | null;

export function useBushVisuals(
  wallPanels: WallPanel[],
  floorPieces: DungeonBuildPiece[],
  resolveNode: ResolveNode,
) {
  return useMemo<BushVisual[]>(() => {
    const bushes: BushVisual[] = [];
    for (let i = 0; i < wallPanels.length; i += 1) {
      const panel = wallPanels[i];
      if (hashString(panel.id) % 6 !== 0) continue;
      const normal = panelNormal(panel);
      const side = getInteriorSideForPanel(panel, floorPieces);
      const nodeCandidates = bushNodeCandidates(panel.id);
      const sourceNode = resolveNode(nodeCandidates[0], nodeCandidates.slice(1), `bush:${panel.id}`);
      const sizeSeed = hashString(`bush-size-${panel.id}`) % 3;
      const size: [number, number, number] = sizeSeed === 0 ? [2.2, 1.5, 2.1] : sizeSeed === 1 ? [2.8, 1.9, 2.6] : [3.4, 2.3, 3.2];
      const position: [number, number, number] = [panel.position[0] + normal.x * side * 0.7, 0.18, panel.position[2] + normal.z * side * 0.7];
      const rotationY = (hashString(`bush-rot-${panel.id}`) % 6283) / 1000;
      if (!sourceNode) {
        bushes.push({ id: `bush-${panel.id}`, position, rotationY, size, object: null });
        continue;
      }
      const object = buildScaledFloorObject(sourceNode, size);
      if (!object) continue;
      markFloorMeshForShadows(object);
      object.updateMatrixWorld(true);
      bushes.push({ id: `bush-${panel.id}`, position, rotationY, size, object });
    }
    return bushes;
  }, [floorPieces, resolveNode, wallPanels]);
}
