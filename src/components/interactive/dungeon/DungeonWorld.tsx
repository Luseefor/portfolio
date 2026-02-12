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
  openings?: WallOpening;
};

type CorridorSpec = {
  id: string;
  center: Vec3;
  length: number;
  width: number;
  axis: 'x' | 'z';
};

const WALL_HEIGHT = 21;
const WALL_THICKNESS = 0.8;
const FLOOR_THICKNESS = 0.45;
const CEILING_THICKNESS = 0.35;
const DOOR_WIDTH = 6;
const FLOOR_TILE_OVERLAP = 0.015;
const FLOOR_MIN_STEP = 1.2;
const FLOOR_MAX_STEP = 6;
const FLOOR_MAX_TILES = 14000;
const FLOOR_MAX_RENDER_OBJECTS = 14000;
const UNDERFLOOR_SIZE: Vec3 = [220, 0.2, 220];
const UNDERFLOOR_Y = -0.2;
const OUTER_BORDER_THICKNESS = 2.5;
const OUTER_BORDER_HEIGHT = WALL_HEIGHT + 2;
const OUTER_BORDER_SINK = 0.4;
const WALL_COLLIDER_THICKNESS = 1.8;
const WALL_COLLIDER_LENGTH_PAD = 0.2;

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
  color: '#3a352f',
  roughness: 0.92,
  metalness: 0.08,
});
const ceilingMaterial = new MeshStandardMaterial({
  color: '#1f1e1b',
  roughness: 0.98,
  metalness: 0.02,
});
const underfloorMaterial = new MeshStandardMaterial({
  color: '#6a6456',
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
  'room-a': {
    primary: 'Floor_Squares',
    accent: 'Floor_Standard',
    filler: 'Floor_Standard',
  },
  'room-b': {
    primary: 'Floor_Standard',
    accent: 'Floor_Squares',
    filler: 'Floor_Standard',
  },
  'room-c': {
    primary: 'Floor_Squares',
    accent: 'Floor_Diamond',
    filler: 'Floor_Standard',
  },
  'room-hidden': {
    primary: 'Floor_Standard',
    accent: 'Floor_Diamond',
    filler: 'Floor_Squares',
  },
  'room-d': {
    primary: 'Floor_Diamond',
    accent: 'Floor_Standard',
    filler: 'Floor_Squares',
  },
  corridor: {
    primary: 'Floor_Standard',
    accent: 'Floor_Squares',
    filler: 'Floor_Standard',
  },
};

const ROOM_LAYOUT: RoomSpec[] = [
  {
    // Spawn room — medium
    id: 'room-a',
    center: [0, 0, 0],
    size: { w: 36, d: 36 },
    openings: { north: true, east: true },
  },
  {
    // Grand hall — large, central hub
    id: 'room-b',
    center: [0, 0, 56],
    size: { w: 50, d: 44 },
    openings: { south: true, east: true, west: true },
  },
  {
    // Armory — small, east wing
    id: 'room-c',
    center: [52, 0, 0],
    size: { w: 24, d: 28 },
    openings: { west: true },
  },
  {
    // Crypt — medium-narrow, east
    id: 'room-d',
    center: [56, 0, 56],
    size: { w: 28, d: 36 },
    openings: { west: true },
  },
  {
    // Hidden alcove — small, west
    id: 'room-hidden',
    center: [-50, 0, 56],
    size: { w: 22, d: 24 },
    openings: { east: true },
  },
];

const CORRIDOR_LAYOUT: CorridorSpec[] = [
  // Spawn → Grand hall (north)
  { id: 'corridor-a', center: [0, 0, 28], length: 20, width: 7, axis: 'z' },
  // Spawn → Armory (east)
  { id: 'corridor-b', center: [28, 0, 0], length: 20, width: 5, axis: 'x' },
  // Grand hall → Crypt (east)
  { id: 'corridor-c', center: [34, 0, 56], length: 22, width: 6, axis: 'x' },
  // Grand hall → Hidden alcove (west)
  { id: 'corridor-d', center: [-32, 0, 56], length: 14, width: 5, axis: 'x' },
  // Grand hall additional north passage
  { id: 'corridor-e', center: [56, 0, 30], length: 24, width: 6, axis: 'z' },
];

/* ══════════════════════════════════════════════════════
   SEMANTIC WALL DECORATION SYSTEM
   Single-height nodes, deterministic placement, no kitbash
   ══════════════════════════════════════════════════════ */

const WALL_BASE_SINK = 0.08;
const WALL_MAX_PLACEMENTS = 300;
const WALL_TILE_OVERLAP = 0.04;

// --- Node pools by ROLE ---
const SOLID_WALLS = ['Wall'] as const;
const WEATHERED_WALLS = ['Wall_Broken', 'Wall_Overgrown'] as const;
const ARCH_WALLS = ['Wall_ArchRound'] as const;
const STANDALONE_ARCHES = [
  'Arch_Gothic', 'Arch_Round',
] as const;
const PILLAR_NODES = ['Column_Square'] as const;
const TORCH_NODE = 'Torch' as const;
const PROP_POOLS = {
  barrels: ['Barrel', 'Crate'] as const,
  pots: ['Pot1', 'Pot2'] as const,
  chests: ['Chest_Base'] as const,
  candles: ['Candles_1'] as const,
};

const TORCH_INTERVAL = 16;
const TORCH_MOUNT_Y = 2.5;

const DUNGEON_RUINS_GLB_URL = '/models/dungeon/structure/Modular%20Ruins%20Pack.glb';

type NodeProfile = {
  name: string;
  rotationX: number;
  footprint: number;
  height: number;
  depth: number;
  anchor: Vec3;
};

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

/** Torch light data exported for DungeonScene */
export type TorchLight = {
  id: string;
  position: Vec3;
};

function hashText(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Measure a wall/prop node keeping its baked GLB scale.
 */
function measureNode(
  nodes: Record<string, Object3D>,
  name: string,
): NodeProfile | null {
  const source = nodes[name];
  if (!source) return null;
  const probe = source.clone(true);
  const candidates = [0, -Math.PI / 2];
  let best: NodeProfile | null = null;
  let bestScore = -Infinity;

  for (const rotX of candidates) {
    probe.position.set(0, 0, 0);
    probe.rotation.set(rotX, 0, 0);
    // KEEP baked scale — GLB nodes are in cm with 100x scale
    probe.updateMatrixWorld(true);
    const box = new Box3().setFromObject(probe);
    const sz = new Vector3();
    const cn = new Vector3();
    box.getSize(sz);
    box.getCenter(cn);

    const sX = Math.max(sz.x, 0.01);
    const sY = Math.max(sz.y, 0.01);
    const sZ = Math.max(sz.z, 0.01);
    const footprint = Math.max(sX, sZ);
    const depth = Math.min(sX, sZ);
    const height = sY;
    const score = height * (height / Math.max(depth, 0.01));

    if (score > bestScore) {
      bestScore = score;
      best = {
        name,
        rotationX: rotX,
        footprint: Math.max(footprint, 0.01),
        height: Math.max(height, 0.01),
        depth: Math.max(depth, 0.01),
        anchor: [-cn.x, -box.min.y, -cn.z],
      };
    }
  }
  return best;
}

/* ── room/corridor builders (unchanged) ── */

function buildWallSegments(
  id: string,
  center: Vec3,
  size: { w: number; d: number },
  side: 'north' | 'south' | 'east' | 'west',
  hasOpening: boolean,
): BoxPiece[] {
  const [cx, cy, cz] = center;
  const halfW = size.w / 2;
  const halfD = size.d / 2;
  const wallY = cy + WALL_HEIGHT / 2;

  if (!hasOpening) {
    if (side === 'north' || side === 'south') {
      return [
        {
          id: `${id}-${side}`,
          size: [size.w, WALL_HEIGHT, WALL_THICKNESS],
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
        size: [WALL_THICKNESS, WALL_HEIGHT, size.d],
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
        size: [segLength, WALL_HEIGHT, WALL_THICKNESS],
        position: [leftX, wallY, z],
        material: wallMaterial,
      },
      {
        id: `${id}-${side}-right`,
        size: [segLength, WALL_HEIGHT, WALL_THICKNESS],
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
        size: [WALL_THICKNESS, WALL_HEIGHT, segLength],
        position: [x, wallY, nearZ],
        material: wallMaterial,
      },
      {
        id: `${id}-${side}-far`,
        size: [WALL_THICKNESS, WALL_HEIGHT, segLength],
        position: [x, wallY, farZ],
        material: wallMaterial,
      },
    );
  }

  return segments;
}

function buildRoom(spec: RoomSpec): BoxPiece[] {
  const { id, center, size, openings } = spec;
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
      position: [cx, cy + WALL_HEIGHT - CEILING_THICKNESS / 2, cz],
      material: ceilingMaterial,
    },
  ];

  pieces.push(
    ...buildWallSegments(id, center, size, 'north', Boolean(openings?.north)),
    ...buildWallSegments(id, center, size, 'south', Boolean(openings?.south)),
    ...buildWallSegments(id, center, size, 'east', Boolean(openings?.east)),
    ...buildWallSegments(id, center, size, 'west', Boolean(openings?.west)),
  );

  return pieces;
}

function buildCorridor(id: string, center: Vec3, length: number, width: number, axis: 'x' | 'z') {
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
    position: [cx, cy + WALL_HEIGHT - CEILING_THICKNESS / 2, cz],
    material: ceilingMaterial,
  });

  const wallSize: Vec3 = axis === 'z'
    ? [WALL_THICKNESS, WALL_HEIGHT, length]
    : [length, WALL_HEIGHT, WALL_THICKNESS];
  const offset = width / 2 - WALL_THICKNESS / 2;
  if (axis === 'z') {
    pieces.push(
      {
        id: `${id}-wall-east`,
        size: wallSize,
        position: [cx + offset, cy + WALL_HEIGHT / 2, cz],
        material: wallMaterial,
      },
      {
        id: `${id}-wall-west`,
        size: wallSize,
        position: [cx - offset, cy + WALL_HEIGHT / 2, cz],
        material: wallMaterial,
      },
    );
  } else {
    pieces.push(
      {
        id: `${id}-wall-north`,
        size: wallSize,
        position: [cx, cy + WALL_HEIGHT / 2, cz + offset],
        material: wallMaterial,
      },
      {
        id: `${id}-wall-south`,
        size: wallSize,
        position: [cx, cy + WALL_HEIGHT / 2, cz - offset],
        material: wallMaterial,
      },
    );
  }

  return pieces;
}

