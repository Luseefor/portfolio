import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import {
  AMBIENT_PROP_NODE_FALLBACKS,
  BUSH_NODE_FALLBACKS,
  CEILING_NODE_FALLBACKS,
  FLOOR_NODE_FALLBACKS,
  POT_BROKEN_NODE_FALLBACKS,
  POT_INTACT_NODE_FALLBACKS,
  TORCH_NODE_FALLBACKS,
  WALL_BACKER_NODE_FALLBACKS,
  WALL_NODE_FALLBACKS,
} from './constants';

export function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function floorNodeCandidates(piece: DungeonBuildPiece): readonly string[] {
  if (piece.kind === 'spawn-platform') return ['Floor_SquareLarge', 'Floor_Squares', 'Floor_Standard'];
  const base = piece.kind === 'corridor-floor' ? (['Floor_Standard', 'Floor_Squares'] as const) : FLOOR_NODE_FALLBACKS;
  const start = hashString(piece.id) % base.length;
  const rotated: string[] = [...base.slice(start), ...base.slice(0, start)];
  return rotated.includes(piece.nodeKey) ? [piece.nodeKey, ...rotated.filter((key) => key !== piece.nodeKey)] : [piece.nodeKey, ...rotated];
}

export function ceilingNodeCandidates(piece: DungeonBuildPiece): readonly string[] {
  const start = hashString(`ceiling-${piece.id}`) % CEILING_NODE_FALLBACKS.length;
  return [...CEILING_NODE_FALLBACKS.slice(start), ...CEILING_NODE_FALLBACKS.slice(0, start)];
}

export function wallNodeCandidates(panelId: string): readonly string[] {
  const start = hashString(`wall-${panelId}`) % WALL_NODE_FALLBACKS.length;
  return [...WALL_NODE_FALLBACKS.slice(start), ...WALL_NODE_FALLBACKS.slice(0, start)];
}

export function wallBackerNodeCandidates(panelId: string): readonly string[] {
  const start = hashString(`wall-backer-${panelId}`) % WALL_BACKER_NODE_FALLBACKS.length;
  return [...WALL_BACKER_NODE_FALLBACKS.slice(start), ...WALL_BACKER_NODE_FALLBACKS.slice(0, start)];
}

export function bushNodeCandidates(id: string): readonly string[] {
  const start = hashString(`bush-${id}`) % BUSH_NODE_FALLBACKS.length;
  return [...BUSH_NODE_FALLBACKS.slice(start), ...BUSH_NODE_FALLBACKS.slice(0, start)];
}

export function torchNodeCandidates(id: string): readonly string[] {
  const start = hashString(`torch-${id}`) % TORCH_NODE_FALLBACKS.length;
  return [...TORCH_NODE_FALLBACKS.slice(start), ...TORCH_NODE_FALLBACKS.slice(0, start)];
}

export function potVariantFor(id: string) {
  const index = hashString(`pot-variant-${id}`) % POT_INTACT_NODE_FALLBACKS.length;
  return { intact: POT_INTACT_NODE_FALLBACKS[index], broken: POT_BROKEN_NODE_FALLBACKS[index] };
}

export function ambientPropNodeCandidates(id: string): readonly string[] {
  const start = hashString(`ambient-${id}`) % AMBIENT_PROP_NODE_FALLBACKS.length;
  return [...AMBIENT_PROP_NODE_FALLBACKS.slice(start), ...AMBIENT_PROP_NODE_FALLBACKS.slice(0, start)];
}
