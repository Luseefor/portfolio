export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

export type DungeonRoomTheme =
  | 'spawn'
  | 'hall'
  | 'crossroads'
  | 'chapel'
  | 'crypt'
  | 'reliquary'
  | 'treasury'
  | 'watch';

export type DungeonRouteKind = 'main' | 'loop';

export type DungeonRoomProp = {
  key: string;
  offset: Vec3;
  rotationY?: number;
};

export type DungeonRoom = {
  id: string;
  center: Vec3;
  size: {
    width: number;
    depth: number;
    height: number;
  };
  theme: DungeonRoomTheme;
  props?: DungeonRoomProp[];
};

export type DungeonRoute = {
  id: string;
  fromRoomId: string;
  toRoomId: string;
  kind: DungeonRouteKind;
  width: number;
  waypoints?: Vec2[];
};

export type DungeonSpawnPlatform = {
  center: Vec3;
  size: {
    width: number;
    depth: number;
    height: number;
  };
  landmarkTorches: Vec3[];
};

export type DungeonLayoutGraph = {
  seed: number;
  gridSize: number;
  spawnRoomId: string;
  spawnPoint: Vec3;
  spawnPlatform: DungeonSpawnPlatform;
  rooms: DungeonRoom[];
  routes: DungeonRoute[];
};

export const DUNGEON_STRUCTURAL_KEYS = {
  floors: ['Floor_Standard', 'Floor_Squares', 'Floor_SquareLarge'] as const,
  walls: ['Wall', 'Wall_Overgrown', 'Wall_Broken'] as const,
  arches: ['Arch_Gothic', 'Wall_ArchGothic', 'Wall_ArchRound'] as const,
  pillars: ['Column_Round', 'Column_Square'] as const,
  torches: ['Torch'] as const,
} as const;

export const DUNGEON_LAYOUT_GRAPH: DungeonLayoutGraph = {
  seed: 1337,
  gridSize: 2,
  spawnRoomId: 'spawn-hall',
  spawnPoint: [0, 2.5, -2.5],
  spawnPlatform: {
    center: [0, 0.4, -2.5],
    size: {
      width: 6,
      depth: 6,
      height: 0.8,
    },
    landmarkTorches: [
      [-2.8, 2.2, -5.0],
      [2.8, 2.2, -5.0],
      [-2.8, 2.2, 0.0],
      [2.8, 2.2, 0.0],
    ],
  },
  rooms: [
    {
      id: 'spawn-hall',
      center: [0, 0, 0],
      size: { width: 14, depth: 12, height: 8 },
      theme: 'spawn',
      props: [
        { key: 'Torch', offset: [-5.6, 2.2, -2.4], rotationY: Math.PI / 2 },
        { key: 'Torch', offset: [5.6, 2.2, -2.4], rotationY: -Math.PI / 2 },
      ],
    },
    {
      id: 'anteroom',
      center: [0, 0, 18],
      size: { width: 12, depth: 10, height: 8 },
      theme: 'hall',
    },
    {
      id: 'crossroads',
      center: [16, 0, 18],
      size: { width: 12, depth: 12, height: 8.5 },
      theme: 'crossroads',
    },
    {
      id: 'chapel',
      center: [16, 0, 36],
      size: { width: 16, depth: 14, height: 9 },
      theme: 'chapel',
    },
    {
      id: 'western-cell',
      center: [-16, 0, 18],
      size: { width: 12, depth: 12, height: 8 },
      theme: 'crypt',
    },
    {
      id: 'reliquary',
      center: [-16, 0, 36],
      size: { width: 14, depth: 12, height: 8.5 },
      theme: 'reliquary',
    },
    {
      id: 'treasury',
      center: [0, 0, 54],
      size: { width: 18, depth: 14, height: 9 },
      theme: 'treasury',
      props: [{ key: 'Torch', offset: [0, 2.2, -6], rotationY: Math.PI }],
    },
    {
      id: 'east-watch',
      center: [32, 0, 30],
      size: { width: 12, depth: 10, height: 8 },
      theme: 'watch',
    },
  ],
  routes: [
    {
      id: 'main-spawn-anteroom',
      fromRoomId: 'spawn-hall',
      toRoomId: 'anteroom',
      kind: 'main',
      width: 6,
      waypoints: [[0, 8]],
    },
    {
      id: 'main-anteroom-crossroads',
      fromRoomId: 'anteroom',
      toRoomId: 'crossroads',
      kind: 'main',
      width: 6,
    },
    {
      id: 'main-crossroads-chapel',
      fromRoomId: 'crossroads',
      toRoomId: 'chapel',
      kind: 'main',
      width: 6,
    },
    {
      id: 'main-chapel-treasury',
      fromRoomId: 'chapel',
      toRoomId: 'treasury',
      kind: 'main',
      width: 6,
      waypoints: [
        [8, 44],
        [0, 44],
      ],
    },
    {
      id: 'loop-anteroom-western',
      fromRoomId: 'anteroom',
      toRoomId: 'western-cell',
      kind: 'loop',
      width: 6,
    },
    {
      id: 'loop-western-reliquary',
      fromRoomId: 'western-cell',
      toRoomId: 'reliquary',
      kind: 'loop',
      width: 6,
    },
    {
      id: 'loop-reliquary-treasury',
      fromRoomId: 'reliquary',
      toRoomId: 'treasury',
      kind: 'loop',
      width: 6,
      waypoints: [[-8, 46]],
    },
    {
      id: 'loop-crossroads-east-watch',
      fromRoomId: 'crossroads',
      toRoomId: 'east-watch',
      kind: 'loop',
      width: 6,
      waypoints: [
        [24, 18],
        [24, 30],
      ],
    },
    {
      id: 'loop-east-watch-chapel',
      fromRoomId: 'east-watch',
      toRoomId: 'chapel',
      kind: 'loop',
      width: 6,
      waypoints: [[24, 36]],
    },
  ],
};

