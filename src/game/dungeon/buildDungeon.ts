import {
  DUNGEON_LAYOUT_BOUNDS,
  DUNGEON_LAYOUT_GRAPH,
  DUNGEON_STRUCTURAL_KEYS,
  type DungeonLayoutGraph,
  type DungeonRoom,
  type DungeonRoomTheme,
  type DungeonRoute,
  type Vec2,
  type Vec3,
} from '@/constants/dungeonLayout';
import { snapValue, snapVec3 } from './utils';

export type DungeonPieceKind =
  | 'floor'
  | 'room-wall'
  | 'corridor-floor'
  | 'corridor-wall'
  | 'arch'
  | 'pillar'
  | 'spawn-platform'
  | 'boundary-wall'
  | 'prop';

export type DungeonBuildPiece = {
  id: string;
  kind: DungeonPieceKind;
  nodeKey: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  roomId?: string;
  routeId?: string;
};

export type DungeonBuildCollider = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
};

export type DungeonTorchAnchor = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  source: 'spawn' | 'room' | 'corridor';
};

export type DungeonWalkableTile = {
  x: number;
  z: number;
  halfSize: number;
  lift: number;
};

export type DungeonBuildResult = {
  pieces: DungeonBuildPiece[];
  colliders: DungeonBuildCollider[];
  torchAnchors: DungeonTorchAnchor[];
  walkableTiles: DungeonWalkableTile[];
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  spawnPoint: Vec3;
};

type FloorCellTag = {
  room: boolean;
  corridor: boolean;
  theme?: DungeonRoomTheme;
};

type FloorRect = {
  ixMin: number;
  ixMax: number;
  izMin: number;
  izMax: number;
};

type WallEdgeGroup = {
  orientation: 'x' | 'z';
  coord: number;
  kind: 'room-wall' | 'corridor-wall';
  nodeKey: string;
  starts: number[];
};

const FLOOR_THICKNESS = 0.5;
const FLOOR_OVERLAP = 0.08;
const WALL_THICKNESS = 1;
const WALL_HEIGHT = 7;
const WALL_OVERLAP = 0.12;
const POSITION_SNAP = 0.5;
const SIZE_SNAP = 0.25;

const FLOOR_BY_THEME: Record<DungeonRoomTheme, string> = {
  spawn: 'Floor_SquareLarge',
  hall: 'Floor_Standard',
  crossroads: 'Floor_Squares',
  chapel: 'Floor_SquareLarge',
  crypt: 'Floor_Standard',
  reliquary: 'Floor_Squares',
  treasury: 'Floor_SquareLarge',
  watch: 'Floor_Standard',
};

const WALL_BY_THEME: Partial<Record<DungeonRoomTheme, string>> = {
  chapel: 'Wall_Overgrown',
  reliquary: 'Wall_Broken',
  treasury: 'Wall_Overgrown',
};

function cellKey(ix: number, iz: number) {
  return `${ix},${iz}`;
}

function parseCellKey(key: string): [number, number] {
  const [ixRaw, izRaw] = key.split(',');
  return [Number(ixRaw), Number(izRaw)];
}

function normalizePiece(piece: DungeonBuildPiece): DungeonBuildPiece {
  return {
    ...piece,
    position: snapVec3(piece.position, POSITION_SNAP),
    size: [
      Math.max(SIZE_SNAP, snapValue(piece.size[0], SIZE_SNAP)),
      Math.max(SIZE_SNAP, snapValue(piece.size[1], SIZE_SNAP)),
      Math.max(SIZE_SNAP, snapValue(piece.size[2], SIZE_SNAP)),
    ],
    rotationY: snapValue(piece.rotationY, 0.0001),
  };
}

function addPieceAndCollider(
  pieces: DungeonBuildPiece[],
  colliders: DungeonBuildCollider[],
  piece: DungeonBuildPiece,
) {
  const normalized = normalizePiece(piece);
  pieces.push(normalized);
  colliders.push({
    id: normalized.id,
    position: normalized.position,
    size: normalized.size,
  });
}

function getRoomWallNode(theme: DungeonRoomTheme | undefined) {
  if (!theme) return DUNGEON_STRUCTURAL_KEYS.walls[0];
  return WALL_BY_THEME[theme] ?? DUNGEON_STRUCTURAL_KEYS.walls[0];
}

