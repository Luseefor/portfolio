import { useMemo } from 'react';
import { Object3D } from 'three';
import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { CEILING_CLEARANCE, TORCH_MOUNT_HEIGHT, TORCH_PLACEMENT_LIMIT, TORCH_WALL_ADVANCE, TORCH_WALL_CLEARANCE } from './constants';
import { floorSurfaceYAt } from './floorQueries';
import { buildScaledFloorObject, markFloorMeshForShadows, setObjectMaterialsDoubleSided } from './floorUtils';
import { hashString, torchNodeCandidates } from './nodeCandidates';
import { resolvePropXZForPanel } from './propPlacement';
import { groundAlignObjectToZeroY, setTorchGlowMaterial } from './propHelpers';
import { findNearestWallPanel, moveTowardWallPanel, wallFacingRotationY } from './wallSpatial';
import type { TorchVisual, WallCollisionBox, WallPanel } from './types';

type TorchAnchor = {
  id: string;
  source: 'spawn' | 'corridor' | 'room';
  position: [number, number, number];
  rotationY: number;
};

type ResolveNode = (primary: string, fallbacks: readonly string[], context: string) => Object3D | null;

export function useTorchVisuals(
  torchAnchors: TorchAnchor[],
  torchLimit: number,
  wallPanels: WallPanel[],
  floorPieces: DungeonBuildPiece[],
  wallCollisionBoxes: WallCollisionBox[],
  resolveNode: ResolveNode,
  graphicsQuality: 'low' | 'medium' | 'high',
  torchIntensityScale: number,
) {
  const limitedAnchors = torchLimit > TORCH_PLACEMENT_LIMIT ? TORCH_PLACEMENT_LIMIT : torchLimit;
  return useMemo<TorchVisual[]>(() => {
    return torchAnchors.slice(0, limitedAnchors).map((anchor) => {
      const candidates = torchNodeCandidates(anchor.id);
      const sourceNode = resolveNode(candidates[0], candidates.slice(1), `torch:${anchor.id}`);
      const size: [number, number, number] = anchor.source === 'spawn' ? [1.15, 2.35, 0.9] : anchor.source === 'corridor' ? [0.9, 2.05, 0.72] : [1, 2.15, 0.78];
      const panel = findNearestWallPanel(anchor.position[0], anchor.position[2], wallPanels);
      const seed = hashString(`torch-pos-${anchor.id}`);
      const [baseX, baseZ] = panel ? resolvePropXZForPanel(panel, [0.42, size[1], 0.42], seed, floorPieces, wallCollisionBoxes) : [anchor.position[0], anchor.position[2]];
      const [x, z] = panel ? moveTowardWallPanel(panel, baseX, baseZ, TORCH_WALL_ADVANCE, TORCH_WALL_CLEARANCE) : [baseX, baseZ];
      const floorTopY = floorSurfaceYAt(x, z, floorPieces);
      const position: [number, number, number] = [x, floorTopY + 0.04, z];
      const rotationY = (panel ? wallFacingRotationY(panel, x, z) : anchor.rotationY) + Math.PI;
      const object = sourceNode ? buildScaledFloorObject(sourceNode, size) : null;
      if (object) {
        setObjectMaterialsDoubleSided(object);
        markFloorMeshForShadows(object);
        groundAlignObjectToZeroY(object);
        setTorchGlowMaterial(object);
      }
      const lightTarget = new Object3D();
      lightTarget.position.set(0, TORCH_MOUNT_HEIGHT * 0.55, CEILING_CLEARANCE > 0 ? 1.25 : 1);
      return {
        id: `torch-prop-${anchor.id}`,
        position,
        rotationY,
        size,
        object,
        glowColor: anchor.source === 'spawn' ? '#ffcd86' : anchor.source === 'corridor' ? '#ff9f54' : '#ffba73',
        baseIntensity: (anchor.source === 'spawn' ? 0.9 : anchor.source === 'corridor' ? 0.7 : 0.8) * torchIntensityScale,
        wallFillIntensity: (anchor.source === 'spawn' ? 0.88 : anchor.source === 'corridor' ? 0.74 : 0.8) * torchIntensityScale,
        wallGlowOpacity: graphicsQuality === 'low' ? 0.16 : graphicsQuality === 'medium' ? 0.22 : 0.27,
        distance: (anchor.source === 'corridor' ? 6.5 : 7.2) * (graphicsQuality === 'low' ? 0.8 : 1),
        flickerSeed: (hashString(`torch-flicker-${anchor.id}`) % 6283) / 1000,
        lightTarget,
      };
    });
  }, [floorPieces, graphicsQuality, limitedAnchors, resolveNode, torchAnchors, torchIntensityScale, wallCollisionBoxes, wallPanels]);
}