function extentsFromRoom(room: DungeonRoom) {
  const [cx, , cz] = room.center;
  const halfWidth = room.size.width / 2;
  const halfDepth = room.size.depth / 2;
  return {
    minX: cx - halfWidth,
    maxX: cx + halfWidth,
    minZ: cz - halfDepth,
    maxZ: cz + halfDepth,
  };
}

function extentsFromRoute(route: DungeonRoute, roomById: Map<string, DungeonRoom>) {
  const from = roomById.get(route.fromRoomId);
  const to = roomById.get(route.toRoomId);
  if (!from || !to) {
    return null;
  }

  const points: Vec2[] = [
    [from.center[0], from.center[2]],
    ...(route.waypoints ?? []),
    [to.center[0], to.center[2]],
  ];

  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  const halfWidth = route.width / 2;

  for (let i = 0; i < points.length; i += 1) {
    const [x, z] = points[i];
    minX = Math.min(minX, x - halfWidth);
    maxX = Math.max(maxX, x + halfWidth);
    minZ = Math.min(minZ, z - halfWidth);
    maxZ = Math.max(maxZ, z + halfWidth);
  }

  return { minX, maxX, minZ, maxZ };
}

export function computeDungeonLayoutBounds(layout: DungeonLayoutGraph, padding = 6) {
  const roomById = new Map(layout.rooms.map((room) => [room.id, room]));
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < layout.rooms.length; i += 1) {
    const extents = extentsFromRoom(layout.rooms[i]);
    minX = Math.min(minX, extents.minX);
    maxX = Math.max(maxX, extents.maxX);
    minZ = Math.min(minZ, extents.minZ);
    maxZ = Math.max(maxZ, extents.maxZ);
  }

  for (let i = 0; i < layout.routes.length; i += 1) {
    const extents = extentsFromRoute(layout.routes[i], roomById);
    if (!extents) continue;
    minX = Math.min(minX, extents.minX);
    maxX = Math.max(maxX, extents.maxX);
    minZ = Math.min(minZ, extents.minZ);
    maxZ = Math.max(maxZ, extents.maxZ);
  }

  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minZ: minZ - padding,
    maxZ: maxZ + padding,
  };
}

export const DUNGEON_LAYOUT_BOUNDS = computeDungeonLayoutBounds(DUNGEON_LAYOUT_GRAPH);

