'use client';

import { useEffect, useMemo } from 'react';
import { Box3, MeshStandardMaterial, Vector3, type Object3D } from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { clearDungeonVisualLiftTiles, setDungeonVisualLiftTiles } from '@/lib/dungeonVisualLift';

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

const WALL_HEIGHT = 10.5;
const WALL_THICKNESS = 0.8;
const FLOOR_THICKNESS = 0.45;
const CEILING_THICKNESS = 0.35;
const DOOR_WIDTH = 6;
const FLOOR_TILE_OVERLAP = 0.015;
const UNDERFLOOR_SIZE: Vec3 = [220, 0.2, 220];
const UNDERFLOOR_Y = -0.2;

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
  corridor: {
    primary: 'Floor_Standard',
    accent: 'Floor_Squares',
    filler: 'Floor_Standard',
  },
};

const ROOM_LAYOUT: RoomSpec[] = [
  {
    id: 'room-a',
    center: [0, 0, 0],
    size: { w: 40, d: 40 },
    openings: { north: true },
  },
  {
    id: 'room-b',
    center: [0, 0, 52],
    size: { w: 40, d: 40 },
    openings: { south: true, east: true, west: true },
  },
  {
    id: 'room-c',
    center: [52, 0, 52],
    size: { w: 40, d: 40 },
    openings: { west: true },
  },
  {
    id: 'room-hidden',
    center: [-52, 0, 52],
    size: { w: 40, d: 40 },
    openings: { east: true },
  },
];

const CORRIDOR_LAYOUT: CorridorSpec[] = [
  { id: 'corridor-a', center: [0, 0, 26], length: 12, width: 6, axis: 'z' },
  { id: 'corridor-c', center: [26, 0, 52], length: 12, width: 6, axis: 'x' },
  { id: 'corridor-hidden', center: [-26, 0, 52], length: 12, width: 6, axis: 'x' },
];

const WALL_KIT_VARIANTS = [
  'Wall',
  'Wall_Overgrown',
  'Wall_Broken',
  'Wall_Half',
  'Wall_Hole',
  'Wall_Double_Broken',
  'Wall_Double_Hole',
  'Wall_ArchRound_Broken',
  'Wall_ArchRound_Overgrown',
  'Wall_ArchRound_Overgrown_Broken',
] as const;

const WINDOW_KIT_VARIANTS = [
  'Window_Bars',
  'Window_Bars_Overgrown',
  'Window_Bars_Double_Overgrown',
  'Window_Open',
  'Window_Open_Double',
] as const;

const DOOR_KIT_VARIANTS = [
  'Doors_GothicArch_Covered',
  'Doors_GothicArch_L',
  'Doors_GothicArch_R',
  'Doors_RoundArch_Covered',
  'Doors_RoundArch_L',
  'Doors_RoundArch_R',
] as const;

const ARCH_KIT_VARIANTS = [
  'Arch_Gothic',
  'Arch_Gothic_RoundColumn',
  'Arch_Round',
  'Arch_Round_RoundColumn',
  'Wall_ArchGothic',
  'Wall_ArchRound',
] as const;

const COLUMN_KIT_VARIANTS = [
  'Column_Round',
  'Column_Round_Short',
  'Column_Square',
  'Column_BridgeSupport',
] as const;

