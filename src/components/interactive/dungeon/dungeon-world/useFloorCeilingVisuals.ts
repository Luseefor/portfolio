import { useMemo } from 'react';
import type { Object3D } from 'three';
import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { CEILING_CLEARANCE, CEILING_EXPAND, CEILING_THICKNESS, FLOOR_VISUAL_OVERHANG } from './constants';
import { buildScaledFloorObject, setObjectMaterialsDoubleSided } from './floorUtils';
import { ceilingNodeCandidates, floorNodeCandidates } from './nodeCandidates';
import type { CeilingVisual, FloorVisual } from './types';

type ResolveNode = (primary: string, fallbacks: readonly string[], context: string) => Object3D | null;

export function useFloorCeilingVisuals(
  floorPieces: DungeonBuildPiece[],
  resolveNode: ResolveNode,
  colliders: Array<{ id: string; position: [number, number, number]; size: [number, number, number] }>,
) {
  const floorVisuals = useMemo<FloorVisual[]>(() => {
    return floorPieces.map((piece) => {
      const candidates = floorNodeCandidates(piece);
      const sourceNode = resolveNode(candidates[0], candidates.slice(1), `floor:${piece.id}`);
      if (!sourceNode) return { piece, object: null };
      const floorObject = buildScaledFloorObject(sourceNode, [piece.size[0] + FLOOR_VISUAL_OVERHANG, piece.size[1], piece.size[2] + FLOOR_VISUAL_OVERHANG]);
      return floorObject ? { piece, object: floorObject } : { piece, object: null };
    });
  }, [floorPieces, resolveNode]);

  const ceilingVisuals = useMemo<CeilingVisual[]>(() => {
    return floorPieces.map((piece) => {
      const nodeCandidates = ceilingNodeCandidates(piece);
      const sourceNode = resolveNode(nodeCandidates[0], nodeCandidates.slice(1), `ceiling:${piece.id}`);
      const size: [number, number, number] = [piece.size[0] + CEILING_EXPAND, CEILING_THICKNESS, piece.size[2] + CEILING_EXPAND];
      const position: [number, number, number] = [piece.position[0], piece.position[1] + piece.size[1] * 0.5 + CEILING_CLEARANCE, piece.position[2]];
      if (!sourceNode) return { id: `ceiling-${piece.id}`, position, size, rotationY: piece.rotationY, object: null };
      const object = buildScaledFloorObject(sourceNode, size);
      if (!object) return { id: `ceiling-${piece.id}`, position, size, rotationY: piece.rotationY, object: null };
      setObjectMaterialsDoubleSided(object);
      return { id: `ceiling-${piece.id}`, position, size, rotationY: piece.rotationY, object };
    });
  }, [floorPieces, resolveNode]);

  const floorColliders = useMemo(() => {
    const floorIds = new Set(floorPieces.map((piece) => piece.id));
    return colliders.filter((collider) => floorIds.has(collider.id));
  }, [colliders, floorPieces]);

  return { floorVisuals, ceilingVisuals, floorColliders };
}
