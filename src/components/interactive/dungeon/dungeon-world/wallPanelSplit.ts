import {
  BORDER_WALL_HEIGHT,
  BORDER_WALL_THICKNESS,
  WALL_FLOOR_LEVEL_Y,
  WALL_FLOOR_SINK,
  WALL_PANEL_MAX_LENGTH,
  WALL_PANEL_MIN_LENGTH,
} from './constants';
import type { BorderSegment, WallPanel } from './types';

export function buildVerticalBorderWalls(segments: BorderSegment[]): BorderSegment[] {
  const walls: BorderSegment[] = [];
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    const wallBaseY = WALL_FLOOR_LEVEL_Y - WALL_FLOOR_SINK;
    walls.push({
      id: `wall-${segment.id}`,
      position: [segment.position[0], wallBaseY + BORDER_WALL_HEIGHT * 0.5, segment.position[2]],
      size: [
        Math.max(BORDER_WALL_THICKNESS, segment.size[0]),
        BORDER_WALL_HEIGHT,
        Math.max(BORDER_WALL_THICKNESS, segment.size[2]),
      ],
    });
  }
  return walls;
}

export function splitWallIntoPanels(wall: BorderSegment): WallPanel[] {
  const alongX = wall.size[0] >= wall.size[2];
  const majorLength = alongX ? wall.size[0] : wall.size[2];
  const thickness = alongX ? wall.size[2] : wall.size[0];
  if (majorLength <= WALL_PANEL_MIN_LENGTH) {
    return [{ id: `${wall.id}-panel-0`, position: wall.position, size: [majorLength, wall.size[1], thickness], rotationY: alongX ? 0 : Math.PI * 0.5, axis: alongX ? 'x' : 'z' }];
  }

  const panelCount = Math.max(1, Math.ceil(majorLength / WALL_PANEL_MAX_LENGTH));
  const panelLength = majorLength / panelCount;
  const panels: WallPanel[] = [];
  for (let i = 0; i < panelCount; i += 1) {
    const offset = -majorLength * 0.5 + panelLength * (i + 0.5);
    panels.push(
      alongX
        ? { id: `${wall.id}-panel-${i}`, position: [wall.position[0] + offset, wall.position[1], wall.position[2]], size: [panelLength, wall.size[1], thickness], rotationY: 0, axis: 'x' }
        : { id: `${wall.id}-panel-${i}`, position: [wall.position[0], wall.position[1], wall.position[2] + offset], size: [panelLength, wall.size[1], thickness], rotationY: Math.PI * 0.5, axis: 'z' },
    );
  }
  return panels;
}
