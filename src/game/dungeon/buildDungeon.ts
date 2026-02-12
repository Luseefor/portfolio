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

type RoomSide = 'north' | 'south' | 'east' | 'west';

const FLOOR_THICKNESS = 0.5;
const WALL_THICKNESS = 1;
const WALL_HEIGHT = 7;
const OPENING_PADDING = 0.75;
const ARCH_HEIGHT = 4.6;
const ARCH_THICKNESS = 1;
const PILLAR_SIZE = 1.2;
const BOUNDARY_WALL_HEIGHT = 11;
const BOUNDARY_WALL_THICKNESS = 2.2;
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

function snapPoint(point: Vec2, gridSize: number): Vec2 {
  return [snapValue(point[0], gridSize), snapValue(point[1], gridSize)] as const;
}

function sideFromDelta(dx: number, dz: number): RoomSide {
  if (Math.abs(dx) >= Math.abs(dz)) {
    return dx >= 0 ? 'east' : 'west';
  }
  return dz >= 0 ? 'north' : 'south';
}

function pushRoomOpening(openings: Map<string, Set<RoomSide>>, roomId: string, side: RoomSide) {
  const existing = openings.get(roomId);
  if (existing) {
    existing.add(side);
    return;
  }
  openings.set(roomId, new Set<RoomSide>([side]));
}

function getDoorPoint(room: DungeonRoom, side: RoomSide, gridSize: number): Vec2 {
  const [cx, , cz] = room.center;
  const halfWidth = room.size.width / 2 - WALL_THICKNESS / 2;
  const halfDepth = room.size.depth / 2 - WALL_THICKNESS / 2;

  let point: Vec2 = [cx, cz];
  if (side === 'north') point = [cx, cz + halfDepth];
  else if (side === 'south') point = [cx, cz - halfDepth];
  else if (side === 'east') point = [cx + halfWidth, cz];
  else if (side === 'west') point = [cx - halfWidth, cz];

  return snapPoint(point, gridSize);
}

type RouteConnection = {
  fromRoom: DungeonRoom;
  toRoom: DungeonRoom;
  fromSide: RoomSide;
  toSide: RoomSide;
  waypoints: Vec2[];
  startDoor: Vec2;
  endDoor: Vec2;
};

function getRouteConnection(
  route: DungeonRoute,
  roomById: Map<string, DungeonRoom>,
  gridSize: number,
): RouteConnection | null {
  const fromRoom = roomById.get(route.fromRoomId);
  const toRoom = roomById.get(route.toRoomId);
  if (!fromRoom || !toRoom) return null;

  const fromCenter = snapPoint([fromRoom.center[0], fromRoom.center[2]], gridSize);
  const toCenter = snapPoint([toRoom.center[0], toRoom.center[2]], gridSize);
  const waypoints = ((route.waypoints ?? []).map((waypoint) => snapPoint(waypoint, gridSize)) as Vec2[]);

  const startReference = waypoints.length > 0 ? waypoints[0] : toCenter;
  const endReference = waypoints.length > 0 ? waypoints[waypoints.length - 1] : fromCenter;

  const fromSide = sideFromDelta(
    startReference[0] - fromCenter[0],
    startReference[1] - fromCenter[1],
  );
  const toSide = sideFromDelta(
    endReference[0] - toCenter[0],
    endReference[1] - toCenter[1],
  );

  return {
    fromRoom,
    toRoom,
    fromSide,
    toSide,
    waypoints,
    startDoor: getDoorPoint(fromRoom, fromSide, gridSize),
    endDoor: getDoorPoint(toRoom, toSide, gridSize),
  };
}

function getRoutePoints(route: DungeonRoute, roomById: Map<string, DungeonRoom>, gridSize: number): Vec2[] {
  const connection = getRouteConnection(route, roomById, gridSize);
  if (!connection) return [];
  return [connection.startDoor, ...connection.waypoints, connection.endDoor];
}

function collectRoomOpenings(layout: DungeonLayoutGraph, roomById: Map<string, DungeonRoom>) {
  const openings = new Map<string, Set<RoomSide>>();
  for (let i = 0; i < layout.routes.length; i += 1) {
    const route = layout.routes[i];
    const connection = getRouteConnection(route, roomById, layout.gridSize);
    if (!connection) continue;
    pushRoomOpening(openings, connection.fromRoom.id, connection.fromSide);
    pushRoomOpening(openings, connection.toRoom.id, connection.toSide);
  }
  return openings;
}