const SUPPORT_KIT_VARIANTS = ['Support_Left', 'Support_Right', 'Support_Center', 'Support_Tall'] as const;
const FLAG_KIT_VARIANTS = ['Flag_Wall', 'Flag_Wall2', 'Flag_GothicArch', 'Flag_RoundArch'] as const;

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
          position: [cx, wallY, cz + (side === 'north' ? halfD : -halfD)],
          material: wallMaterial,
        },
      ];
    }
    return [
      {
        id: `${id}-${side}`,
        size: [WALL_THICKNESS, WALL_HEIGHT, size.d],
        position: [cx + (side === 'east' ? halfW : -halfW), wallY, cz],
        material: wallMaterial,
      },
    ];
  }

  const segments: BoxPiece[] = [];
  if (side === 'north' || side === 'south') {
    const segLength = (size.w - DOOR_WIDTH) / 2;
    const z = cz + (side === 'north' ? halfD : -halfD);
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
    const x = cx + (side === 'east' ? halfW : -halfW);
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
  const offset = axis === 'z' ? width / 2 : width / 2;
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

export default function DungeonWorld() {
  const { nodes } = useGLTF('/models/dungeon/structure/Modular Ruins Pack.glb') as {
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
    const baseStep = baseFootprint;
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

    return [
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

  const wallDecor = useMemo(() => {
    if (!nodes) return [];

    type DecorPlacement = {
      id: string;
      name: string;
      position: Vec3;
      rotationY: number;
      scale: number;
    };

    type NodeMetrics = {
      baseY: number;
      spanX: number;
      spanZ: number;
    };

    const available = (names: readonly string[]) => names.filter((name) => Boolean(nodes[name]));
    const wallPool = available(WALL_KIT_VARIANTS);
    const windowPool = available(WINDOW_KIT_VARIANTS);
    const doorPool = available(DOOR_KIT_VARIANTS);
    const archPool = available(ARCH_KIT_VARIANTS);
    const columnPool = available(COLUMN_KIT_VARIANTS);
    const supportPool = available(SUPPORT_KIT_VARIANTS);
    const flagPool = available(FLAG_KIT_VARIANTS);

    const metricCache = new Map<string, NodeMetrics>();
    const getMetrics = (name: string): NodeMetrics => {
      if (metricCache.has(name)) return metricCache.get(name)!;
      const source = nodes[name];
      if (!source) {
        const fallback = { baseY: 0, spanX: 4, spanZ: 1 };
        metricCache.set(name, fallback);
        return fallback;
      }
      const probe = source.clone(true);
      probe.position.set(0, 0, 0);
      probe.rotation.set(-Math.PI / 2, 0, 0);
      probe.updateMatrixWorld(true);
      const box = new Box3().setFromObject(probe);
      const size = new Vector3();
      box.getSize(size);
      const metrics = {
        baseY: -box.min.y + 0.01,
        spanX: Math.max(1, size.x || 1),
        spanZ: Math.max(1, size.z || 1),
      };
      metricCache.set(name, metrics);
      return metrics;
    };

    const cursor = {
      door: 0,
      arch: 0,
      column: 0,
      window: 0,
      support: 0,
      flag: 0,
    };
    const nextFrom = (pool: string[], key: keyof typeof cursor) => {
      if (!pool.length) return null;
      const name = pool[cursor[key] % pool.length];
      cursor[key] += 1;
      return name;
    };

    const placements: DecorPlacement[] = [];
    let placementCounter = 0;
    const addPlacement = (
      name: string | null,
      position: Vec3,
      rotationY: number,
      scale = 1,
      yOffset = 0,
      idPrefix = 'decor',
    ) => {
      if (!name || !nodes[name]) return;
      const metrics = getMetrics(name);
      placements.push({
        id: `${idPrefix}-${placementCounter++}`,
        name,
        position: [position[0], metrics.baseY + yOffset, position[2]],
        rotationY,
        scale,
      });
    };

    const placeDoorwaySet = (position: Vec3, rotationY: number) => {
      const door = nextFrom(doorPool, 'door');
      const arch = nextFrom(archPool, 'arch');
      const columnLeft = nextFrom(columnPool, 'column');
      const columnRight = nextFrom(columnPool, 'column');
      const support = nextFrom(supportPool, 'support');
      addPlacement(door, position, rotationY, 1, 0, 'door');
      addPlacement(arch, position, rotationY, 1, 0, 'arch');
      addPlacement(support, position, rotationY, 1, 0, 'support');
      const sideOffset = DOOR_WIDTH * 0.45;
      const tangentX = Math.cos(rotationY);
      const tangentZ = -Math.sin(rotationY);
      addPlacement(
        columnLeft,
        [position[0] - tangentX * sideOffset, position[1], position[2] - tangentZ * sideOffset],
        rotationY,
        1,
        0,
        'column',
      );
      addPlacement(
        columnRight,
        [position[0] + tangentX * sideOffset, position[1], position[2] + tangentZ * sideOffset],
        rotationY,
        1,
        0,
        'column',
      );
    };

    const sideRotation = (side: keyof WallOpening) => {
      if (side === 'north') return 0;
      if (side === 'south') return Math.PI;
      if (side === 'east') return -Math.PI / 2;
      return Math.PI / 2;
    };

    const wallPieces = pieces.filter((piece) => piece.id.includes('-wall'));
    const baseSpan = Math.max(3.2, getMetrics(wallPool[0] ?? 'Wall').spanX);
    wallPieces.forEach((piece) => {
      const axis: 'x' | 'z' = piece.size[0] >= piece.size[2] ? 'x' : 'z';
      const length = axis === 'x' ? piece.size[0] : piece.size[2];
      const slots = Math.max(1, Math.round(length / baseSpan));
      const spacing = length / slots;
      const rotationY = axis === 'x' ? 0 : Math.PI / 2;

      for (let i = 0; i < slots; i += 1) {
        const offset = -length / 2 + spacing * (i + 0.5);
        const x = piece.position[0] + (axis === 'x' ? offset : 0);
        const z = piece.position[2] + (axis === 'z' ? offset : 0);
        const seed = hashText(`${piece.id}:${i}`);
        let nodeName = wallPool.length ? wallPool[seed % wallPool.length] : null;

        if (windowPool.length && slots >= 3 && i === Math.floor(slots / 2) && !piece.id.includes('corridor')) {
          nodeName = nextFrom(windowPool, 'window');
        }
        if (supportPool.length && piece.id.includes('corridor') && i % 4 === 1) {
          nodeName = nextFrom(supportPool, 'support');
        }

        addPlacement(nodeName, [x, 0, z], rotationY, 1, 0, 'wall');

        if (flagPool.length && !piece.id.includes('corridor') && i === slots - 1 && slots > 2) {
          addPlacement(nextFrom(flagPool, 'flag'), [x, 0, z], rotationY, 1, 1.6, 'flag');
        }
      }
    });

    ROOM_LAYOUT.forEach((room) => {
      const [cx, cy, cz] = room.center;
      const halfW = room.size.w / 2;
      const halfD = room.size.d / 2;
      const openings = room.openings ?? {};

      const sideCenter = (side: keyof WallOpening): Vec3 => {
        if (side === 'north') return [cx, cy, cz + halfD];
        if (side === 'south') return [cx, cy, cz - halfD];
        if (side === 'east') return [cx + halfW, cy, cz];
        return [cx - halfW, cy, cz];
      };

      const closedWindowOffsets: Record<keyof WallOpening, Vec3[]> = {
        north: [
          [cx - room.size.w * 0.28, cy, cz + halfD],
          [cx + room.size.w * 0.28, cy, cz + halfD],
        ],
        south: [
          [cx - room.size.w * 0.28, cy, cz - halfD],
          [cx + room.size.w * 0.28, cy, cz - halfD],
        ],
        east: [
          [cx + halfW, cy, cz - room.size.d * 0.28],
          [cx + halfW, cy, cz + room.size.d * 0.28],
        ],
        west: [
          [cx - halfW, cy, cz - room.size.d * 0.28],
          [cx - halfW, cy, cz + room.size.d * 0.28],
        ],
      };

      (['north', 'south', 'east', 'west'] as const).forEach((side) => {
        const rotationY = sideRotation(side);
        if (openings[side]) {
          placeDoorwaySet(sideCenter(side), rotationY);
        } else {
          const windowA = nextFrom(windowPool, 'window');
          const windowB = nextFrom(windowPool, 'window');
          const [posA, posB] = closedWindowOffsets[side];
          addPlacement(windowA, posA, rotationY, 1, 0, 'window');
          addPlacement(windowB, posB, rotationY, 1, 0, 'window');
          addPlacement(nextFrom(flagPool, 'flag'), sideCenter(side), rotationY, 1, 1.4, 'flag');
        }
      });
    });

    CORRIDOR_LAYOUT.forEach((corridor) => {
      const [cx, cy, cz] = corridor.center;
      if (corridor.axis === 'z') {
        placeDoorwaySet([cx, cy, cz + corridor.length / 2], 0);
        placeDoorwaySet([cx, cy, cz - corridor.length / 2], Math.PI);
      } else {
        placeDoorwaySet([cx + corridor.length / 2, cy, cz], -Math.PI / 2);
        placeDoorwaySet([cx - corridor.length / 2, cy, cz], Math.PI / 2);
      }
    });

    return placements;
  }, [nodes, pieces]);

  return (
    <group name="dungeon-world">
      {pieces.map((piece) => (
        <mesh
          key={`mesh-${piece.id}`}
          position={piece.position}
          castShadow={false}
          receiveShadow={piece.id.includes('floor')}
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

      {FLOOR_OVERLAY
        ? floorPattern.map((tile) => {
            const node = nodes?.[tile.name];
            if (!node) return null;
            const placed = node.clone(true);
            placed.position.set(tile.position[0], tile.position[1], tile.position[2]);
            placed.rotation.set(-Math.PI / 2, 0, 0);
            placed.updateMatrixWorld(true);
            return <primitive key={`tile-${tile.id}`} object={placed} />;
          })
        : null}

      {wallDecor.map((decor) => {
        const node = nodes?.[decor.name];
        if (!node) return null;
        const placed = node.clone(true);
        placed.traverse((child) => {
          const mesh = child as Object3D & { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean };
          if (mesh.isMesh) {
            mesh.castShadow = false;
            mesh.receiveShadow = true;
          }
        });
        placed.position.set(decor.position[0], decor.position[1], decor.position[2]);
        placed.rotation.set(-Math.PI / 2, decor.rotationY, 0);
        placed.scale.setScalar(decor.scale);
        placed.updateMatrixWorld(true);
        return <primitive key={`decor-${decor.id}`} object={placed} />;
      })}

      <RigidBody type="fixed" colliders={false} name="dungeon-colliders">
        {pieces.map((piece) => (
          <CuboidCollider
            key={`collider-${piece.id}`}
            args={[piece.size[0] / 2, piece.size[1] / 2, piece.size[2] / 2]}
            position={piece.position}
          />
        ))}
        <CuboidCollider args={[180, 1, 180]} position={[0, -4, 0]} />
        {/* Outer bounds to keep camera/player inside */}
        <CuboidCollider args={[1, 12, 110]} position={[85, 5, 0]} />
        <CuboidCollider args={[1, 12, 110]} position={[-85, 5, 0]} />
        <CuboidCollider args={[110, 12, 1]} position={[0, 5, 85]} />
        <CuboidCollider args={[110, 12, 1]} position={[0, 5, -85]} />
      </RigidBody>
    </group>
  );
}