function upsertFloorCell(
  cells: Map<string, FloorCellTag>,
  ix: number,
  iz: number,
  patch: FloorCellTag,
) {
  const key = cellKey(ix, iz);
  const existing = cells.get(key);
  if (existing) {
    existing.room = existing.room || patch.room;
    existing.corridor = existing.corridor || patch.corridor;
    if (patch.theme && !existing.theme) {
      existing.theme = patch.theme;
    }
    cells.set(key, existing);
    return;
  }
  cells.set(key, { ...patch });
}

function addRectCells(
  cells: Map<string, FloorCellTag>,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  cellSize: number,
  patch: FloorCellTag,
) {
  const ixMin = Math.floor(minX / cellSize);
  const ixMax = Math.ceil(maxX / cellSize) - 1;
  const izMin = Math.floor(minZ / cellSize);
  const izMax = Math.ceil(maxZ / cellSize) - 1;

  for (let ix = ixMin; ix <= ixMax; ix += 1) {
    for (let iz = izMin; iz <= izMax; iz += 1) {
      upsertFloorCell(cells, ix, iz, patch);
    }
  }
}

function addRoomCells(cells: Map<string, FloorCellTag>, room: DungeonRoom, cellSize: number) {
  const [cx, , cz] = room.center;
  addRectCells(
    cells,
    cx - room.size.width / 2,
    cx + room.size.width / 2,
    cz - room.size.depth / 2,
    cz + room.size.depth / 2,
    cellSize,
    {
      room: true,
      corridor: false,
      theme: room.theme,
    },
  );
}

function getRoutePoints(route: DungeonRoute, roomById: Map<string, DungeonRoom>, gridSize: number): Vec2[] {
  const from = roomById.get(route.fromRoomId);
  const to = roomById.get(route.toRoomId);
  if (!from || !to) {
    return [];
  }

  const snap = (value: number) => snapValue(value, gridSize);

  return [
    [snap(from.center[0]), snap(from.center[2])],
    ...((route.waypoints ?? []).map((waypoint) => [snap(waypoint[0]), snap(waypoint[1])] as Vec2)),
    [snap(to.center[0]), snap(to.center[2])],
  ];
}

function addCorridorSegmentCells(
  cells: Map<string, FloorCellTag>,
  start: Vec2,
  end: Vec2,
  width: number,
  cellSize: number,
) {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];

  if (Math.abs(dx) > 0.001 && Math.abs(dz) > 0.001) {
    const corner: Vec2 = [end[0], start[1]];
    addCorridorSegmentCells(cells, start, corner, width, cellSize);
    addCorridorSegmentCells(cells, corner, end, width, cellSize);
    return;
  }

  if (Math.abs(dx) <= 0.001 && Math.abs(dz) <= 0.001) return;

  if (Math.abs(dx) > Math.abs(dz)) {
    addRectCells(
      cells,
      Math.min(start[0], end[0]) - cellSize * 0.5,
      Math.max(start[0], end[0]) + cellSize * 0.5,
      start[1] - width * 0.5,
      start[1] + width * 0.5,
      cellSize,
      {
        room: false,
        corridor: true,
      },
    );
  } else {
    addRectCells(
      cells,
      start[0] - width * 0.5,
      start[0] + width * 0.5,
      Math.min(start[1], end[1]) - cellSize * 0.5,
      Math.max(start[1], end[1]) + cellSize * 0.5,
      cellSize,
      {
        room: false,
        corridor: true,
      },
    );
  }
}

function buildFloorCells(layout: DungeonLayoutGraph) {
  const cells = new Map<string, FloorCellTag>();
  const roomById = new Map(layout.rooms.map((room) => [room.id, room]));

  for (let i = 0; i < layout.rooms.length; i += 1) {
    addRoomCells(cells, layout.rooms[i], layout.gridSize);
  }

  for (let i = 0; i < layout.routes.length; i += 1) {
    const route = layout.routes[i];
    const points = getRoutePoints(route, roomById, layout.gridSize);
    if (points.length < 2) continue;
    for (let p = 0; p < points.length - 1; p += 1) {
      addCorridorSegmentCells(cells, points[p], points[p + 1], route.width, layout.gridSize);
    }
  }

  return cells;
}

