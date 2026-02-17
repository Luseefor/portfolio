import { useMemo } from 'react';
import type { Object3D } from 'three';
import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { POT_BROKEN_NODE_FALLBACKS, POT_INTACT_NODE_FALLBACKS, POT_PLACEMENT_LIMIT } from './constants';
import { floorSurfaceYAt, pointInsideAnyFloor } from './floorQueries';
import { buildScaledFloorObject, markFloorMeshForShadows } from './floorUtils';
import { hashString, potVariantFor } from './nodeCandidates';
import { resolvePropXZForPanel } from './propPlacement';
import { groundAlignObjectToZeroY } from './propHelpers';
import type { PotVisual, WallCollisionBox, WallPanel } from './types';

type ResolveNode = (primary: string, fallbacks: readonly string[], context: string) => Object3D | null;

export function usePotVisuals(
  wallPanels: WallPanel[],
  floorPieces: DungeonBuildPiece[],
  wallCollisionBoxes: WallCollisionBox[],
  resolveNode: ResolveNode,
) {
  return useMemo<PotVisual[]>(() => {
    const pots: PotVisual[] = [];
    for (let i = 0; i < wallPanels.length; i += 1) {
      if (pots.length >= POT_PLACEMENT_LIMIT) break;
      const panel = wallPanels[i];
      const seed = hashString(`pot-${panel.id}`);
      if (seed % 5 !== 0) continue;
      const intactSize: [number, number, number] = [0.96, 0.92, 0.96];
      const brokenSize: [number, number, number] = [1.08, 0.56, 1.08];
      const [x, z] = resolvePropXZForPanel(panel, intactSize, seed, floorPieces, wallCollisionBoxes);
      if (!pointInsideAnyFloor(x, z, floorPieces)) continue;
      const floorTopY = floorSurfaceYAt(x, z, floorPieces);
      const position: [number, number, number] = [x, floorTopY + 0.04, z];

      const variant = potVariantFor(panel.id);
      const intactNode = resolveNode(variant.intact, POT_INTACT_NODE_FALLBACKS.filter((key) => key !== variant.intact), `pot:${panel.id}`);
      const brokenNode = resolveNode(variant.broken, POT_BROKEN_NODE_FALLBACKS.filter((key) => key !== variant.broken), `pot-broken:${panel.id}`);
      const intactObject = intactNode ? buildScaledFloorObject(intactNode, intactSize) : null;
      const brokenObject = brokenNode ? buildScaledFloorObject(brokenNode, brokenSize) : null;
      if (intactObject) {
        markFloorMeshForShadows(intactObject);
        groundAlignObjectToZeroY(intactObject);
      }
      if (brokenObject) {
        markFloorMeshForShadows(brokenObject);
        groundAlignObjectToZeroY(brokenObject);
      }

      pots.push({
        id: `pot-${panel.id}`,
        position,
        rotationY: (seed % 6283) / 1000,
        size: intactSize,
        brokenHeight: brokenSize[1],
        intactObject,
        brokenObject,
      });
    }
    return pots;
  }, [floorPieces, resolveNode, wallCollisionBoxes, wallPanels]);
}
