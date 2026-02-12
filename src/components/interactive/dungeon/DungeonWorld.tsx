'use client';

import { useEffect, useMemo } from 'react';
import { Box3, MeshStandardMaterial, Vector3, type Object3D } from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { clearDungeonVisualLiftTiles, setDungeonVisualLiftTiles } from '@/lib/dungeonVisualLift';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';

type Vec3 = [number, number, number];

type WallOpening = {
  north?: boolean;
  south?: boolean;
  east?: boolean;
  west?: boolean;
};

type RoomSpec = {
  id: string;
  center: Vec3;
  size: { w: number; d: number };
  height?: number;
  theme?: string;
  pattern?: FloorPatternKind;
  openings?: WallOpening;
};

type CorridorSpec = {
  id: string;
  center: Vec3;
  length: number;
  width: number;
  axis: 'x' | 'z';
  height?: number;
  theme?: string;
  pattern?: FloorPatternKind;
};

type FloorPatternKind = 'rings' | 'checker' | 'spokes' | 'stripes';

const WALL_HEIGHT = 21;
const DEFAULT_ROOM_HEIGHT = 18;
const DEFAULT_CORRIDOR_HEIGHT = 15;
const WALL_THICKNESS = 0.8;
const FLOOR_THICKNESS = 0.45;
const CEILING_THICKNESS = 0.35;
const DOOR_WIDTH = 6;
const FLOOR_TILE_OVERLAP = 0.025;
const FLOOR_MIN_STEP = 1.2;
const FLOOR_MAX_STEP = 6;
const FLOOR_MAX_TILES = 14000;
const FLOOR_MAX_RENDER_OBJECTS = 14000;
const UNDERFLOOR_SIZE: Vec3 = [220, 0.2, 220];
const UNDERFLOOR_Y = -0.2;
const OUTER_BORDER_THICKNESS = 1.2;
const OUTER_BORDER_HEIGHT = 28;
const OUTER_BORDER_SINK = 0.4;
const WALL_COLLIDER_THICKNESS = 1.8;
const WALL_COLLIDER_LENGTH_PAD = 0.2;
const WALKABLE_COLLIDER_OVERLAP = 1.0;
const WALKABLE_COLLIDER_THICKNESS = 0.36;
const WALKABLE_COLLIDER_Y = -0.18;

type BoxPiece = {
  id: string;
  size: Vec3;
  position: Vec3;
  material: MeshStandardMaterial;
  visible?: boolean;
};

const floorMaterial = new MeshStandardMaterial({
  color: '#2a2b28',
  roughness: 0.95,
  metalness: 0.05,
});
const wallMaterial = new MeshStandardMaterial({
  color: '#2f312d',
  roughness: 0.95,
  metalness: 0.04,
});
const ceilingMaterial = new MeshStandardMaterial({
  color: '#171915',
  roughness: 0.99,
  metalness: 0.02,
});
const underfloorMaterial = new MeshStandardMaterial({
  color: '#4f4a3e',
  roughness: 0.97,
  metalness: 0.01,
});

const FLOOR_NODES = [
  'Floor_Diamond',
  'Floor_Squares',
  'Floor_Standard',
  'Floor_Standard_Half',
  'Floor_SquareLarge',
  'Floor_Hole_Straight',
] as const;

const SHOW_FLOOR_GRID = false;
const FLOOR_OVERLAY = true;
const SHOW_WALL_DECOR = false;
const FLOOR_TILES = {
  primary: 'Floor_Squares',
  accent: 'Floor_Standard',
  filler: 'Floor_Standard',
} as const;
const LIFTED_TILE_VISUAL_HEIGHT = 0.23;

const ROOM_TILE_THEMES: Record<
  string,
  {
    primary: string;
    accent: string;
    filler: string;
  }
> = {
  entrance: {
    primary: 'Floor_Squares',
    accent: 'Floor_Standard',
    filler: 'Floor_Standard',
  },
  chapel: {
    primary: 'Floor_Diamond',
    accent: 'Floor_Squares',
    filler: 'Floor_Standard',
  },
  ossuary: {
    primary: 'Floor_Standard',
    accent: 'Floor_Diamond',
    filler: 'Floor_Squares',
  },
  reliquary: {
    primary: 'Floor_Standard',
    accent: 'Floor_Squares',
    filler: 'Floor_Diamond',
  },
  catacomb: {
    primary: 'Floor_Squares',
    accent: 'Floor_Standard',
    filler: 'Floor_Standard',
  },
  crypt: {
    primary: 'Floor_Diamond',
    accent: 'Floor_Standard',
    filler: 'Floor_Standard',
  },
  'corridor-main': {
    primary: 'Floor_Standard',
    accent: 'Floor_Squares',
    filler: 'Floor_Standard',
  },
  'corridor-side': {
    primary: 'Floor_Squares',
    accent: 'Floor_Diamond',
    filler: 'Floor_Standard',
  },
  'corridor-narrow': {
    primary: 'Floor_Standard',
    accent: 'Floor_Diamond',
    filler: 'Floor_Standard',
  },
};