function mergeFloorRects(cells: Set<string>): FloorRect[] {
  const unvisited = new Set(cells);
  const rects: FloorRect[] = [];

  while (unvisited.size > 0) {
    const key = unvisited.values().next().value as string;
    const [ixStart, izStart] = parseCellKey(key);

    let width = 1;
    while (unvisited.has(cellKey(ixStart + width, izStart))) {
      width += 1;
    }

    let height = 1;
    heightLoop: while (true) {
      const iz = izStart + height;
      for (let dx = 0; dx < width; dx += 1) {
        if (!unvisited.has(cellKey(ixStart + dx, iz))) {
          break heightLoop;
        }
      }
      height += 1;
    }

    for (let dz = 0; dz < height; dz += 1) {
      for (let dx = 0; dx < width; dx += 1) {
        unvisited.delete(cellKey(ixStart + dx, izStart + dz));
      }
    }

    rects.push({
      ixMin: ixStart,
      ixMax: ixStart + width - 1,
      izMin: izStart,
      izMax: izStart + height - 1,
    });
  }

  return rects;
}

function rectKeys(rect: FloorRect): string[] {
  const keys: string[] = [];
  for (let ix = rect.ixMin; ix <= rect.ixMax; ix += 1) {
    for (let iz = rect.izMin; iz <= rect.izMax; iz += 1) {
      keys.push(cellKey(ix, iz));
    }
  }
  return keys;
}

function rectIsCorridorOnly(rect: FloorRect, cellMap: Map<string, FloorCellTag>) {
  const keys = rectKeys(rect);
  for (let i = 0; i < keys.length; i += 1) {
    const tag = cellMap.get(keys[i]);
    if (!tag) continue;
    if (tag.room) return false;
  }
  return true;
}

function dominantRectTheme(rect: FloorRect, cellMap: Map<string, FloorCellTag>): DungeonRoomTheme | undefined {
  const counts = new Map<DungeonRoomTheme, number>();
  const keys = rectKeys(rect);

  for (let i = 0; i < keys.length; i += 1) {
    const tag = cellMap.get(keys[i]);
    if (!tag?.theme) continue;
    counts.set(tag.theme, (counts.get(tag.theme) ?? 0) + 1);
  }

  let bestTheme: DungeonRoomTheme | undefined;
  let bestCount = -1;
  for (const [theme, count] of counts.entries()) {
    if (count > bestCount) {
      bestTheme = theme;
      bestCount = count;
    }
  }

  return bestTheme;
}

function pushMergedFloors(
  layout: DungeonLayoutGraph,
  result: DungeonBuildResult,
  cellMap: Map<string, FloorCellTag>,
) {
  const rects = mergeFloorRects(new Set(cellMap.keys()));
  for (let i = 0; i < rects.length; i += 1) {
    const rect = rects[i];
    const cellsX = rect.ixMax - rect.ixMin + 1;
    const cellsZ = rect.izMax - rect.izMin + 1;
    const centerX = (rect.ixMin + rect.ixMax + 1) * layout.gridSize * 0.5;
    const centerZ = (rect.izMin + rect.izMax + 1) * layout.gridSize * 0.5;

    const corridorOnly = rectIsCorridorOnly(rect, cellMap);
    const theme = dominantRectTheme(rect, cellMap);

    const kind: DungeonPieceKind = corridorOnly ? 'corridor-floor' : 'floor';
    const nodeKey = corridorOnly
      ? DUNGEON_STRUCTURAL_KEYS.floors[0]
      : FLOOR_BY_THEME[theme ?? 'hall'] ?? DUNGEON_STRUCTURAL_KEYS.floors[0];

    addPieceAndCollider(result.pieces, result.colliders, {
      id: `floor-rect-${i}`,
      kind,
      nodeKey,
      position: [centerX, -FLOOR_THICKNESS * 0.5, centerZ],
      size: [
        cellsX * layout.gridSize + FLOOR_OVERLAP,
        FLOOR_THICKNESS,
        cellsZ * layout.gridSize + FLOOR_OVERLAP,
      ],
      rotationY: 0,
    });
  }

  for (const key of cellMap.keys()) {
    const [ix, iz] = parseCellKey(key);
    result.walkableTiles.push({
      x: (ix + 0.5) * layout.gridSize,
      z: (iz + 0.5) * layout.gridSize,
      halfSize: layout.gridSize * 0.5,
      lift: 0,
    });
  }
}