/* ═══════════════════════════════════════════════════
   DungeonWorld component
   ═══════════════════════════════════════════════════ */
export default function DungeonWorld() {
  const { nodes } = useGLTF(DUNGEON_RUINS_GLB_URL) as {
    nodes: Record<string, Object3D>;
  };
  const pieces = useMemo(() => {
    return [
      ...ROOM_LAYOUT.flatMap(buildRoom),
      ...CORRIDOR_LAYOUT.flatMap((corridor) =>
        buildCorridor(corridor.id, corridor.center, corridor.length, corridor.width, corridor.axis),
      ),
    ];
  }, []);

  /* ── floor tile overlay ── */
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

      if (kind === 'corridor') {
        const stripeOnX = gxCount <= gzCount;
        const isStripe = stripeOnX ? gx === centerX : gz === centerZ;
        if (isStripe) return safeTile(theme.accent);
        if (edge) return safeTile(theme.filler);
        if (onAxis && checker) return safeTile(theme.filler);
        return safeTile(theme.primary);
      }

      if (isCenter) return safeTile(theme.accent);
      if (edge) return safeTile(theme.accent);
      if (innerEdge && checker) return safeTile(theme.filler);
      if (ring === 2) return safeTile(theme.accent);
      if (ring === 3 && checker) return safeTile(theme.filler);
      if (ring === 4 && onDiagonal) return safeTile(theme.accent);
      if (ring === 5 && onAxis && checker) return safeTile(theme.filler);
      if (ring === 6 && checker) return safeTile(theme.accent);
      return safeTile(theme.primary);
    };

    const buildArea = (
      center: Vec3,
      size: { w: number; d: number },
      kind: 'room' | 'corridor',
      themeName: string,
    ) => {
      const [cx, cy, cz] = center;
      const halfW = size.w / 2;
      const halfD = size.d / 2;
      const tiles: { id: string; name: string; position: Vec3; lift: number; halfSize: number }[] = [];
      const gxCount = Math.ceil(size.w / step);
      const gzCount = Math.ceil(size.d / step);
      const selectedTheme =
        ROOM_TILE_THEMES[themeName] ??
        (kind === 'corridor' ? ROOM_TILE_THEMES.corridor : FLOOR_TILES);
      const normalTop = Math.min(
        getTileTop(safeTile(selectedTheme.primary)),
        getTileTop(safeTile(selectedTheme.filler)),
        getTileTop(safeTile(selectedTheme.accent)),
      );
      for (let gx = 0; gx < gxCount; gx += 1) {
        for (let gz = 0; gz < gzCount; gz += 1) {
          const x = -halfW + step / 2 + gx * step;
          const z = -halfD + step / 2 + gz * step;
          const picked = pickTile(gx, gz, gxCount, gzCount, kind, selectedTheme);
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
      ...ROOM_LAYOUT.flatMap((room) => buildArea(room.center, room.size, 'room', room.id)),
      ...CORRIDOR_LAYOUT.flatMap((corridor) =>
        buildArea(
          corridor.center,
          corridor.axis === 'z' ? { w: corridor.width, d: corridor.length } : { w: corridor.length, d: corridor.width },
          'corridor',
          corridor.id,
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

  /* ══════════════════════════════════════════════════
     SEMANTIC WALL + PROP DECORATION
     ══════════════════════════════════════════════════ */
  const wallDecor = useMemo(() => {
    if (!nodes) return { placements: [] as DecorPlacement[], torchLights: [] as TorchLight[] };

    // Measure all node profiles
    const profiles = new Map<string, NodeProfile>();
    const measurePool = (pool: readonly string[]) => {
      pool.forEach((n) => {
        const p = measureNode(nodes, n);
        if (p) profiles.set(n, p);
      });
    };
    measurePool(SOLID_WALLS);
    measurePool(WEATHERED_WALLS);
    measurePool(ARCH_WALLS);
    measurePool(STANDALONE_ARCHES);
    measurePool(PILLAR_NODES);
    measurePool([TORCH_NODE]);
    Object.values(PROP_POOLS).flat().forEach((n) => {
      const p = measureNode(nodes, n);
      if (p) profiles.set(n, p);
    });

    const baseProfile = profiles.get('Wall') ?? profiles.values().next().value;
    if (!baseProfile || baseProfile.footprint < 0.2 || baseProfile.height < 0.2) {
      console.warn('[DungeonWalls] No valid base wall profile');
      return { placements: [], torchLights: [] };
    }

    const wallStep = baseProfile.footprint * (1 - WALL_TILE_OVERLAP);
    const placements: DecorPlacement[] = [];
    const torchLights: TorchLight[] = [];
    let counter = 0;

    // --- Deterministic variant picker ---
    const pickWallVariant = (seed: string, isCorner: boolean): NodeProfile => {
      const hash = hashText(seed);
      const roll = hash % 100;
      if (isCorner) {
        const pool = WEATHERED_WALLS.map((n) => profiles.get(n)).filter(Boolean) as NodeProfile[];
        if (pool.length > 0) return pool[hash % pool.length];
      }
      if (roll < 82) {
        const pool = SOLID_WALLS.map((n) => profiles.get(n)).filter(Boolean) as NodeProfile[];
        if (pool.length > 0) return pool[hash % pool.length];
      } else {
        const pool = WEATHERED_WALLS.map((n) => profiles.get(n)).filter(Boolean) as NodeProfile[];
        if (pool.length > 0) return pool[hash % pool.length];
      }
      return baseProfile;
    };

    // --- Tile single-row walls onto box-geometry wall pieces ---
    const wallPieces = pieces.filter((p) => p.material === wallMaterial);

    wallPieces.forEach((piece) => {
      if (counter >= WALL_MAX_PLACEMENTS) return;

      const axis: 'x' | 'z' = piece.size[0] >= piece.size[2] ? 'x' : 'z';
      const length = axis === 'x' ? piece.size[0] : piece.size[2];
      const wallHeight = piece.size[1];

      const slots = Math.max(1, Math.round(length / wallStep));
      const occupiedLength = slots * wallStep;
      const startOffset = -occupiedLength / 2 + wallStep / 2;
      const rotationY = axis === 'x' ? 0 : Math.PI / 2;
      const baseY = piece.position[1] - wallHeight / 2 - WALL_BASE_SINK;
      const scaleY = Math.max(0.5, Math.min(1.8, wallHeight / baseProfile.height));

      for (let slot = 0; slot < slots; slot += 1) {
        if (counter >= WALL_MAX_PLACEMENTS) break;

        const offset = startOffset + slot * wallStep;
        const x = piece.position[0] + (axis === 'x' ? offset : 0);
        const z = piece.position[2] + (axis === 'z' ? offset : 0);
        const isCorner = slot === 0 || slot === slots - 1;

        const seed = `${piece.id}:${slot}`;
        const profile = pickWallVariant(seed, isCorner);
        const scaleXZ = Math.max(0.8, Math.min(1.2, wallStep / profile.footprint));

        placements.push({
          id: `wall-${counter++}`,
          name: profile.name,
          position: [x, baseY, z],
          rotationX: profile.rotationX,
          rotationY,
          scale: scaleXZ,
          scaleY,
          anchor: profile.anchor,
        });

        // Torch placement every TORCH_INTERVAL
        const torchSlotInterval = Math.max(1, Math.round(TORCH_INTERVAL / wallStep));
        if (slot > 0 && slot % torchSlotInterval === 0) {
          const torchProfile = profiles.get(TORCH_NODE);
          if (torchProfile && counter < WALL_MAX_PLACEMENTS) {
            const torchOff = 0.3;
            const tx = axis === 'x' ? x : piece.position[0] + torchOff * Math.sign(piece.position[0] || 1);
            const tz = axis === 'z' ? z : piece.position[2] + torchOff * Math.sign(piece.position[2] || 1);

            placements.push({
              id: `torch-${counter++}`,
              name: TORCH_NODE,
              position: [tx, TORCH_MOUNT_Y, tz],
              rotationX: torchProfile.rotationX,
              rotationY: rotationY + Math.PI,
              scale: 1.0,
              scaleY: 1.0,
              anchor: torchProfile.anchor,
            });

            torchLights.push({
              id: `tl-${torchLights.length}`,
              position: [tx, TORCH_MOUNT_Y + 0.5, tz],
            });
          }
        }
      }
    });

    // --- Pillars at room corners ---
    const pillarProfiles = PILLAR_NODES.map((n) => profiles.get(n)).filter(Boolean) as NodeProfile[];
    if (pillarProfiles.length > 0) {
      ROOM_LAYOUT.forEach((room) => {
        if (counter >= WALL_MAX_PLACEMENTS) return;
        const [cx, , cz] = room.center;
        const halfW = room.size.w / 2;
        const halfD = room.size.d / 2;

        [[cx - halfW, cz - halfD], [cx + halfW, cz - halfD],
        [cx - halfW, cz + halfD], [cx + halfW, cz + halfD]].forEach(([cornerX, cornerZ], i) => {
          if (counter >= WALL_MAX_PLACEMENTS) return;
          const hash = hashText(`pillar-${room.id}-${i}`);
          const profile = pillarProfiles[hash % pillarProfiles.length];
          const pillarScaleY = Math.max(0.5, Math.min(1.5, WALL_HEIGHT / profile.height));

          placements.push({
            id: `pillar-${counter++}`,
            name: profile.name,
            position: [cornerX, -WALL_BASE_SINK, cornerZ],
            rotationX: profile.rotationX,
            rotationY: 0,
            scale: 1.0,
            scaleY: pillarScaleY,
            anchor: profile.anchor,
          });
        });
      });
    }

    // --- Arches at room openings ---
    const archProfiles = STANDALONE_ARCHES.map((n) => profiles.get(n)).filter(Boolean) as NodeProfile[];
    if (archProfiles.length > 0) {
      ROOM_LAYOUT.forEach((room) => {
        if (counter >= WALL_MAX_PLACEMENTS) return;
        const [cx, , cz] = room.center;
        const halfW = room.size.w / 2 - WALL_THICKNESS / 2;
        const halfD = room.size.d / 2 - WALL_THICKNESS / 2;

        const pushArch = (seed: string, ax: number, az: number, rotY: number) => {
          if (counter >= WALL_MAX_PLACEMENTS) return;
          const hash = hashText(seed);
          const profile = archProfiles[hash % archProfiles.length];
          const archScale = Math.max(0.7, Math.min(1.4, DOOR_WIDTH / profile.footprint));
          const archScaleY = Math.max(0.8, Math.min(1.5, (WALL_HEIGHT * 0.5) / profile.height));

          placements.push({
            id: `arch-${counter++}`,
            name: profile.name,
            position: [ax, -WALL_BASE_SINK, az],
            rotationX: profile.rotationX,
            rotationY: rotY,
            scale: archScale,
            scaleY: archScaleY,
            anchor: profile.anchor,
          });
        };

        if (room.openings?.north) pushArch(`${room.id}-north`, cx, cz + halfD, Math.PI);
        if (room.openings?.south) pushArch(`${room.id}-south`, cx, cz - halfD, 0);
        if (room.openings?.east) pushArch(`${room.id}-east`, cx + halfW, cz, -Math.PI / 2);
        if (room.openings?.west) pushArch(`${room.id}-west`, cx - halfW, cz, Math.PI / 2);
      });
    }

    // --- Props: barrels/crates at room corners, chests in special rooms ---
    const propPool = [...PROP_POOLS.barrels, ...PROP_POOLS.pots];
    ROOM_LAYOUT.forEach((room) => {
      const [cx, , cz] = room.center;
      const halfW = room.size.w / 2 - 1;
      const halfD = room.size.d / 2 - 1;
      const roomHash = hashText(room.id);

      // Place props at 2 of 4 corners
      const corners: [number, number][] = [
        [cx - halfW, cz - halfD],
        [cx + halfW, cz - halfD],
        [cx - halfW, cz + halfD],
        [cx + halfW, cz + halfD],
      ];
      const c1 = roomHash % 4;
      const c2 = (roomHash + 2) % 4;
      [corners[c1], corners[c2]].forEach(([px, pz], i) => {
        if (counter >= WALL_MAX_PLACEMENTS) return;
        const hash = hashText(`prop-${room.id}-${i}`);
        const propName = propPool[hash % propPool.length];
        const profile = profiles.get(propName);
        if (!profile) return;
        const inset = 1.2;
        placements.push({
          id: `prop-${counter++}`,
          name: propName,
          position: [px + (px > cx ? -inset : inset), 0, pz + (pz > cz ? -inset : inset)],
          rotationX: profile.rotationX,
          rotationY: (hash % 4) * Math.PI / 2,
          scale: 1.0,
          scaleY: 1.0,
          anchor: profile.anchor,
        });
      });

      // Chests in crypt + hidden alcove
      if (room.id === 'room-d' || room.id === 'room-hidden') {
        const chestProfile = profiles.get('Chest_Base');
        if (chestProfile && counter < WALL_MAX_PLACEMENTS) {
          placements.push({
            id: `chest-${counter++}`,
            name: 'Chest_Base',
            position: [cx, 0, cz],
            rotationX: chestProfile.rotationX,
            rotationY: (roomHash % 4) * Math.PI / 2,
            scale: 1.2,
            scaleY: 1.2,
            anchor: chestProfile.anchor,
          });
        }
      }

      // Candles near room centers
      const candleProfile = profiles.get('Candles_1') ?? profiles.get('Candles_2');
      if (candleProfile && counter < WALL_MAX_PLACEMENTS) {
        placements.push({
          id: `candles-${counter++}`,
          name: candleProfile.name,
          position: [cx + 1.5, 0, cz + 1.5],
          rotationX: candleProfile.rotationX,
          rotationY: 0,
          scale: 1.0,
          scaleY: 1.0,
          anchor: candleProfile.anchor,
        });
      }
    });

    return { placements, torchLights };
  }, [nodes, pieces]);

  const wallDecorObjects = useMemo(() => {
    return wallDecor.placements
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

  /* ── outer border pieces ── */
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

  return (
    <group name="dungeon-world">
      {pieces.map((piece) => (
        <mesh
          key={`mesh-${piece.id}`}
          position={piece.position}
          castShadow={false}
          receiveShadow={piece.id.includes('floor')}
          material={piece.material}
          visible={piece.visible !== false && (piece.id.includes('floor') || piece.id.includes('ceiling'))}
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

      {/* Dungeon ceiling cap — prevents seeing void above */}
      <mesh
        position={[
          (DUNGEON_BOUNDS.minX + DUNGEON_BOUNDS.maxX) / 2,
          WALL_HEIGHT + 0.1,
          (DUNGEON_BOUNDS.minZ + DUNGEON_BOUNDS.maxZ) / 2,
        ]}
        castShadow={false}
        receiveShadow={false}
        material={ceilingMaterial}
      >
        <boxGeometry args={[
          DUNGEON_BOUNDS.maxX - DUNGEON_BOUNDS.minX + OUTER_BORDER_THICKNESS * 2,
          0.5,
          DUNGEON_BOUNDS.maxZ - DUNGEON_BOUNDS.minZ + OUTER_BORDER_THICKNESS * 2,
        ]} />
      </mesh>

      {FLOOR_OVERLAY ? floorOverlayObjects.map((tile) => <primitive key={`tile-${tile.id}`} object={tile.object} />) : null}

      {wallDecorObjects.map((decor) => {
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
      })}

      {/* Torch point lights */}
      {wallDecor.torchLights.map((tl) => (
        <pointLight
          key={tl.id}
          position={tl.position}
          intensity={2.0}
          color="#ff9944"
          distance={10}
          decay={2}
          castShadow={false}
        />
      ))}

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
        <CuboidCollider args={[180, 1, 180]} position={[0, -4, 0]} />
        {/* Ceiling collider — prevents player from jumping through ceiling */}
        <CuboidCollider
          args={[
            (DUNGEON_BOUNDS.maxX - DUNGEON_BOUNDS.minX + OUTER_BORDER_THICKNESS * 2) / 2,
            0.5,
            (DUNGEON_BOUNDS.maxZ - DUNGEON_BOUNDS.minZ + OUTER_BORDER_THICKNESS * 2) / 2,
          ]}
          position={[
            (DUNGEON_BOUNDS.minX + DUNGEON_BOUNDS.maxX) / 2,
            WALL_HEIGHT + 0.5,
            (DUNGEON_BOUNDS.minZ + DUNGEON_BOUNDS.maxZ) / 2,
          ]}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(DUNGEON_RUINS_GLB_URL);