const ROOM_LAYOUT: RoomSpec[] = [
  {
    id: 'entrance',
    center: [0, 0, -8],
    size: { w: 20, d: 16 },
    height: 14,
    theme: 'entrance',
    pattern: 'stripes',
    openings: { north: true, east: true, west: true },
  },
  {
    id: 'guard-east',
    center: [34, 0, -8],
    size: { w: 16, d: 14 },
    height: 13,
    theme: 'ossuary',
    pattern: 'checker',
    openings: { west: true, north: true },
  },
  {
    id: 'guard-west',
    center: [-34, 0, -8],
    size: { w: 16, d: 14 },
    height: 13,
    theme: 'ossuary',
    pattern: 'checker',
    openings: { east: true, north: true },
  },
  {
    id: 'hall-of-bones',
    center: [0, 0, 26],
    size: { w: 30, d: 22 },
    height: 18,
    theme: 'chapel',
    pattern: 'rings',
    openings: { south: true, north: true, east: true, west: true },
  },
  {
    id: 'ossuary-east',
    center: [34, 0, 26],
    size: { w: 18, d: 18 },
    height: 16,
    theme: 'ossuary',
    pattern: 'checker',
    openings: { west: true, north: true, south: true },
  },
  {
    id: 'reliquary-west',
    center: [-34, 0, 26],
    size: { w: 18, d: 20 },
    height: 17,
    theme: 'reliquary',
    pattern: 'spokes',
    openings: { east: true, north: true, south: true },
  },
  {
    id: 'crossroads',
    center: [0, 0, 62],
    size: { w: 24, d: 24 },
    height: 19,
    theme: 'catacomb',
    pattern: 'checker',
    openings: { south: true, north: true, east: true, west: true },
  },
  {
    id: 'crypt-east',
    center: [34, 0, 62],
    size: { w: 20, d: 18 },
    height: 16,
    theme: 'crypt',
    pattern: 'rings',
    openings: { west: true, north: true },
  },
  {
    id: 'crypt-west',
    center: [-34, 0, 62],
    size: { w: 20, d: 18 },
    height: 16,
    theme: 'crypt',
    pattern: 'spokes',
    openings: { east: true, north: true },
  },
  {
    id: 'catacomb-crown',
    center: [0, 0, 96],
    size: { w: 30, d: 18 },
    height: 17,
    theme: 'catacomb',
    pattern: 'rings',
    openings: { south: true, east: true, west: true },
  },
  {
    id: 'deadend-east',
    center: [34, 0, 96],
    size: { w: 14, d: 14 },
    height: 14,
    theme: 'ossuary',
    pattern: 'checker',
    openings: { west: true },
  },
  {
    id: 'deadend-west',
    center: [-34, 0, 96],
    size: { w: 14, d: 14 },
    height: 14,
    theme: 'ossuary',
    pattern: 'checker',
    openings: { east: true },
  },
];

const CORRIDOR_LAYOUT: CorridorSpec[] = [
  { id: 'entry-main', center: [0, 0, 9], length: 14, width: 8, axis: 'z', height: 14, theme: 'corridor-main', pattern: 'stripes' },
  { id: 'entry-east', center: [18, 0, -8], length: 16, width: 7, axis: 'x', height: 13, theme: 'corridor-narrow', pattern: 'checker' },
  { id: 'entry-west', center: [-18, 0, -8], length: 16, width: 7, axis: 'x', height: 13, theme: 'corridor-narrow', pattern: 'checker' },
  { id: 'guard-east-link', center: [34, 0, 9], length: 16, width: 7, axis: 'z', height: 14, theme: 'corridor-side', pattern: 'checker' },
  { id: 'guard-west-link', center: [-34, 0, 9], length: 16, width: 7, axis: 'z', height: 14, theme: 'corridor-side', pattern: 'checker' },
  { id: 'hall-east', center: [20, 0, 26], length: 10, width: 8, axis: 'x', height: 15, theme: 'corridor-main', pattern: 'spokes' },
  { id: 'hall-west', center: [-20, 0, 26], length: 10, width: 8, axis: 'x', height: 15, theme: 'corridor-main', pattern: 'spokes' },
  { id: 'hall-core', center: [0, 0, 43], length: 14, width: 8, axis: 'z', height: 16, theme: 'corridor-main', pattern: 'stripes' },
  { id: 'east-branch', center: [34, 0, 44], length: 22, width: 7, axis: 'z', height: 15, theme: 'corridor-side', pattern: 'checker' },
  { id: 'west-branch', center: [-34, 0, 44], length: 22, width: 7, axis: 'z', height: 15, theme: 'corridor-side', pattern: 'checker' },
  { id: 'core-east', center: [17, 0, 62], length: 10, width: 8, axis: 'x', height: 15, theme: 'corridor-main', pattern: 'spokes' },
  { id: 'core-west', center: [-17, 0, 62], length: 10, width: 8, axis: 'x', height: 15, theme: 'corridor-main', pattern: 'spokes' },
  { id: 'north-main', center: [0, 0, 80], length: 14, width: 8, axis: 'z', height: 16, theme: 'corridor-main', pattern: 'stripes' },
  { id: 'east-north-link', center: [34, 0, 80], length: 18, width: 7, axis: 'z', height: 15, theme: 'corridor-narrow', pattern: 'checker' },
  { id: 'west-north-link', center: [-34, 0, 80], length: 18, width: 7, axis: 'z', height: 15, theme: 'corridor-narrow', pattern: 'checker' },
  { id: 'crown-east-wing', center: [21, 0, 96], length: 12, width: 7, axis: 'x', height: 15, theme: 'corridor-narrow', pattern: 'checker' },
  { id: 'crown-west-wing', center: [-21, 0, 96], length: 12, width: 7, axis: 'x', height: 15, theme: 'corridor-narrow', pattern: 'checker' },
];

