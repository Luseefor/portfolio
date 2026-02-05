'use client';

import { Fragment, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

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

const WALL_HEIGHT = 4.2;
const WALL_THICKNESS = 0.4;
const FLOOR_THICKNESS = 0.35;
const DOOR_WIDTH = 3.2;

type BoxPiece = {
  id: string;
  size: Vec3;
  position: Vec3;
  material: MeshStandardMaterial;
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
  const pieces = useMemo(() => {
    const rooms: RoomSpec[] = [
      {
        id: 'room-a',
        center: [0, 0, 0],
        size: { w: 12, d: 12 },
        openings: { north: true },
      },
      {
        id: 'room-b',
        center: [0, 0, 18],
        size: { w: 12, d: 12 },
        openings: { south: true, east: true, west: true },
      },
      {
        id: 'room-c',
        center: [18, 0, 18],
        size: { w: 12, d: 12 },
        openings: { west: true },
      },
      {
        id: 'room-hidden',
        center: [-18, 0, 18],
        size: { w: 12, d: 12 },
        openings: { east: true },
      },
    ];

    const corridorA = buildCorridor('corridor-a', [0, 0, 9], 6, 4, 'z');
    const corridorC = buildCorridor('corridor-c', [9, 0, 18], 6, 4, 'x');
    const corridorHidden = buildCorridor('corridor-hidden', [-9, 0, 18], 6, 4, 'x');

    const hiddenGapFiller: BoxPiece = {
      id: 'hidden-gap-filler',
      size: [4, FLOOR_THICKNESS, 4],
      position: [-12, -FLOOR_THICKNESS / 2, 18],
      material: floorMaterial,
    };

    return [
      ...rooms.flatMap(buildRoom),
      ...corridorA,
      ...corridorC,
      ...corridorHidden,
      hiddenGapFiller,
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
        >
          <boxGeometry args={piece.size} />
        </mesh>
      ))}

      <RigidBody type="fixed" colliders={false} name="dungeon-colliders">
        {pieces.map((piece) => (
          <CuboidCollider
            key={`collider-${piece.id}`}
            args={[piece.size[0] / 2, piece.size[1] / 2, piece.size[2] / 2]}
            position={piece.position}
          />
        ))}
        <CuboidCollider args={[80, 1, 80]} position={[0, -4, 0]} />
        {/* Outer bounds to keep camera/player inside */}
        <CuboidCollider args={[1, 6, 50]} position={[40, 2, 0]} />
        <CuboidCollider args={[1, 6, 50]} position={[-40, 2, 0]} />
        <CuboidCollider args={[50, 6, 1]} position={[0, 2, 40]} />
        <CuboidCollider args={[50, 6, 1]} position={[0, 2, -40]} />
      </RigidBody>
    </group>
  );
}
