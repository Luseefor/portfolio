'use client';

import { Fragment, useMemo } from 'react';
import { Box3, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
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

const FLOOR_NODES = [
  'Floor_Diamond',
  'Floor_Hole_Corner',
  'Floor_Hole_Straight',
  'Floor_SquareLarge',
  'Floor_Squares',
  'Floor_Standard',
  'Floor_Standard_Half',
  'Floor_Tree',
] as const;

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
      visible: false,
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
    visible: false,
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
  const { nodes } = useGLTF('/models/dungeon/structure/Modular Ruins Pack.glb') as any;

  const floorTiles = useMemo(() => {
    const resolveMesh = (name: string) => {
      const node = nodes?.[name];
      if (!node) return null;
      if (node.isMesh) return node;
      if (node.children?.length) {
        return node.children.find((child: any) => child.isMesh) || null;
      }
      return null;
    };

    const bakedCache = new Map<
      string,
      { geometry: any; size: { x: number; y: number; z: number }; material: any }
    >();

    const bakeMesh = (name: string) => {
      if (bakedCache.has(name)) return bakedCache.get(name)!;
      const mesh = resolveMesh(name);
      if (!mesh?.geometry) {
        const fallback = { geometry: null, size: { x: 4, y: 0.2, z: 4 }, material: null };
        bakedCache.set(name, fallback);
        return fallback;
      }
      const baked = mesh.geometry.clone();
      const bakedMatrix = new Matrix4().compose(
        new Vector3(0, 0, 0),
        mesh.quaternion || new Quaternion(),
        mesh.scale || new Vector3(1, 1, 1),
      );
      baked.applyMatrix4(bakedMatrix);
      baked.computeBoundingBox();
      const box = baked.boundingBox || new Box3();
      const sizeVec = new Vector3();
      box.getSize(sizeVec);
      const center = new Vector3();
      box.getCenter(center);
      // Recenter so tiles place cleanly on grid and sit on y=0
      baked.translate(-center.x, -box.min.y, -center.z);
      baked.computeBoundingBox();
      const finalSize = new Vector3();
      baked.boundingBox?.getSize(finalSize);
      const entry = {
        geometry: baked,
        size: { x: finalSize.x || sizeVec.x || 4, y: finalSize.y || sizeVec.y || 0.2, z: finalSize.z || sizeVec.z || 4 },
        material: mesh.material,
      };
      bakedCache.set(name, entry);
      return entry;
    };

    const base = bakeMesh('Floor_SquareLarge');
    const baseTile = Math.max(3, Math.max(base.size.x || 4, base.size.z || 4));
    const tile = Math.max(baseTile, 6);

    const weightedTiles = [
      'Floor_Standard',
      'Floor_Standard',
      'Floor_Standard',
      'Floor_Standard',
      'Floor_Standard',
      'Floor_Standard',
      'Floor_Squares',
      'Floor_Squares',
      'Floor_Squares',
      'Floor_Diamond',
      'Floor_Diamond',
      'Floor_SquareLarge',
      'Floor_Standard_Half',
      'Floor_Tree',
      'Floor_Hole_Straight',
      'Floor_Hole_Corner',
    ] as const;

    const pickTile = (x: number, z: number) => {
      const hash = Math.abs(Math.floor((x * 73856093) ^ (z * 19349663)));
      return weightedTiles[hash % weightedTiles.length];
    };

    const buildArea = (center: Vec3, size: { w: number; d: number }, density = 1) => {
      const [cx, cy, cz] = center;
      const tiles: {
        id: string;
        name: (typeof FLOOR_NODES)[number] | string;
        position: Vec3;
        scale: Vec3;
        rotation: Quaternion;
        material: any;
        geometry: any;
      }[] = [];
      const halfW = size.w / 2;
      const halfD = size.d / 2;
      const step = tile * density;

      for (let x = -halfW + step / 2; x <= halfW - step / 2 + 0.001; x += step) {
        for (let z = -halfD + step / 2; z <= halfD - step / 2 + 0.001; z += step) {
          const name = pickTile(Math.round(x), Math.round(z));
          const baked = bakeMesh(name);
          if (!baked.geometry) continue;
          const scaleX = tile / Math.max(0.001, baked.size.x);
          const scaleZ = tile / Math.max(0.001, baked.size.z);
          tiles.push({
            id: `${name}-${cx + x}-${cz + z}`,
            name,
            position: [cx + x, cy + 0.03, cz + z],
            scale: [scaleX, 1, scaleZ],
            rotation: new Quaternion(),
            geometry: baked.geometry,
            material: baked.material,
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
      ...rooms.flatMap((room) => buildArea(room.center, room.size, 1)),
      ...corridors.flatMap((corr) => buildArea(corr.center, corr.size, 1)),
    ];
  }, [nodes]);
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

  return (
    <group name="dungeon-world">
      {pieces.map((piece) => (
        <mesh
          key={`mesh-${piece.id}`}
          position={piece.position}
          castShadow
          receiveShadow
          material={piece.material}
          visible={piece.visible !== false}
        >
          <boxGeometry args={piece.size} />
        </mesh>
      ))}

      {floorTiles.map((tile) => {
        return (
          <mesh
            key={`floor-${tile.id}`}
            geometry={tile.geometry}
            material={tile.material}
            position={tile.position}
            scale={tile.scale}
            quaternion={tile.rotation}
            receiveShadow
          />
        );
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