function getRoomWallNode(theme: DungeonRoomTheme) {
  return WALL_BY_THEME[theme] ?? DUNGEON_STRUCTURAL_KEYS.walls[0];
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

function addPiece(pieces: DungeonBuildPiece[], piece: DungeonBuildPiece) {
  pieces.push(normalizePiece(piece));
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

function buildRoom(
  room: DungeonRoom,
  openings: Set<RoomSide> | undefined,
  result: DungeonBuildResult,
) {
  const [cx, cy, cz] = room.center;
  const halfWidth = room.size.width / 2;
  const halfDepth = room.size.depth / 2;

  const floorNode = FLOOR_BY_THEME[room.theme] ?? DUNGEON_STRUCTURAL_KEYS.floors[0];

  addPieceAndCollider(result.pieces, result.colliders, {
    id: `${room.id}-floor`,
    kind: 'floor',
    nodeKey: floorNode,
    position: [cx, cy - FLOOR_THICKNESS / 2, cz],
    size: [room.size.width, FLOOR_THICKNESS, room.size.depth],
    rotationY: 0,
    roomId: room.id,
  });

  result.walkableTiles.push({
    x: cx,
    z: cz,
    halfSize: Math.max(room.size.width, room.size.depth) / 2,
    lift: 0,
  });

  const openingWidth = Math.max(3.4, Math.min(6.5, room.size.width * 0.4));
  const wallNode = getRoomWallNode(room.theme);
  const wallY = cy + WALL_HEIGHT / 2;

  const pushWallX = (
    idSuffix: string,
    x: number,
    z: number,
    width: number,
    depth: number,
    side: RoomSide,
  ) => {
    addPieceAndCollider(result.pieces, result.colliders, {
      id: `${room.id}-${idSuffix}`,
      kind: 'room-wall',
      nodeKey: wallNode,
      position: [x, wallY, z],
      size: [width, WALL_HEIGHT, depth],
      rotationY: side === 'east' || side === 'west' ? Math.PI / 2 : 0,
      roomId: room.id,
    });
  };

  const northOpen = openings?.has('north') ?? false;
  const southOpen = openings?.has('south') ?? false;
  const eastOpen = openings?.has('east') ?? false;
  const westOpen = openings?.has('west') ?? false;

  const pushArch = (side: RoomSide) => {
    let position: [number, number, number] = [cx, cy + ARCH_HEIGHT / 2, cz];
    let size: [number, number, number] = [openingWidth + 0.4, ARCH_HEIGHT, ARCH_THICKNESS];
    let rotationY = 0;

    if (side === 'north') {
      position = [cx, cy + ARCH_HEIGHT / 2, cz + halfDepth - WALL_THICKNESS / 2];
      rotationY = Math.PI;
    } else if (side === 'south') {
      position = [cx, cy + ARCH_HEIGHT / 2, cz - halfDepth + WALL_THICKNESS / 2];
      rotationY = 0;
    } else if (side === 'east') {
      position = [cx + halfWidth - WALL_THICKNESS / 2, cy + ARCH_HEIGHT / 2, cz];
      size = [ARCH_THICKNESS, ARCH_HEIGHT, openingWidth + 0.4];
      rotationY = -Math.PI / 2;
    } else if (side === 'west') {
      position = [cx - halfWidth + WALL_THICKNESS / 2, cy + ARCH_HEIGHT / 2, cz];
      size = [ARCH_THICKNESS, ARCH_HEIGHT, openingWidth + 0.4];
      rotationY = Math.PI / 2;
    }

    addPiece(result.pieces, {
      id: `${room.id}-arch-${side}`,
      kind: 'arch',
      nodeKey: DUNGEON_STRUCTURAL_KEYS.arches[0],
      position,
      size,
      rotationY,
      roomId: room.id,
    });
  };

  const northZ = cz + halfDepth - WALL_THICKNESS / 2;
  const southZ = cz - halfDepth + WALL_THICKNESS / 2;
  const eastX = cx + halfWidth - WALL_THICKNESS / 2;
  const westX = cx - halfWidth + WALL_THICKNESS / 2;

  const northLength = room.size.width;
  const sideLength = room.size.depth;

  if (northOpen) {
    const segmentLength = Math.max(
      1,
      (northLength - (openingWidth + OPENING_PADDING * 2)) / 2,
    );
    const offset = openingWidth / 2 + segmentLength / 2 + OPENING_PADDING / 2;
    pushWallX('wall-north-left', cx - offset, northZ, segmentLength, WALL_THICKNESS, 'north');
    pushWallX('wall-north-right', cx + offset, northZ, segmentLength, WALL_THICKNESS, 'north');
    pushArch('north');
  } else {
    pushWallX('wall-north', cx, northZ, northLength, WALL_THICKNESS, 'north');
  }

  if (southOpen) {
    const segmentLength = Math.max(
      1,
      (northLength - (openingWidth + OPENING_PADDING * 2)) / 2,
    );
    const offset = openingWidth / 2 + segmentLength / 2 + OPENING_PADDING / 2;
    pushWallX('wall-south-left', cx - offset, southZ, segmentLength, WALL_THICKNESS, 'south');
    pushWallX('wall-south-right', cx + offset, southZ, segmentLength, WALL_THICKNESS, 'south');
    pushArch('south');
  } else {
    pushWallX('wall-south', cx, southZ, northLength, WALL_THICKNESS, 'south');
  }

  if (eastOpen) {
    const segmentLength = Math.max(
      1,
      (sideLength - (openingWidth + OPENING_PADDING * 2)) / 2,
    );
    const offset = openingWidth / 2 + segmentLength / 2 + OPENING_PADDING / 2;
    pushWallX('wall-east-near', eastX, cz - offset, WALL_THICKNESS, segmentLength, 'east');
    pushWallX('wall-east-far', eastX, cz + offset, WALL_THICKNESS, segmentLength, 'east');
    pushArch('east');
  } else {
    pushWallX('wall-east', eastX, cz, WALL_THICKNESS, sideLength, 'east');
  }

  if (westOpen) {
    const segmentLength = Math.max(
      1,
      (sideLength - (openingWidth + OPENING_PADDING * 2)) / 2,
    );
    const offset = openingWidth / 2 + segmentLength / 2 + OPENING_PADDING / 2;
    pushWallX('wall-west-near', westX, cz - offset, WALL_THICKNESS, segmentLength, 'west');
    pushWallX('wall-west-far', westX, cz + offset, WALL_THICKNESS, segmentLength, 'west');
    pushArch('west');
  } else {
    pushWallX('wall-west', westX, cz, WALL_THICKNESS, sideLength, 'west');
  }

  const pillarOffsetX = Math.max(2.2, halfWidth - 1.6);
  const pillarOffsetZ = Math.max(2.2, halfDepth - 1.6);
  const pillarNode = DUNGEON_STRUCTURAL_KEYS.pillars[room.id.length % DUNGEON_STRUCTURAL_KEYS.pillars.length];
  const pillarPositions: Array<[number, number, number]> = [
    [cx - pillarOffsetX, cy + WALL_HEIGHT / 2, cz - pillarOffsetZ],
    [cx + pillarOffsetX, cy + WALL_HEIGHT / 2, cz - pillarOffsetZ],
    [cx - pillarOffsetX, cy + WALL_HEIGHT / 2, cz + pillarOffsetZ],
    [cx + pillarOffsetX, cy + WALL_HEIGHT / 2, cz + pillarOffsetZ],
  ];

  for (let i = 0; i < pillarPositions.length; i += 1) {
    const [px, py, pz] = pillarPositions[i];
    addPieceAndCollider(result.pieces, result.colliders, {
      id: `${room.id}-pillar-${i}`,
      kind: 'pillar',
      nodeKey: pillarNode,
      position: [px, py, pz],
      size: [PILLAR_SIZE, WALL_HEIGHT, PILLAR_SIZE],
      rotationY: 0,
      roomId: room.id,
    });
  }

  if (room.props && room.props.length > 0) {
    for (let i = 0; i < room.props.length; i += 1) {
      const prop = room.props[i];
      const position: [number, number, number] = [
        cx + prop.offset[0],
        cy + prop.offset[1],
        cz + prop.offset[2],
      ];
      addPiece(result.pieces, {
        id: `${room.id}-prop-${i}`,
        kind: 'prop',
        nodeKey: prop.key,
        position,
        size: [0.9, 1.8, 0.9],
        rotationY: prop.rotationY ?? 0,
        roomId: room.id,
      });

      if (/torch/i.test(prop.key)) {
        result.torchAnchors.push({
          id: `${room.id}-torch-${i}`,
          position,
          rotationY: prop.rotationY ?? 0,
          source: 'room',
        });
      }
    }
  }
}

function pushCorridorSegment(
  start: Vec2,
  end: Vec2,
  route: DungeonRoute,
  routeIndex: number,
  result: DungeonBuildResult,
) {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];

  if (Math.abs(dx) > 0.001 && Math.abs(dz) > 0.001) {
    const corner: Vec2 = [end[0], start[1]];
    pushCorridorSegment(start, corner, route, routeIndex, result);
    pushCorridorSegment(corner, end, route, routeIndex, result);
    return;
  }

  const axis: 'x' | 'z' = Math.abs(dx) >= Math.abs(dz) ? 'x' : 'z';
  const length = axis === 'x' ? Math.abs(dx) : Math.abs(dz);
  if (length < 0.5) return;

  const centerX = (start[0] + end[0]) / 2;
  const centerZ = (start[1] + end[1]) / 2;
  const pointToToken = (point: Vec2) =>
    `${snapValue(point[0], 0.01).toFixed(2)}_${snapValue(point[1], 0.01).toFixed(2)}`;
  const segmentKey = `${route.id}-segment-${routeIndex}-${pointToToken(start)}__${pointToToken(end)}`;

  const floorSize: [number, number, number] =
    axis === 'x'
      ? [length + WALL_THICKNESS, FLOOR_THICKNESS, route.width + WALL_THICKNESS]
      : [route.width + WALL_THICKNESS, FLOOR_THICKNESS, length + WALL_THICKNESS];

  addPieceAndCollider(result.pieces, result.colliders, {
    id: `${segmentKey}-floor`,
    kind: 'corridor-floor',
    nodeKey: DUNGEON_STRUCTURAL_KEYS.floors[route.kind === 'main' ? 0 : 1],
    position: [centerX, -FLOOR_THICKNESS / 2, centerZ],
    size: floorSize,
    rotationY: 0,
    routeId: route.id,
  });

  result.walkableTiles.push({
    x: centerX,
    z: centerZ,
    halfSize: axis === 'x' ? length / 2 : route.width / 2,
    lift: 0,
  });

  const wallNode = DUNGEON_STRUCTURAL_KEYS.walls[route.kind === 'main' ? 0 : 1];
  const corridorWallDepth = axis === 'x' ? WALL_THICKNESS : length + WALL_THICKNESS;
  const corridorWallWidth = axis === 'x' ? length + WALL_THICKNESS : WALL_THICKNESS;
  const wallY = WALL_HEIGHT / 2;
  const offset = route.width / 2 - WALL_THICKNESS / 2;

  if (axis === 'x') {
    addPieceAndCollider(result.pieces, result.colliders, {
      id: `${segmentKey}-wall-north`,
      kind: 'corridor-wall',
      nodeKey: wallNode,
      position: [centerX, wallY, centerZ + offset],
      size: [corridorWallWidth, WALL_HEIGHT, corridorWallDepth],
      rotationY: 0,
      routeId: route.id,
    });

    addPieceAndCollider(result.pieces, result.colliders, {
      id: `${segmentKey}-wall-south`,
      kind: 'corridor-wall',
      nodeKey: wallNode,
      position: [centerX, wallY, centerZ - offset],
      size: [corridorWallWidth, WALL_HEIGHT, corridorWallDepth],
      rotationY: 0,
      routeId: route.id,
    });
  } else {
    addPieceAndCollider(result.pieces, result.colliders, {
      id: `${segmentKey}-wall-east`,
      kind: 'corridor-wall',
      nodeKey: wallNode,
      position: [centerX + offset, wallY, centerZ],
      size: [corridorWallWidth, WALL_HEIGHT, corridorWallDepth],
      rotationY: Math.PI / 2,
      routeId: route.id,
    });

    addPieceAndCollider(result.pieces, result.colliders, {
      id: `${segmentKey}-wall-west`,
      kind: 'corridor-wall',
      nodeKey: wallNode,
      position: [centerX - offset, wallY, centerZ],
      size: [corridorWallWidth, WALL_HEIGHT, corridorWallDepth],
      rotationY: Math.PI / 2,
      routeId: route.id,
    });
  }

  if (length >= 8) {
    const torchOffset = route.width / 2 - 0.8;
    if (axis === 'x') {
      result.torchAnchors.push({
        id: `${segmentKey}-torch-north`,
        position: [centerX, 2.2, centerZ + torchOffset],
        rotationY: Math.PI,
        source: 'corridor',
      });
      result.torchAnchors.push({
        id: `${segmentKey}-torch-south`,
        position: [centerX, 2.2, centerZ - torchOffset],
        rotationY: 0,
        source: 'corridor',
      });
    } else {
      result.torchAnchors.push({
        id: `${segmentKey}-torch-east`,
        position: [centerX + torchOffset, 2.2, centerZ],
        rotationY: -Math.PI / 2,
        source: 'corridor',
      });
      result.torchAnchors.push({
        id: `${segmentKey}-torch-west`,
        position: [centerX - torchOffset, 2.2, centerZ],
        rotationY: Math.PI / 2,
        source: 'corridor',
      });
    }
  }
}

function buildRoute(route: DungeonRoute, roomById: Map<string, DungeonRoom>, layout: DungeonLayoutGraph, result: DungeonBuildResult) {
  const points = getRoutePoints(route, roomById, layout.gridSize);
  if (points.length < 2) return;

  for (let i = 0; i < points.length - 1; i += 1) {
    pushCorridorSegment(points[i], points[i + 1], route, i, result);
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
    halfSize: Math.max(platform.size.width, platform.size.depth) / 2,
    lift: platform.size.height * 0.45,
  });

  for (let i = 0; i < platform.landmarkTorches.length; i += 1) {
    const torch = platform.landmarkTorches[i];
    result.torchAnchors.push({
      id: `spawn-landmark-${i}`,
      position: [torch[0], torch[1], torch[2]],
      rotationY: i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2,
      source: 'spawn',
    });
  }
}

