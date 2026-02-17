import { useMemo } from 'react';
import type { Object3D } from 'three';
import { WALL_BACKER_EXPAND_X, WALL_BACKER_EXPAND_Y, WALL_BACKER_OFFSET, WALL_BACKER_THICKNESS } from './constants';
import { buildScaledFloorObject, setObjectMaterialsDoubleSided } from './floorUtils';
import { wallBackerNodeCandidates, wallNodeCandidates } from './nodeCandidates';
import { buildWallCollisionBoxes } from './wallSpatial';
import type { WallBackerVisual, WallPanel, WallVisual } from './types';

type ResolveNode = (primary: string, fallbacks: readonly string[], context: string) => Object3D | null;

export function useWallVisuals(wallPanels: WallPanel[], resolveNode: ResolveNode) {
  const wallVisuals = useMemo<WallVisual[]>(() => {
    return wallPanels.map((panel) => {
      const candidates = wallNodeCandidates(panel.id);
      const sourceNode = resolveNode(candidates[0], candidates.slice(1), `wall:${panel.id}`);
      if (!sourceNode) return { ...panel, object: null };
      const object = buildScaledFloorObject(sourceNode, panel.size);
      if (!object) return { ...panel, object: null };
      setObjectMaterialsDoubleSided(object);
      return { ...panel, object };
    });
  }, [resolveNode, wallPanels]);

  const wallBackers = useMemo<WallBackerVisual[]>(() => {
    return wallPanels.map((panel) => {
      const candidates = wallBackerNodeCandidates(panel.id);
      const sourceNode = resolveNode(candidates[0], candidates.slice(1), `wall-backer:${panel.id}`);
      const size: [number, number, number] = [panel.size[0] + WALL_BACKER_EXPAND_X, panel.size[1] + WALL_BACKER_EXPAND_Y, WALL_BACKER_THICKNESS];
      const normalX = Math.sin(panel.rotationY);
      const normalZ = Math.cos(panel.rotationY);
      const position: [number, number, number] = [panel.position[0] - normalX * WALL_BACKER_OFFSET, panel.position[1], panel.position[2] - normalZ * WALL_BACKER_OFFSET];
      if (!sourceNode) return { id: `backer-${panel.id}`, position, size, rotationY: panel.rotationY, object: null };
      const object = buildScaledFloorObject(sourceNode, size);
      if (!object) return { id: `backer-${panel.id}`, position, size, rotationY: panel.rotationY, object: null };
      setObjectMaterialsDoubleSided(object);
      return { id: `backer-${panel.id}`, position, size, rotationY: panel.rotationY, object };
    });
  }, [resolveNode, wallPanels]);

  const wallCollisionBoxes = useMemo(() => buildWallCollisionBoxes(wallPanels), [wallPanels]);
  return { wallVisuals, wallBackers, wallCollisionBoxes };
}