function collectWallEdges(
  layout: DungeonLayoutGraph,
  cellMap: Map<string, FloorCellTag>,
): Map<string, WallEdgeGroup> {
  const groups = new Map<string, WallEdgeGroup>();

  const pushEdge = (
    orientation: 'x' | 'z',
    coord: number,
    start: number,
    kind: 'room-wall' | 'corridor-wall',
    nodeKey: string,
  ) => {
    const key = `${orientation}|${coord}|${kind}|${nodeKey}`;
    const existing = groups.get(key);
    if (existing) {
      existing.starts.push(start);
      return;
    }
    groups.set(key, {
      orientation,
      coord,
      kind,
      nodeKey,
      starts: [start],
    });
  };

  for (const [key, tag] of cellMap.entries()) {
    const [ix, iz] = parseCellKey(key);
    const wallKind: 'room-wall' | 'corridor-wall' = tag.room ? 'room-wall' : 'corridor-wall';
    const wallNode = getRoomWallNode(tag.theme);

    if (!cellMap.has(cellKey(ix, iz + 1))) {
      pushEdge('x', iz + 1, ix, wallKind, wallNode);
    }
    if (!cellMap.has(cellKey(ix, iz - 1))) {
      pushEdge('x', iz, ix, wallKind, wallNode);
    }
    if (!cellMap.has(cellKey(ix + 1, iz))) {
      pushEdge('z', ix + 1, iz, wallKind, wallNode);
    }
    if (!cellMap.has(cellKey(ix - 1, iz))) {
      pushEdge('z', ix, iz, wallKind, wallNode);
    }
  }

  return groups;
}

function pushMergedWalls(
  layout: DungeonLayoutGraph,
  result: DungeonBuildResult,
  wallGroups: Map<string, WallEdgeGroup>,
) {
  const wallY = WALL_HEIGHT * 0.5;

  for (const [groupKey, group] of wallGroups.entries()) {
    const starts = [...new Set(group.starts)].sort((a, b) => a - b);
    if (!starts.length) continue;

    let runStart = starts[0];
    let previous = starts[0];

    const emitRun = (start: number, end: number) => {
      const cells = end - start + 1;
      if (group.orientation === 'x') {
        const centerX = (start + end + 1) * layout.gridSize * 0.5;
        const centerZ = group.coord * layout.gridSize;
        addPieceAndCollider(result.pieces, result.colliders, {
          id: `wall-${groupKey}-${start}-${end}`,
          kind: group.kind,
          nodeKey: group.nodeKey,
          position: [centerX, wallY, centerZ],
          size: [cells * layout.gridSize + WALL_OVERLAP, WALL_HEIGHT, WALL_THICKNESS],
          rotationY: 0,
        });
      } else {
        const centerX = group.coord * layout.gridSize;
        const centerZ = (start + end + 1) * layout.gridSize * 0.5;
        addPieceAndCollider(result.pieces, result.colliders, {
          id: `wall-${groupKey}-${start}-${end}`,
          kind: group.kind,
          nodeKey: group.nodeKey,
          position: [centerX, wallY, centerZ],
          size: [WALL_THICKNESS, WALL_HEIGHT, cells * layout.gridSize + WALL_OVERLAP],
          rotationY: Math.PI * 0.5,
        });
      }
    };

    for (let i = 1; i < starts.length; i += 1) {
      const value = starts[i];
      if (value === previous + 1) {
        previous = value;
        continue;
      }
      emitRun(runStart, previous);
      runStart = value;
      previous = value;
    }

    emitRun(runStart, previous);
  }
}

function buildSpawnPlatform(layout: DungeonLayoutGraph, result: DungeonBuildResult) {
  const platform = layout.spawnPlatform;

  addPieceAndCollider(result.pieces, result.colliders, {
    id: 'spawn-platform',
    kind: 'spawn-platform',
    nodeKey: DUNGEON_STRUCTURAL_KEYS.floors[2],
    position: [platform.center[0], platform.center[1], platform.center[2]],
    size: [platform.size.width, platform.size.height, platform.size.depth],
    rotationY: 0,
    roomId: layout.spawnRoomId,
  });

  result.walkableTiles.push({
    x: platform.center[0],
    z: platform.center[2],
    halfSize: Math.min(platform.size.width, platform.size.depth) * 0.5,
    lift: platform.size.height * 0.45,
  });

  for (let i = 0; i < platform.landmarkTorches.length; i += 1) {
    const torch = platform.landmarkTorches[i];
    result.torchAnchors.push({
      id: `spawn-landmark-${i}`,
      position: [torch[0], torch[1], torch[2]],
      rotationY: i % 2 === 0 ? Math.PI * 0.5 : -Math.PI * 0.5,
      source: 'spawn',
    });
  }
}