function buildBoundaryWalls(result: DungeonBuildResult) {
  const bounds = result.bounds;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const y = BOUNDARY_WALL_HEIGHT / 2;

  const boundarySpecs: Array<{
    id: string;
    position: [number, number, number];
    size: [number, number, number];
    rotationY: number;
  }> = [
    {
      id: 'boundary-east',
      position: [bounds.maxX + BOUNDARY_WALL_THICKNESS / 2, y, centerZ],
      size: [BOUNDARY_WALL_THICKNESS, BOUNDARY_WALL_HEIGHT, depth + BOUNDARY_WALL_THICKNESS * 2],
      rotationY: Math.PI / 2,
    },
    {
      id: 'boundary-west',
      position: [bounds.minX - BOUNDARY_WALL_THICKNESS / 2, y, centerZ],
      size: [BOUNDARY_WALL_THICKNESS, BOUNDARY_WALL_HEIGHT, depth + BOUNDARY_WALL_THICKNESS * 2],
      rotationY: Math.PI / 2,
    },
    {
      id: 'boundary-north',
      position: [centerX, y, bounds.maxZ + BOUNDARY_WALL_THICKNESS / 2],
      size: [width + BOUNDARY_WALL_THICKNESS * 2, BOUNDARY_WALL_HEIGHT, BOUNDARY_WALL_THICKNESS],
      rotationY: 0,
    },
    {
      id: 'boundary-south',
      position: [centerX, y, bounds.minZ - BOUNDARY_WALL_THICKNESS / 2],
      size: [width + BOUNDARY_WALL_THICKNESS * 2, BOUNDARY_WALL_HEIGHT, BOUNDARY_WALL_THICKNESS],
      rotationY: 0,
    },
  ];

  for (let i = 0; i < boundarySpecs.length; i += 1) {
    const spec = boundarySpecs[i];
    addPieceAndCollider(result.pieces, result.colliders, {
      id: spec.id,
      kind: 'boundary-wall',
      nodeKey: DUNGEON_STRUCTURAL_KEYS.walls[0],
      position: spec.position,
      size: spec.size,
      rotationY: spec.rotationY,
    });
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

  const roomById = new Map(layout.rooms.map((room) => [room.id, room]));
  const roomOpenings = collectRoomOpenings(layout, roomById);

  buildSpawnPlatform(layout, result);

  for (let i = 0; i < layout.rooms.length; i += 1) {
    const room = layout.rooms[i];
    buildRoom(room, roomOpenings.get(room.id), result);
  }

  for (let i = 0; i < layout.routes.length; i += 1) {
    buildRoute(layout.routes[i], roomById, layout, result);
  }

  buildBoundaryWalls(result);

  return result;
}

export const BUILT_DUNGEON = buildDungeon();