const WALL_SEGMENT_OVERLAP = 0.08;
const WALL_VERTICAL_OVERLAP = 0.06;
const WALL_BASE_SINK = 0.14;
const WALL_MAX_ROWS = 4;
const WALL_MAX_PLACEMENTS = 540;
const WALL_VARIANT_POOL = [
  'Wall',
  'Wall_Overgrown',
  'Wall_Broken',
  'Wall_Double_Broken',
  'Wall_ArchRound_Broken',
  'Wall_ArchRound_Overgrown',
  'Wall_ArchRound_Overgrown_Broken',
  'Wall_ArchRound',
  'Wall_ArchGothic',
] as const;
const DUNGEON_RUINS_GLB_URL = '/models/dungeon/structure/Modular%20Ruins%20Pack.glb';

function hashText(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildWallSegments(
  id: string,
  center: Vec3,
  size: { w: number; d: number },
  side: 'north' | 'south' | 'east' | 'west',
  wallHeight: number,
  hasOpening: boolean,
): BoxPiece[] {
  const [cx, cy, cz] = center;
  const halfW = size.w / 2;
  const halfD = size.d / 2;
  const wallY = cy + wallHeight / 2;

  if (!hasOpening) {
    if (side === 'north' || side === 'south') {
      return [
        {
          id: `${id}-${side}`,
          size: [size.w, wallHeight, WALL_THICKNESS],
          position: [
            cx,
            wallY,
            cz + (side === 'north' ? halfD - WALL_THICKNESS / 2 : -halfD + WALL_THICKNESS / 2),
          ],
          material: wallMaterial,
        },
      ];
    }
    return [
      {
        id: `${id}-${side}`,
        size: [WALL_THICKNESS, wallHeight, size.d],
        position: [
          cx + (side === 'east' ? halfW - WALL_THICKNESS / 2 : -halfW + WALL_THICKNESS / 2),
          wallY,
          cz,
        ],
        material: wallMaterial,
      },
    ];
  }

  const segments: BoxPiece[] = [];
  if (side === 'north' || side === 'south') {
    const segLength = (size.w - DOOR_WIDTH) / 2;
    const z = cz + (side === 'north' ? halfD - WALL_THICKNESS / 2 : -halfD + WALL_THICKNESS / 2);
    const leftX = cx - (DOOR_WIDTH / 2 + segLength / 2);
    const rightX = cx + (DOOR_WIDTH / 2 + segLength / 2);
    segments.push(
      {
        id: `${id}-${side}-left`,
        size: [segLength, wallHeight, WALL_THICKNESS],
        position: [leftX, wallY, z],
        material: wallMaterial,
      },
      {
        id: `${id}-${side}-right`,
        size: [segLength, wallHeight, WALL_THICKNESS],
        position: [rightX, wallY, z],
        material: wallMaterial,
      },
    );
  } else {
    const segLength = (size.d - DOOR_WIDTH) / 2;
    const x = cx + (side === 'east' ? halfW - WALL_THICKNESS / 2 : -halfW + WALL_THICKNESS / 2);
    const nearZ = cz - (DOOR_WIDTH / 2 + segLength / 2);
    const farZ = cz + (DOOR_WIDTH / 2 + segLength / 2);
    segments.push(
      {
        id: `${id}-${side}-near`,
        size: [WALL_THICKNESS, wallHeight, segLength],
        position: [x, wallY, nearZ],
        material: wallMaterial,
      },
      {
        id: `${id}-${side}-far`,
        size: [WALL_THICKNESS, wallHeight, segLength],
        position: [x, wallY, farZ],
        material: wallMaterial,
      },
    );
  }

  return segments;
}

function buildRoom(spec: RoomSpec): BoxPiece[] {
  const { id, center, size, openings } = spec;
  const roomHeight = spec.height ?? DEFAULT_ROOM_HEIGHT;
  const [cx, cy, cz] = center;

  const pieces: BoxPiece[] = [
    {
      id: `${id}-floor`,
      size: [size.w, FLOOR_THICKNESS, size.d],
      position: [cx, cy - FLOOR_THICKNESS / 2, cz],
      material: floorMaterial,
    },
    {
      id: `${id}-ceiling`,
      size: [size.w, CEILING_THICKNESS, size.d],
      position: [cx, cy + roomHeight - CEILING_THICKNESS / 2, cz],
      material: ceilingMaterial,
    },
  ];

  pieces.push(
    ...buildWallSegments(id, center, size, 'north', roomHeight, Boolean(openings?.north)),
    ...buildWallSegments(id, center, size, 'south', roomHeight, Boolean(openings?.south)),
    ...buildWallSegments(id, center, size, 'east', roomHeight, Boolean(openings?.east)),
    ...buildWallSegments(id, center, size, 'west', roomHeight, Boolean(openings?.west)),
  );

  return pieces;
}

function buildCorridor(
  id: string,
  center: Vec3,
  length: number,
  width: number,
  axis: 'x' | 'z',
  corridorHeight = DEFAULT_CORRIDOR_HEIGHT,
) {
  const [cx, cy, cz] = center;
  const pieces: BoxPiece[] = [];
  const size: Vec3 = axis === 'z' ? [width, FLOOR_THICKNESS, length] : [length, FLOOR_THICKNESS, width];
  pieces.push({
    id: `${id}-floor`,
    size,
    position: [cx, cy - FLOOR_THICKNESS / 2, cz],
    material: floorMaterial,
  });
  pieces.push({
    id: `${id}-ceiling`,
    size: axis === 'z' ? [width, CEILING_THICKNESS, length] : [length, CEILING_THICKNESS, width],
    position: [cx, cy + corridorHeight - CEILING_THICKNESS / 2, cz],
    material: ceilingMaterial,
  });

  const wallSize: Vec3 = axis === 'z'
    ? [WALL_THICKNESS, corridorHeight, length]
    : [length, corridorHeight, WALL_THICKNESS];
  const offset = width / 2 - WALL_THICKNESS / 2;
  if (axis === 'z') {
    pieces.push(
      {
        id: `${id}-wall-east`,
        size: wallSize,
        position: [cx + offset, cy + corridorHeight / 2, cz],
        material: wallMaterial,
      },
      {
        id: `${id}-wall-west`,
        size: wallSize,
        position: [cx - offset, cy + corridorHeight / 2, cz],
        material: wallMaterial,
      },
    );
  } else {
    pieces.push(
      {
        id: `${id}-wall-north`,
        size: wallSize,
        position: [cx, cy + corridorHeight / 2, cz + offset],
        material: wallMaterial,
      },
      {
        id: `${id}-wall-south`,
        size: wallSize,
        position: [cx, cy + corridorHeight / 2, cz - offset],
        material: wallMaterial,
      },
    );
  }

  return pieces;
}

export default function DungeonWorld() {
  const { nodes } = useGLTF(DUNGEON_RUINS_GLB_URL) as {
    nodes: Record<string, Object3D>;
  };
  const pieces = useMemo(() => {
    return [
      ...ROOM_LAYOUT.flatMap(buildRoom),
      ...CORRIDOR_LAYOUT.flatMap((corridor) =>
        buildCorridor(
          corridor.id,
          corridor.center,
          corridor.length,
          corridor.width,
          corridor.axis,
          corridor.height ?? DEFAULT_CORRIDOR_HEIGHT,
        ),
      ),
    ];
  }, []);

  const floorPattern = useMemo(() => {
    if (!nodes || !FLOOR_OVERLAY) return [];

    const resolveNode = (name: string) => nodes?.[name] ?? null;
    const footprintCache = new Map<string, number>();
    const topCache = new Map<string, number>();

    const getTileFootprint = (name: string) => {
      if (footprintCache.has(name)) return footprintCache.get(name)!;
      const node = resolveNode(name);
      if (!node) return 0;
      const clone = node.clone(true);
      clone.position.set(0, 0, 0);
      clone.rotation.set(-Math.PI / 2, 0, 0);
      clone.updateMatrixWorld(true);
      const box = new Box3().setFromObject(clone);
      const size = new Vector3();
      box.getSize(size);
      const footprint = Math.max(size.x || 0, size.z || 0);
      footprintCache.set(name, footprint);
      return footprint;
    };

    const getTileTop = (name: string) => {
      if (topCache.has(name)) return topCache.get(name)!;
      const node = resolveNode(name);
      if (!node) return 0;
      const clone = node.clone(true);
      clone.position.set(0, 0, 0);
      clone.rotation.set(-Math.PI / 2, 0, 0);
      clone.updateMatrixWorld(true);
      const box = new Box3().setFromObject(clone);
      const top = box.max.y;
      topCache.set(name, top);
      return top;
    };

    const baseFootprint = getTileFootprint(FLOOR_TILES.primary);
    if (baseFootprint <= 0) return [];
    const baseStep = Math.min(FLOOR_MAX_STEP, Math.max(FLOOR_MIN_STEP, baseFootprint));
    const step = baseStep * (1 - FLOOR_TILE_OVERLAP);

    const isCompatibleFootprint = (name: string) => {
      const footprint = getTileFootprint(name);
      if (!footprint || baseStep <= 0) return false;
      const ratio = footprint / baseStep;
      return ratio >= 0.88 && ratio <= 1.12;
    };

    const safeTile = (name: string) => (isCompatibleFootprint(name) ? name : FLOOR_TILES.primary);

    const pickTile = (
      gx: number,
      gz: number,
      gxCount: number,
      gzCount: number,
      kind: 'room' | 'corridor',
      theme: { primary: string; accent: string; filler: string },
      pattern: FloorPatternKind,
    ) => {
      const edge = gx === 0 || gz === 0 || gx === gxCount - 1 || gz === gzCount - 1;
      const innerEdge = gx === 1 || gz === 1 || gx === gxCount - 2 || gz === gzCount - 2;
      const centerX = Math.floor(gxCount / 2);
      const centerZ = Math.floor(gzCount / 2);
      const distX = Math.abs(gx - centerX);
      const distZ = Math.abs(gz - centerZ);
      const ring = Math.max(distX, distZ);
      const isCenter = distX <= 1 && distZ <= 1;
      const checker = (gx + gz) % 2 === 0;
      const onAxis = gx === centerX || gz === centerZ;
      const onDiagonal = distX === distZ;
      const stripeOnX = gxCount <= gzCount;
      const stripeIndex = stripeOnX ? gx : gz;
      const stripeBand = Math.abs(stripeIndex - Math.floor((stripeOnX ? gxCount : gzCount) / 2));

      if (kind === 'corridor') {
        if (pattern === 'checker') {
          if (edge) return safeTile(theme.filler);
          return checker ? safeTile(theme.accent) : safeTile(theme.primary);
        }
        if (pattern === 'spokes') {
          if (edge) return safeTile(theme.filler);
          if (onAxis || onDiagonal) return safeTile(theme.accent);
          return safeTile(theme.primary);
        }
        if (stripeBand === 0) return safeTile(theme.accent);
        if (stripeBand === 1) return safeTile(theme.filler);
        if (edge) return safeTile(theme.filler);
        return safeTile(theme.primary);
      }

      if (pattern === 'checker') {
        if (edge) return safeTile(theme.filler);
        if (innerEdge) return safeTile(theme.accent);
        return checker ? safeTile(theme.primary) : safeTile(theme.accent);
      }
      if (pattern === 'spokes') {
        if (edge) return safeTile(theme.filler);
        if (isCenter) return safeTile(theme.accent);
        if (onAxis || onDiagonal) return safeTile(theme.accent);
        if (ring % 2 === 0) return safeTile(theme.filler);
        return safeTile(theme.primary);
      }
      if (pattern === 'stripes') {
        if (edge) return safeTile(theme.filler);
        if (stripeBand === 0) return safeTile(theme.accent);
        if (stripeBand === 1 || stripeBand === 3) return safeTile(theme.filler);
        return safeTile(theme.primary);
      }

      // Default "rings" style
      if (isCenter) return safeTile(theme.accent);
      if (edge) return safeTile(theme.filler);
      if (innerEdge && checker) return safeTile(theme.filler);
      if (ring === 2) return safeTile(theme.accent);
      if (ring === 3 && checker) return safeTile(theme.filler);
      if (ring % 3 === 0 && onDiagonal) return safeTile(theme.accent);
      if (ring % 2 === 0 && onAxis && checker) return safeTile(theme.filler);
      return safeTile(theme.primary);
    };

    const buildArea = (
      center: Vec3,
      size: { w: number; d: number },
      kind: 'room' | 'corridor',
      themeName: string,
      pattern: FloorPatternKind,
    ) => {
      const [cx, cy, cz] = center;
      const halfW = size.w / 2;
      const halfD = size.d / 2;
      const tiles: { id: string; name: string; position: Vec3; lift: number; halfSize: number }[] = [];
      const gxCount = Math.ceil(size.w / step);
      const gzCount = Math.ceil(size.d / step);
      const selectedTheme =
        ROOM_TILE_THEMES[themeName] ??
        (kind === 'corridor' ? ROOM_TILE_THEMES['corridor-main'] : FLOOR_TILES);
      const normalTop = Math.min(
        getTileTop(safeTile(selectedTheme.primary)),
        getTileTop(safeTile(selectedTheme.filler)),
        getTileTop(safeTile(selectedTheme.accent)),
      );
      for (let gx = 0; gx < gxCount; gx += 1) {
        for (let gz = 0; gz < gzCount; gz += 1) {
          const x = -halfW + step / 2 + gx * step;
          const z = -halfD + step / 2 + gz * step;
          const picked = pickTile(gx, gz, gxCount, gzCount, kind, selectedTheme, pattern);
          const liftFromMesh = Math.max(0, getTileTop(picked) - normalTop);
          tiles.push({
            id: `${center[0]}-${center[2]}-${gx}-${gz}`,
            name: picked,
            position: [cx + x, cy + 0.02, cz + z],
            lift: Math.min(LIFTED_TILE_VISUAL_HEIGHT, liftFromMesh),
            halfSize: step * 0.5,
          });
        }
      }
      return tiles;
    };

    const allTiles = [
      ...ROOM_LAYOUT.flatMap((room) =>
        buildArea(
          room.center,
          room.size,
          'room',
          room.theme ?? room.id,
          room.pattern ?? 'rings',
        ),
      ),
      ...CORRIDOR_LAYOUT.flatMap((corridor) =>
        buildArea(
          corridor.center,
          corridor.axis === 'z' ? { w: corridor.width, d: corridor.length } : { w: corridor.length, d: corridor.width },
          'corridor',
          corridor.theme ?? 'corridor-main',
          corridor.pattern ?? 'stripes',
        ),
      ),
    ];
    if (allTiles.length > FLOOR_MAX_TILES) {
      console.warn('Dungeon floor overlay too dense, truncating tile count', {
        total: allTiles.length,
        max: FLOOR_MAX_TILES,
      });
      return allTiles.slice(0, FLOOR_MAX_TILES);
    }
    return allTiles;
  }, [nodes]);

  useEffect(() => {
    const surfaceTiles = floorPattern.map((tile) => ({
        x: tile.position[0],
        z: tile.position[2],
        halfSize: tile.halfSize * 0.95,
        lift: tile.lift,
      }));
    setDungeonVisualLiftTiles(surfaceTiles);
    return () => clearDungeonVisualLiftTiles();
  }, [floorPattern]);

  const floorOverlayObjects = useMemo(() => {
    if (!FLOOR_OVERLAY || !nodes) return [];
    return floorPattern
      .slice(0, FLOOR_MAX_RENDER_OBJECTS)
      .map((tile) => {
        const node = nodes[tile.name];
        if (!node) return null;
        const placed = node.clone(true);
        placed.position.set(tile.position[0], tile.position[1], tile.position[2]);
        placed.rotation.set(-Math.PI / 2, 0, 0);
        placed.updateMatrixWorld(true);
        return { id: tile.id, object: placed };
      })
      .filter(Boolean) as { id: string; object: Object3D }[];
  }, [floorPattern, nodes]);

  const wallDecor = useMemo(() => {
    if (!SHOW_WALL_DECOR || !nodes) return [];

    type DecorPlacement = {
      id: string;
      name: string;
      position: Vec3;
      rotationX: number;
      rotationY: number;
      scale: number;
      scaleY: number;
      anchor: Vec3;
    };

    type WallProfile = {
      name: string;
      rotationX: number;
      footprint: number;
      height: number;
      anchor: Vec3;
    };

    const getWallProfile = (name: string): WallProfile | null => {
      const source = nodes[name];
      if (!source) return null;
      const probe = source.clone(true);
      const candidateRotations = [0, -Math.PI / 2];
      let best: WallProfile = {
        name,
        rotationX: 0,
        footprint: 0.1,
        height: 0.1,
        anchor: [0, 0, 0],
      };
      let bestHeight = -Infinity;
      for (let i = 0; i < candidateRotations.length; i += 1) {
        const rotationX = candidateRotations[i];
        probe.position.set(0, 0, 0);
        probe.rotation.set(rotationX, 0, 0);
        probe.scale.set(1, 1, 1);
        probe.updateMatrixWorld(true);
        const box = new Box3().setFromObject(probe);
        const size = new Vector3();
        const center = new Vector3();
        box.getSize(size);
        box.getCenter(center);
        const footprint = Math.max(size.x || 0.1, size.z || 0.1);
        const height = Math.max(size.y || 0.1, 0.1);
        if (height > bestHeight) {
          bestHeight = height;
          best = {
            name,
            rotationX,
            footprint: Math.max(footprint, 0.1),
            height,
            anchor: [-center.x, -box.min.y, -center.z],
          };
        }
      }
      return best;
    };

    const baseWallName =
      (nodes.Wall ? 'Wall' : null) ??
      Object.keys(nodes).find(
        (name) =>
          name.startsWith('Wall') &&
          !name.includes('Half') &&
          !name.includes('Hole') &&
          !name.includes('Broken') &&
          !name.includes('Overgrown'),
      ) ??
      null;
    if (!baseWallName) return [];
    const baseProfile = getWallProfile(baseWallName);
    if (!baseProfile) return [];
    if (baseProfile.footprint < 0.25 || baseProfile.height < 0.25) {
      console.warn('Dungeon wall profile too small, skipping decorative wall pass', {
        footprint: baseProfile.footprint,
        height: baseProfile.height,
        baseWallName,
      });
      return [];
    }

    const wallProfiles = WALL_VARIANT_POOL
      .map((name) => getWallProfile(name))
      .filter(Boolean)
      .filter((profile) => {
        const ratio = profile!.footprint / baseProfile.footprint;
        const heightRatio = profile!.height / baseProfile.height;
        return ratio >= 0.55 && ratio <= 1.7 && heightRatio >= 0.5 && heightRatio <= 1.8;
      }) as WallProfile[];
    if (!wallProfiles.length) wallProfiles.push(baseProfile);

    const archProfiles = wallProfiles.filter((profile) => profile.name.includes('Arch'));
    const weatheredProfiles = wallProfiles.filter(
      (profile) =>
        profile.name.includes('Broken') ||
        profile.name.includes('Overgrown') ||
        profile.name.includes('Double'),
    );
    const fillProfiles = wallProfiles.filter(
      (profile) =>
        !profile.name.includes('Half') &&
        !profile.name.includes('Hole') &&
        !profile.name.includes('Arch'),
    );
    const solidProfiles = fillProfiles.filter(
      (profile) =>
        !profile.name.includes('Broken') &&
        !profile.name.includes('Overgrown') &&
        !profile.name.includes('Double'),
    );

    const wallScale = 1;
    const wallSpan = baseProfile.footprint * wallScale;
    const wallStep = Math.max(0.1, wallSpan * (1 - WALL_SEGMENT_OVERLAP));
    const wallRowStep = Math.max(0.1, baseProfile.height * (1 - WALL_VERTICAL_OVERLAP));
    const placements: DecorPlacement[] = [];
    let placementCounter = 0;
    const wallPieces = pieces.filter((piece) => piece.material === wallMaterial);
    wallPieces.forEach((piece) => {
      if (placementCounter >= WALL_MAX_PLACEMENTS) return;
      const axis: 'x' | 'z' = piece.size[0] >= piece.size[2] ? 'x' : 'z';
      const length = axis === 'x' ? piece.size[0] : piece.size[2];
      const slots = Math.max(1, Math.ceil((length + wallStep * 0.5) / wallStep));
      const rows = Math.max(1, Math.min(WALL_MAX_ROWS, Math.ceil((piece.size[1] + wallRowStep * 0.25) / wallRowStep)));
      const occupiedLength = wallSpan + (slots - 1) * wallStep;
      const startOffset = -occupiedLength / 2 + wallSpan / 2;
      const rotationY = axis === 'x' ? 0 : Math.PI / 2;
      const baseY = piece.position[1] - piece.size[1] / 2 - WALL_BASE_SINK;

      let breakAll = false;
      for (let row = 0; row < rows; row += 1) {
        if (breakAll) break;
        for (let slot = 0; slot < slots; slot += 1) {
          if (placementCounter >= WALL_MAX_PLACEMENTS) {
            breakAll = true;
            break;
          }
          const offset = startOffset + slot * wallStep;
          const x = piece.position[0] + (axis === 'x' ? offset : 0);
          const z = piece.position[2] + (axis === 'z' ? offset : 0);
          const y = baseY + row * wallRowStep;
          const hash = hashText(`${piece.id}:${row}:${slot}`);
          const roll = hash % 100;
          const rowT = rows <= 1 ? 0 : row / (rows - 1);

          let profile = baseProfile;
          if (rowT > 0.7 && weatheredProfiles.length > 0 && roll < 55) {
            profile = weatheredProfiles[hash % weatheredProfiles.length];
          } else if (roll < 22 && weatheredProfiles.length > 0) {
            profile = weatheredProfiles[hash % weatheredProfiles.length];
          } else if (solidProfiles.length > 0) {
            profile = solidProfiles[hash % solidProfiles.length];
          } else if (fillProfiles.length > 0) {
            profile = fillProfiles[hash % fillProfiles.length];
          }

          const scaleXZRaw = wallSpan / Math.max(0.1, profile.footprint);
          const scale = Math.min(1.28, Math.max(0.7, scaleXZRaw));
          const remainingHeight = Math.max(0.1, piece.size[1] - row * wallRowStep);
          const scaleY = Math.min(1.16, Math.max(0.8, remainingHeight / Math.max(0.1, profile.height)));

          placements.push({
            id: `wall-${placementCounter++}`,
            name: profile.name,
            position: [x, y, z],
            rotationX: profile.rotationX,
            rotationY,
            scale: wallScale * scale,
            scaleY,
            anchor: profile.anchor,
          });
        }
      }
    });

    if (archProfiles.length > 0 && placementCounter < WALL_MAX_PLACEMENTS) {
      const archTargetHeight = Math.min(8, WALL_HEIGHT * 0.42);
      const archBaseY = -WALL_BASE_SINK;
      const pushArch = (
        seed: string,
        x: number,
        z: number,
        rotationY: number,
      ) => {
        if (placementCounter >= WALL_MAX_PLACEMENTS) return;
        const profile = archProfiles[hashText(seed) % archProfiles.length];
        const scale = Math.min(1.26, Math.max(0.84, (DOOR_WIDTH / Math.max(0.1, profile.footprint)) * 0.9));
        const scaleY = Math.min(1.6, Math.max(0.9, archTargetHeight / Math.max(0.1, profile.height)));
        placements.push({
          id: `arch-${seed}-${placementCounter++}`,
          name: profile.name,
          position: [x, archBaseY, z],
          rotationX: profile.rotationX,
          rotationY,
          scale,
          scaleY,
          anchor: profile.anchor,
        });
      };

      ROOM_LAYOUT.forEach((room) => {
        const [cx, , cz] = room.center;
        const halfW = room.size.w / 2 - WALL_THICKNESS / 2;
        const halfD = room.size.d / 2 - WALL_THICKNESS / 2;
        if (room.openings?.north) pushArch(`${room.id}-north`, cx, cz + halfD, Math.PI);
        if (room.openings?.south) pushArch(`${room.id}-south`, cx, cz - halfD, 0);
        if (room.openings?.east) pushArch(`${room.id}-east`, cx + halfW, cz, -Math.PI / 2);
        if (room.openings?.west) pushArch(`${room.id}-west`, cx - halfW, cz, Math.PI / 2);
      });
    }

    return placements;
  }, [nodes, pieces]);

  const wallDecorObjects = useMemo(() => {
    return wallDecor
      .map((decor) => {
        const node = nodes?.[decor.name];
        if (!node) return null;
        const placed = node.clone(true);
        placed.position.set(decor.anchor[0], decor.anchor[1], decor.anchor[2]);
        placed.traverse((child) => {
          const mesh = child as Object3D & { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean };
          if (mesh.isMesh) {
            mesh.castShadow = false;
            mesh.receiveShadow = true;
          }
        });
        return {
          id: decor.id,
          object: placed,
          position: decor.position,
          rotation: [decor.rotationX, decor.rotationY, 0] as Vec3,
          scale: [decor.scale, decor.scaleY, decor.scale] as Vec3,
        };
      })
      .filter(Boolean) as { id: string; object: Object3D; position: Vec3; rotation: Vec3; scale: Vec3 }[];
  }, [nodes, wallDecor]);

  const outerBorderPieces = useMemo(() => {
    const width = DUNGEON_BOUNDS.maxX - DUNGEON_BOUNDS.minX;
    const depth = DUNGEON_BOUNDS.maxZ - DUNGEON_BOUNDS.minZ;
    const halfThickness = OUTER_BORDER_THICKNESS / 2;
    const y = OUTER_BORDER_HEIGHT / 2 - OUTER_BORDER_SINK;
    const centerX = (DUNGEON_BOUNDS.minX + DUNGEON_BOUNDS.maxX) / 2;
    const centerZ = (DUNGEON_BOUNDS.minZ + DUNGEON_BOUNDS.maxZ) / 2;

    return [
      {
        id: 'outer-east',
        size: [OUTER_BORDER_THICKNESS, OUTER_BORDER_HEIGHT, depth + OUTER_BORDER_THICKNESS * 2] as Vec3,
        position: [DUNGEON_BOUNDS.maxX + halfThickness, y, centerZ] as Vec3,
      },
      {
        id: 'outer-west',
        size: [OUTER_BORDER_THICKNESS, OUTER_BORDER_HEIGHT, depth + OUTER_BORDER_THICKNESS * 2] as Vec3,
        position: [DUNGEON_BOUNDS.minX - halfThickness, y, centerZ] as Vec3,
      },
      {
        id: 'outer-north',
        size: [width + OUTER_BORDER_THICKNESS * 2, OUTER_BORDER_HEIGHT, OUTER_BORDER_THICKNESS] as Vec3,
        position: [centerX, y, DUNGEON_BOUNDS.maxZ + halfThickness] as Vec3,
      },
      {
        id: 'outer-south',
        size: [width + OUTER_BORDER_THICKNESS * 2, OUTER_BORDER_HEIGHT, OUTER_BORDER_THICKNESS] as Vec3,
        position: [centerX, y, DUNGEON_BOUNDS.minZ - halfThickness] as Vec3,
      },
    ];
  }, []);

  const walkableColliderPieces = useMemo(() => {
    const roomColliders = ROOM_LAYOUT.map((room) => ({
      id: `walk-room-${room.id}`,
      size: [
        room.size.w + WALKABLE_COLLIDER_OVERLAP,
        WALKABLE_COLLIDER_THICKNESS,
        room.size.d + WALKABLE_COLLIDER_OVERLAP,
      ] as Vec3,
      position: [room.center[0], WALKABLE_COLLIDER_Y, room.center[2]] as Vec3,
    }));

    const corridorColliders = CORRIDOR_LAYOUT.map((corridor) => {
      const width = corridor.axis === 'z' ? corridor.width : corridor.length;
      const depth = corridor.axis === 'z' ? corridor.length : corridor.width;
      return {
        id: `walk-corridor-${corridor.id}`,
        size: [
          width + WALKABLE_COLLIDER_OVERLAP,
          WALKABLE_COLLIDER_THICKNESS,
          depth + WALKABLE_COLLIDER_OVERLAP,
        ] as Vec3,
        position: [corridor.center[0], WALKABLE_COLLIDER_Y, corridor.center[2]] as Vec3,
      };
    });

    return [...roomColliders, ...corridorColliders];
  }, []);

  return (
    <group name="dungeon-world">
      {pieces.map((piece) => (
        <mesh
          key={`mesh-${piece.id}`}
          position={piece.position}
          castShadow={false}
          receiveShadow={piece.id.includes('floor') || piece.id.includes('wall')}
          material={piece.material}
          visible={piece.visible !== false}
        >
          <boxGeometry args={piece.size} />
        </mesh>
      ))}

      {SHOW_FLOOR_GRID ? (
        <group position={[0, 0.02, -18]}>
          {FLOOR_NODES.map((name, index) => {
            const node = nodes?.[name];
            if (!node) return null;
            const x = (index % 4) * 8;
            const z = Math.floor(index / 4) * 8;
            return (
              <group key={`floor-grid-${name}`} position={[x, 0, z]}>
                <mesh position={[0, -0.01, 0]} receiveShadow>
                  <boxGeometry args={[6, 0.1, 6]} />
                  <meshStandardMaterial color="#3a3a3a" />
                </mesh>
                <primitive object={node.clone(true)} />
              </group>
            );
          })}
        </group>
      ) : null}

      <mesh position={[0, UNDERFLOOR_Y, 0]} castShadow={false} receiveShadow material={underfloorMaterial}>
        <boxGeometry args={UNDERFLOOR_SIZE} />
      </mesh>

      {outerBorderPieces.map((wall) => (
        <mesh
          key={wall.id}
          position={wall.position}
          castShadow={false}
          receiveShadow
          material={wallMaterial}
        >
          <boxGeometry args={wall.size} />
        </mesh>
      ))}

      {FLOOR_OVERLAY ? floorOverlayObjects.map((tile) => <primitive key={`tile-${tile.id}`} object={tile.object} />) : null}

      {SHOW_WALL_DECOR ? wallDecorObjects.map((decor) => {
        return (
          <group
            key={`decor-${decor.id}`}
            position={decor.position}
            rotation={decor.rotation}
            scale={decor.scale}
          >
            <primitive object={decor.object} />
          </group>
        );
      }) : null}

      <RigidBody type="fixed" colliders={false} name="dungeon-colliders">
        {pieces.map((piece) => (
          (() => {
            const isWallPiece = piece.material === wallMaterial;
            const alongX = piece.size[0] >= piece.size[2];
            const colliderSize: Vec3 = isWallPiece
              ? alongX
                ? [
                    piece.size[0] + WALL_COLLIDER_LENGTH_PAD,
                    piece.size[1],
                    Math.max(piece.size[2], WALL_COLLIDER_THICKNESS),
                  ]
                : [
                    Math.max(piece.size[0], WALL_COLLIDER_THICKNESS),
                    piece.size[1],
                    piece.size[2] + WALL_COLLIDER_LENGTH_PAD,
                  ]
              : piece.size;

            return (
              <CuboidCollider
                key={`collider-${piece.id}`}
                args={[colliderSize[0] / 2, colliderSize[1] / 2, colliderSize[2] / 2]}
                position={piece.position}
              />
            );
          })()
        ))}
        {outerBorderPieces.map((wall) => (
          <CuboidCollider
            key={`border-collider-${wall.id}`}
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
            position={wall.position}
          />
        ))}
        {walkableColliderPieces.map((floor) => (
          <CuboidCollider
            key={`walk-collider-${floor.id}`}
            args={[floor.size[0] / 2, floor.size[1] / 2, floor.size[2] / 2]}
            position={floor.position}
          />
        ))}
        <CuboidCollider args={[180, 1, 180]} position={[0, -4, 0]} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(DUNGEON_RUINS_GLB_URL);
