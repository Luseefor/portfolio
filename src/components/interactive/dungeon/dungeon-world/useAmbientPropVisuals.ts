import { useMemo } from 'react';
import type { Object3D } from 'three';
import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { AMBIENT_PROP_PLACEMENT_LIMIT } from './constants';
import { floorSurfaceYAt, pointInsideAnyFloor } from './floorQueries';
import { buildScaledFloorObject, markFloorMeshForShadows } from './floorUtils';
import { ambientPropNodeCandidates, hashString } from './nodeCandidates';
import { resolvePropXZForPanel } from './propPlacement';
import { groundAlignObjectToZeroY } from './propHelpers';
import type { AmbientPropVisual, WallCollisionBox, WallPanel } from './types';

type ResolveNode = (primary: string, fallbacks: readonly string[], context: string) => Object3D | null;

export function useAmbientPropVisuals(
  wallPanels: WallPanel[],
  floorPieces: DungeonBuildPiece[],
  wallCollisionBoxes: WallCollisionBox[],
  resolveNode: ResolveNode,
) {
  return useMemo<AmbientPropVisual[]>(() => {
    const props: AmbientPropVisual[] = [];
    for (let i = 0; i < wallPanels.length; i += 1) {
      if (props.length >= AMBIENT_PROP_PLACEMENT_LIMIT) break;
      const panel = wallPanels[i];
      const seed = hashString(`ambient-prop-${panel.id}`);
      if (seed % 8 !== 0) continue;

      const candidates = ambientPropNodeCandidates(panel.id);
      const primary = candidates[0];
      const sourceNode = resolveNode(primary, candidates.slice(1), `ambient:${panel.id}`);
      if (!sourceNode) continue;
      const size: [number, number, number] =
        primary === 'Barrel' ? [1.12, 1.34, 1.12] :
        primary === 'Crate' ? [1.15, 1.02, 1.15] :
        primary === 'Candles_1' ? [0.68, 0.42, 0.68] :
        primary === 'Candles_2' ? [0.82, 0.5, 0.82] : [0.46, 0.36, 0.56];
      const [x, z] = resolvePropXZForPanel(panel, size, seed + 101, floorPieces, wallCollisionBoxes);
      if (!pointInsideAnyFloor(x, z, floorPieces)) continue;
      const floorTopY = floorSurfaceYAt(x, z, floorPieces);
      const position: [number, number, number] = [x, floorTopY + (/Candles|Skull/i.test(primary) ? 0.025 : 0.04), z];
      const object = buildScaledFloorObject(sourceNode, size);
      if (!object) continue;
      markFloorMeshForShadows(object);
      groundAlignObjectToZeroY(object);
      props.push({ id: `ambient-${panel.id}`, position, rotationY: (hashString(`ambient-rot-${panel.id}`) % 6283) / 1000, size, object });
    }
    return props;
  }, [floorPieces, resolveNode, wallCollisionBoxes, wallPanels]);
}