function pushRoomTorchAnchors(layout: DungeonLayoutGraph, result: DungeonBuildResult) {
  for (let i = 0; i < layout.rooms.length; i += 1) {
    const room = layout.rooms[i];
    if (!room.props?.length) continue;

    const [cx, cy, cz] = room.center;
    for (let p = 0; p < room.props.length; p += 1) {
      const prop = room.props[p];
      if (!/torch/i.test(prop.key)) continue;

      result.torchAnchors.push({
        id: `${room.id}-torch-${p}`,
        position: [cx + prop.offset[0], cy + prop.offset[1], cz + prop.offset[2]],
        rotationY: prop.rotationY ?? 0,
        source: 'room',
      });
    }
  }
}

function pushCorridorTorchAnchors(layout: DungeonLayoutGraph, result: DungeonBuildResult) {
  const roomById = new Map(layout.rooms.map((room) => [room.id, room]));

  for (let i = 0; i < layout.routes.length; i += 1) {
    const route = layout.routes[i];
    const points = getRoutePoints(route, roomById, layout.gridSize);
    for (let p = 0; p < points.length - 1; p += 1) {
      const start = points[p];
      const end = points[p + 1];
      const dx = end[0] - start[0];
      const dz = end[1] - start[1];

      if (Math.abs(dx) > 0.001 && Math.abs(dz) > 0.001) continue;

      const axis: 'x' | 'z' = Math.abs(dx) >= Math.abs(dz) ? 'x' : 'z';
      const length = axis === 'x' ? Math.abs(dx) : Math.abs(dz);
      if (length < 12) continue;

      const centerX = (start[0] + end[0]) * 0.5;
      const centerZ = (start[1] + end[1]) * 0.5;
      const offset = route.width * 0.5 - 1;

      if (axis === 'x') {
        result.torchAnchors.push({
          id: `${route.id}-${p}-torch-north`,
          position: [centerX, 2.2, centerZ + offset],
          rotationY: Math.PI,
          source: 'corridor',
        });
        result.torchAnchors.push({
          id: `${route.id}-${p}-torch-south`,
          position: [centerX, 2.2, centerZ - offset],
          rotationY: 0,
          source: 'corridor',
        });
      } else {
        result.torchAnchors.push({
          id: `${route.id}-${p}-torch-east`,
          position: [centerX + offset, 2.2, centerZ],
          rotationY: -Math.PI * 0.5,
          source: 'corridor',
        });
        result.torchAnchors.push({
          id: `${route.id}-${p}-torch-west`,
          position: [centerX - offset, 2.2, centerZ],
          rotationY: Math.PI * 0.5,
          source: 'corridor',
        });
      }
    }
  }
}

export function buildDungeon(layout: DungeonLayoutGraph = DUNGEON_LAYOUT_GRAPH): DungeonBuildResult {
  const bounds = {
    minX: snapValue(DUNGEON_LAYOUT_BOUNDS.minX, layout.gridSize),
    maxX: snapValue(DUNGEON_LAYOUT_BOUNDS.maxX, layout.gridSize),
    minZ: snapValue(DUNGEON_LAYOUT_BOUNDS.minZ, layout.gridSize),
    maxZ: snapValue(DUNGEON_LAYOUT_BOUNDS.maxZ, layout.gridSize),
  };

  const result: DungeonBuildResult = {
    pieces: [],
    colliders: [],
    torchAnchors: [],
    walkableTiles: [],
    bounds,
    spawnPoint: layout.spawnPoint,
  };

  const cellMap = buildFloorCells(layout);
  pushMergedFloors(layout, result, cellMap);

  const wallGroups = collectWallEdges(layout, cellMap);
  pushMergedWalls(layout, result, wallGroups);

  buildSpawnPlatform(layout, result);
  pushRoomTorchAnchors(layout, result);
  pushCorridorTorchAnchors(layout, result);

  return result;
}

export const BUILT_DUNGEON = buildDungeon();
