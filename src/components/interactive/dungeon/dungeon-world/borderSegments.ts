import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import { BORDER_HEIGHT, BORDER_STEP, BORDER_THICKNESS } from './constants';
import type { BorderSegment, UnitSegment } from './types';
import { topOverlayY } from './floorUtils';

function borderKey(
  orientation: 'h' | 'v',
  fixed: number,
  start: number,
  end: number,
  y: number,
) {
  return `${orientation}|${fixed.toFixed(3)}|${start.toFixed(3)}|${end.toFixed(3)}|${y.toFixed(3)}`;
}

function parseBorderKey(key: string): UnitSegment {
  const [orientationRaw, fixedRaw, startRaw, endRaw, yRaw] = key.split('|');
  return {
    orientation: orientationRaw === 'v' ? 'v' : 'h',
    fixed: Number(fixedRaw),
    start: Number(startRaw),
    end: Number(endRaw),
    y: Number(yRaw),
  };
}

function addEdgeSegments(
  segments: Set<string>,
  orientation: 'h' | 'v',
  fixed: number,
  start: number,
  end: number,
  y: number,
) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  for (let cursor = min; cursor < max - 1e-6; cursor += BORDER_STEP) {
    const key = borderKey(orientation, fixed, cursor, Math.min(max, cursor + BORDER_STEP), y);
    if (segments.has(key)) segments.delete(key);
    else segments.add(key);
  }
}

export function buildBorderSegments(pieces: DungeonBuildPiece[]): BorderSegment[] {
  const unitSegments = new Set<string>();
  for (let i = 0; i < pieces.length; i += 1) {
    const piece = pieces[i];
    const halfX = piece.size[0] / 2;
    const halfZ = piece.size[2] / 2;
    const minX = piece.position[0] - halfX;
    const maxX = piece.position[0] + halfX;
    const minZ = piece.position[2] - halfZ;
    const maxZ = piece.position[2] + halfZ;
    const y = topOverlayY();
    addEdgeSegments(unitSegments, 'h', minZ, minX, maxX, y);
    addEdgeSegments(unitSegments, 'h', maxZ, minX, maxX, y);
    addEdgeSegments(unitSegments, 'v', minX, minZ, maxZ, y);
    addEdgeSegments(unitSegments, 'v', maxX, minZ, maxZ, y);
  }

  const groups = new Map<string, UnitSegment[]>();
  for (const key of unitSegments) {
    const seg = parseBorderKey(key);
    const groupKey = `${seg.orientation}|${seg.fixed.toFixed(3)}|${seg.y.toFixed(3)}`;
    const group = groups.get(groupKey);
    if (group) group.push(seg);
    else groups.set(groupKey, [seg]);
  }

  const borders: BorderSegment[] = [];
  let index = 0;
  for (const group of groups.values()) {
    group.sort((a, b) => a.start - b.start);
    let runStart = group[0].start;
    let runEnd = group[0].end;
    const orientation = group[0].orientation;
    const fixed = group[0].fixed;
    const y = group[0].y;

    const flushRun = () => {
      const length = Math.max(0.01, runEnd - runStart);
      borders.push({
        id: `border-${index}`,
        position: orientation === 'h' ? [(runStart + runEnd) / 2, y, fixed] : [fixed, y, (runStart + runEnd) / 2],
        size: orientation === 'h' ? [length, BORDER_HEIGHT, BORDER_THICKNESS] : [BORDER_THICKNESS, BORDER_HEIGHT, length],
      });
      index += 1;
    };

    for (let i = 1; i < group.length; i += 1) {
      const next = group[i];
      if (next.start <= runEnd + BORDER_STEP * 0.6) runEnd = Math.max(runEnd, next.end);
      else {
        flushRun();
        runStart = next.start;
        runEnd = next.end;
      }
    }
    flushRun();
  }
  return borders;
}