export const DUNGEON_ROUTE_SUMMARY = {
  roomCount: DUNGEON_LAYOUT_GRAPH.rooms.length,
  routeCount: DUNGEON_LAYOUT_GRAPH.routes.length,
  mainRouteCount: DUNGEON_LAYOUT_GRAPH.routes.filter((route) => route.kind === 'main').length,
  loopRouteCount: DUNGEON_LAYOUT_GRAPH.routes.filter((route) => route.kind === 'loop').length,
};

// ---------------------------------------------------------------------------
// Legacy compatibility exports (kept to avoid touching unrelated systems).
// ---------------------------------------------------------------------------
export interface DungeonPlacement {
  key: string;
  pos: [number, number, number];
  rotY?: number;
  scale?: number;
}

export const DUNGEON_SCALE = 1;
export const DUNGEON_TILE_SIZE = 4;
export const DUNGEON_FLOOR_THICKNESS = 0.5;
export const DUNGEON_WALL_HEIGHT = 7;
export const DUNGEON_WALL_THICKNESS = 1;
export const DUNGEON_COLUMN_RADIUS = 0.6;
export const DUNGEON_COLUMN_HEIGHT = DUNGEON_WALL_HEIGHT;

const LEGACY_FLOOR_BY_THEME: Record<DungeonRoomTheme, string> = {
  spawn: 'Floor_SquareLarge',
  hall: 'Floor_Standard',
  crossroads: 'Floor_Squares',
  chapel: 'Floor_SquareLarge',
  crypt: 'Floor_Standard',
  reliquary: 'Floor_Squares',
  treasury: 'Floor_SquareLarge',
  watch: 'Floor_Standard',
};

export const DUNGEON_LAYOUT: DungeonPlacement[] = DUNGEON_LAYOUT_GRAPH.rooms.flatMap((room) => {
  const [cx, cy, cz] = room.center;
  return [
    {
      key: LEGACY_FLOOR_BY_THEME[room.theme] ?? DUNGEON_STRUCTURAL_KEYS.floors[0],
      pos: [cx, cy, cz],
    },
    {
      key: DUNGEON_STRUCTURAL_KEYS.walls[0],
      pos: [cx, cy, cz + room.size.depth / 2 - DUNGEON_WALL_THICKNESS / 2],
      rotY: 0,
    },
  ];
});

export type ChestPOI = {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  interactionRadius: number;
  loot?: {
    type: 'project' | 'artifact' | 'secret';
    label: string;
    url?: string;
  };
};

export const CHEST_POIS: ChestPOI[] = [
  {
    id: 'spawn-cache',
    title: 'Spawn Cache',
    description: 'Starter loot near the spawn platform.',
    position: [0, 0, -3],
    interactionRadius: 2.2,
    loot: { type: 'project', label: 'Open Cache' },
  },
  {
    id: 'chapel-relic',
    title: 'Chapel Relic',
    description: 'A relic chest tucked inside the chapel room.',
    position: [16, 0, 38],
    interactionRadius: 2.2,
    loot: { type: 'artifact', label: 'Inspect Relic' },
  },
  {
    id: 'treasury-vault',
    title: 'Treasury Vault',
    description: 'The main vault chest at the end of the main route.',
    position: [0, 0, 56],
    interactionRadius: 2.5,
    loot: { type: 'secret', label: 'Unlock Vault' },
  },
];

export const TORCH_PLACEMENTS: Array<{
  position: [number, number, number];
  rotation?: [number, number, number];
}> = [
  ...DUNGEON_LAYOUT_GRAPH.spawnPlatform.landmarkTorches.map((torch) => ({
    position: [torch[0], torch[1], torch[2]] as [number, number, number],
  })),
  { position: [0, 2.2, 10], rotation: [0, Math.PI, 0] },
  { position: [16, 2.2, 24], rotation: [0, Math.PI / 2, 0] },
  { position: [-16, 2.2, 30], rotation: [0, -Math.PI / 2, 0] },
  { position: [6, 2.2, 48], rotation: [0, Math.PI, 0] },
];
