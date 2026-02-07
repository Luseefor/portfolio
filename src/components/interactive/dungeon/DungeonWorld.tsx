'use client';

import { useMemo } from 'react';
import { Box3, MeshStandardMaterial, Vector3, type Object3D } from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';

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
    const rooms: RoomSpec[] = [
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

    const corridorA = buildCorridor('corridor-a', [0, 0, 26], 12, 6, 'z');
    const corridorC = buildCorridor('corridor-c', [26, 0, 52], 12, 6, 'x');
    const corridorHidden = buildCorridor('corridor-hidden', [-26, 0, 52], 12, 6, 'x');

    return [
      ...rooms.flatMap(buildRoom),
      ...corridorA,
      ...corridorC,
      ...corridorHidden,
    ];
  }, []);

  const floorPattern = useMemo(() => {
    if (!nodes || !FLOOR_OVERLAY) return [];

    const resolveNode = (name: string) => nodes?.[name] ?? null;
    const sizeCache = new Map<string, Vector3>();

    const getTileSize = (name: string) => {
      if (sizeCache.has(name)) return sizeCache.get(name)!;
      const node = resolveNode(name);
      if (!node) return null;
      const clone = node.clone(true);
      clone.position.set(0, 0, 0);
      clone.rotation.set(-Math.PI / 2, 0, 0);
      clone.updateMatrixWorld(true);
      const box = new Box3().setFromObject(clone);
      const size = new Vector3();
      box.getSize(size);
      sizeCache.set(name, size);
      return size;
    };

    const baseSize = getTileSize(FLOOR_TILES.primary);
    if (!baseSize) return [];
    const baseStep = Math.max(baseSize.x || 1, baseSize.z || 1);
    const step = baseStep * (1 - FLOOR_TILE_OVERLAP);

    const isCompatibleFootprint = (name: string) => {
      const size = getTileSize(name);
      if (!size || baseStep <= 0) return false;
      const footprint = Math.max(size.x || 0, size.z || 0);
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
        if (isStripe) return safeTile(FLOOR_TILES.accent);
        if (edge) return safeTile(FLOOR_TILES.filler);
        if (onAxis && checker) return safeTile(FLOOR_TILES.filler);
        return safeTile(FLOOR_TILES.primary);
      }

      if (isCenter) return safeTile(FLOOR_TILES.accent);
      if (edge) return safeTile(FLOOR_TILES.accent);
      if (innerEdge && checker) return safeTile(FLOOR_TILES.filler);
      if (ring === 2) return safeTile(FLOOR_TILES.accent);
      if (ring === 3 && checker) return safeTile(FLOOR_TILES.filler);
      if (ring === 4 && onDiagonal) return safeTile(FLOOR_TILES.accent);
      if (ring === 5 && onAxis && checker) return safeTile(FLOOR_TILES.filler);
      if (ring === 6 && checker) return safeTile(FLOOR_TILES.accent);
      return safeTile(FLOOR_TILES.primary);
    };

    const buildArea = (
      center: Vec3,
      size: { w: number; d: number },
      kind: 'room' | 'corridor',
    ) => {
      const [cx, cy, cz] = center;
      const halfW = size.w / 2;
      const halfD = size.d / 2;
      const tiles: { id: string; name: string; position: Vec3 }[] = [];
      const gxCount = Math.ceil(size.w / step);
      const gzCount = Math.ceil(size.d / step);
      for (let gx = 0; gx < gxCount; gx += 1) {
        for (let gz = 0; gz < gzCount; gz += 1) {
          const x = -halfW + step / 2 + gx * step;
          const z = -halfD + step / 2 + gz * step;
          tiles.push({
            id: `${center[0]}-${center[2]}-${gx}-${gz}`,
            name: pickTile(gx, gz, gxCount, gzCount, kind),
            position: [cx + x, cy + 0.02, cz + z],
          });
        }
      }
      return tiles;
    };

    const rooms: RoomSpec[] = [
      { id: 'room-a', center: [0, 0, 0], size: { w: 40, d: 40 }, openings: { north: true } },
      { id: 'room-b', center: [0, 0, 52], size: { w: 40, d: 40 }, openings: { south: true, east: true, west: true } },
      { id: 'room-c', center: [52, 0, 52], size: { w: 40, d: 40 }, openings: { west: true } },
      { id: 'room-hidden', center: [-52, 0, 52], size: { w: 40, d: 40 }, openings: { east: true } },
    ];
    const corridors = [
      { center: [0, 0, 26] as Vec3, size: { w: 6, d: 12 } },
      { center: [26, 0, 52] as Vec3, size: { w: 12, d: 6 } },
      { center: [-26, 0, 52] as Vec3, size: { w: 12, d: 6 } },
    ];

    return [
      ...rooms.flatMap((room) => buildArea(room.center, room.size, 'room')),
      ...corridors.flatMap((corr) => buildArea(corr.center, corr.size, 'corridor')),
    ];
  }, [nodes]);

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
