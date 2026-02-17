import { useMemo } from 'react';
import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';
import { BORDER_WALL_SOURCE_KINDS, SPAWN_BORDER_HIDE_PADDING } from './constants';
import { buildBorderSegments } from './borderSegments';
import { buildVerticalBorderWalls, splitWallIntoPanels } from './wallPanelSplit';
import { orientWallPanelTowardInterior } from './propPlacement';
import type { BorderSegment, WallPanel } from './types';

function isSegmentInsideSpawnCutout(segment: BorderSegment) {
  const spawn = DUNGEON_LAYOUT_GRAPH.spawnPlatform;
  const minX = spawn.center[0] - spawn.size.width * 0.5 - SPAWN_BORDER_HIDE_PADDING;
  const maxX = spawn.center[0] + spawn.size.width * 0.5 + SPAWN_BORDER_HIDE_PADDING;
  const minZ = spawn.center[2] - spawn.size.depth * 0.5 - SPAWN_BORDER_HIDE_PADDING;
  const maxZ = spawn.center[2] + spawn.size.depth * 0.5 + SPAWN_BORDER_HIDE_PADDING;
  return (
    segment.position[0] >= minX &&
    segment.position[0] <= maxX &&
    segment.position[2] >= minZ &&
    segment.position[2] <= maxZ
  );
}

export function useWallPanelLayout(pieces: DungeonBuildPiece[], floorPieces: DungeonBuildPiece[]) {
  const borderWallSegments = useMemo(
    () => buildBorderSegments(pieces.filter((piece) => BORDER_WALL_SOURCE_KINDS.has(piece.kind))),
    [pieces],
  );

  const borderWalls = useMemo(() => {
    return buildVerticalBorderWalls(borderWallSegments).filter((wall) => !isSegmentInsideSpawnCutout(wall));
  }, [borderWallSegments]);

  const wallPanels = useMemo<WallPanel[]>(() => {
    return borderWalls.flatMap((wall) => splitWallIntoPanels(wall)).map((panel) => orientWallPanelTowardInterior(panel, floorPieces));
  }, [borderWalls, floorPieces]);

  return { borderWalls, wallPanels };
}
