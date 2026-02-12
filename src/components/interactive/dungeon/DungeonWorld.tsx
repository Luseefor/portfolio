'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import {
  Box3,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import { DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';
import {
  buildDungeon,
  type DungeonBuildPiece,
  type DungeonPieceKind,
} from '@/game/dungeon/buildDungeon';
import { createSafeNodeResolver } from '@/game/dungeon/utils';
import { clearDungeonVisualLiftTiles, setDungeonVisualLiftTiles } from '@/lib/dungeonVisualLift';

const RUINS_GLB_PATH = '/models/dungeon/structure/Modular Ruins Pack.glb';
const FLOOR_NODE_FALLBACKS = ['Floor_Standard', 'Floor_Squares', 'Floor_SquareLarge'] as const;

const FLOOR_KINDS = new Set<DungeonPieceKind>(['floor', 'corridor-floor', 'spawn-platform']);
const BORDER_LINE_SOURCE_KINDS = new Set<DungeonPieceKind>([
  'floor',
  'corridor-floor',
  'spawn-platform',
  'room-wall',
  'corridor-wall',
  'boundary-wall',
]);
const BORDER_WALL_SOURCE_KINDS = new Set<DungeonPieceKind>([
  'floor',
  'corridor-floor',
  'room-wall',
  'corridor-wall',
  'boundary-wall',
]);

const BORDER_STEP = 0.5;
const BORDER_THICKNESS = 0.18;
const BORDER_HEIGHT = 0.08;
const WALL_BORDER_Y = 0.05;
const BASE_BORDER_WALL_HEIGHT = 7.4;
const BORDER_WALL_HEIGHT = BASE_BORDER_WALL_HEIGHT * 1.5;
const BORDER_WALL_THICKNESS = 0.24;
const BORDER_COLLIDER_PAD = 0.06;
const BORDER_COLLIDER_HEIGHT_PAD = 0.12;
const SPAWN_BORDER_HIDE_PADDING = 1.4;
const FLOOR_UNDERLAY_THICKNESS = 0.08;
const FLOOR_UNDERLAY_EXPAND = 0.24;
const FLOOR_UNDERLAY_DROP = 0.02;
const SPAWN_UNDERLAY_THICKNESS = 0.14;
const SPAWN_UNDERLAY_EXPAND = 0.9;
const SPAWN_UNDERLAY_DROP = 0.04;

const floorMaterial = new MeshStandardMaterial({ color: '#252825', roughness: 0.96, metalness: 0.02 });
const corridorMaterial = new MeshStandardMaterial({ color: '#2e322e', roughness: 0.95, metalness: 0.02 });
const spawnMaterial = new MeshStandardMaterial({ color: '#3f4c3d', roughness: 0.88, metalness: 0.03 });
const floorUnderlayMaterial = new MeshStandardMaterial({
  color: '#5b3a1f',
  roughness: 0.98,
  metalness: 0.01,
});
const borderMaterial = new MeshBasicMaterial({ color: '#ffe100' });
const borderWallMaterial = new MeshBasicMaterial({
  color: '#ffe100',
  transparent: true,
  opacity: 0.28,
});

type BorderSegment = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
};

type UnitSegment = {
  orientation: 'h' | 'v';
  fixed: number;
  start: number;
  end: number;
  y: number;
};

type FloorVisual = {
  piece: DungeonBuildPiece;
  object: Object3D | null;
};

function topOverlayY() {
  // Use a single plane for all debug borders to avoid stacked stripe artifacts.
  return WALL_BORDER_Y;
}

function materialForFloor(piece: DungeonBuildPiece) {
  if (piece.kind === 'spawn-platform') {
    return spawnMaterial;
  }
  if (piece.kind === 'corridor-floor') {
    return corridorMaterial;
  }
  return floorMaterial;
}

function underlaySpecForFloor(piece: DungeonBuildPiece) {
  if (piece.kind === 'spawn-platform') {
    return {
      thickness: SPAWN_UNDERLAY_THICKNESS,
      expand: SPAWN_UNDERLAY_EXPAND,
      drop: SPAWN_UNDERLAY_DROP,
    };
  }

  return {
    thickness: FLOOR_UNDERLAY_THICKNESS,
    expand: FLOOR_UNDERLAY_EXPAND,
    drop: FLOOR_UNDERLAY_DROP,
  };
}

function sanitizeSize(value: number) {
  return Number.isFinite(value) && value > 0.0001 ? value : 1;
}

function markFloorMeshForShadows(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.castShadow = false;
    child.receiveShadow = true;
  });
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function floorNodeCandidates(piece: DungeonBuildPiece): readonly string[] {
  if (piece.kind === 'spawn-platform') {
    return ['Floor_SquareLarge', 'Floor_Squares', 'Floor_Standard'];
  }

  const baseVariants =
    piece.kind === 'corridor-floor'
      ? (['Floor_Standard', 'Floor_Squares'] as const)
      : FLOOR_NODE_FALLBACKS;
  const start = hashString(piece.id) % baseVariants.length;
  const rotated: string[] = [...baseVariants.slice(start), ...baseVariants.slice(0, start)];

  const preferred = piece.nodeKey;
  if (rotated.includes(preferred)) {
    return [preferred, ...rotated.filter((key) => key !== preferred)];
  }

  return [preferred, ...rotated];
}

function buildScaledFloorObject(
  sourceNode: Object3D,
  targetSize: [number, number, number],
): Object3D | null {
  const clone = sourceNode.clone(true);
  markFloorMeshForShadows(clone);
  clone.updateMatrixWorld(true);

  const box = new Box3().setFromObject(clone);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  if (size.lengthSq() < 1e-8) {
    return null;
  }

  const sx = targetSize[0] / sanitizeSize(size.x);
  const sy = targetSize[1] / sanitizeSize(size.y);
  const sz = targetSize[2] / sanitizeSize(size.z);

  clone.position.sub(center);

  const wrapper = new Object3D();
  wrapper.scale.set(sx, sy, sz);
  wrapper.add(clone);
  wrapper.updateMatrixWorld(true);
  return wrapper;
}

function borderKey(
  orientation: 'h' | 'v',
  fixed: number,
  start: number,
  end: number,
  y: number,
) {
  return `${orientation}|${fixed.toFixed(3)}|${start.toFixed(3)}|${end.toFixed(3)}|${y.toFixed(3)}`;
}

function parseBorderKey(key: string): UnitSegment {
  const [orientationRaw, fixedRaw, startRaw, endRaw, yRaw] = key.split('|');
  return {
    orientation: orientationRaw === 'v' ? 'v' : 'h',
    fixed: Number(fixedRaw),
    start: Number(startRaw),
    end: Number(endRaw),
    y: Number(yRaw),
  };
}

function addEdgeSegments(
  segments: Set<string>,
  orientation: 'h' | 'v',
  fixed: number,
  start: number,
  end: number,
  y: number,
) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);

  for (let cursor = min; cursor < max - 1e-6; cursor += BORDER_STEP) {
    const segStart = cursor;
    const segEnd = Math.min(max, cursor + BORDER_STEP);
    const key = borderKey(orientation, fixed, segStart, segEnd, y);

    if (segments.has(key)) {
      segments.delete(key);
    } else {
      segments.add(key);
    }
  }
}

function buildBorderSegments(pieces: DungeonBuildPiece[]): BorderSegment[] {
  const unitSegments = new Set<string>();

  for (let i = 0; i < pieces.length; i += 1) {
    const piece = pieces[i];
    const halfX = piece.size[0] / 2;
    const halfZ = piece.size[2] / 2;
    const minX = piece.position[0] - halfX;
    const maxX = piece.position[0] + halfX;
    const minZ = piece.position[2] - halfZ;
    const maxZ = piece.position[2] + halfZ;
    const y = topOverlayY();

    addEdgeSegments(unitSegments, 'h', minZ, minX, maxX, y);
    addEdgeSegments(unitSegments, 'h', maxZ, minX, maxX, y);
    addEdgeSegments(unitSegments, 'v', minX, minZ, maxZ, y);
    addEdgeSegments(unitSegments, 'v', maxX, minZ, maxZ, y);
  }

  const groups = new Map<string, UnitSegment[]>();
  for (const key of unitSegments) {
    const seg = parseBorderKey(key);
    const groupKey = `${seg.orientation}|${seg.fixed.toFixed(3)}|${seg.y.toFixed(3)}`;
    const group = groups.get(groupKey);
    if (group) {
      group.push(seg);
    } else {
      groups.set(groupKey, [seg]);
    }
  }

  const borders: BorderSegment[] = [];
  let index = 0;
  for (const group of groups.values()) {
    group.sort((a, b) => a.start - b.start);

    let runStart = group[0].start;
    let runEnd = group[0].end;
    const orientation = group[0].orientation;
    const fixed = group[0].fixed;
    const y = group[0].y;

    const flushRun = () => {
      const length = Math.max(0.01, runEnd - runStart);
      if (orientation === 'h') {
        borders.push({
          id: `border-${index}`,
          position: [(runStart + runEnd) / 2, y, fixed],
          size: [length, BORDER_HEIGHT, BORDER_THICKNESS],
        });
      } else {
        borders.push({
          id: `border-${index}`,
          position: [fixed, y, (runStart + runEnd) / 2],
          size: [BORDER_THICKNESS, BORDER_HEIGHT, length],
        });
      }
      index += 1;
    };

    for (let i = 1; i < group.length; i += 1) {
      const next = group[i];
      if (next.start <= runEnd + BORDER_STEP * 0.6) {
        runEnd = Math.max(runEnd, next.end);
      } else {
        flushRun();
        runStart = next.start;
        runEnd = next.end;
      }
    }

    flushRun();
  }

  return borders;
}

function buildVerticalBorderWalls(segments: BorderSegment[]): BorderSegment[] {
  const walls: BorderSegment[] = [];

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    const wallBaseY = segment.position[1] + BORDER_HEIGHT * 0.5;
    walls.push({
      id: `wall-${segment.id}`,
      position: [
        segment.position[0],
        wallBaseY + BORDER_WALL_HEIGHT * 0.5,
        segment.position[2],
      ],
      size: [
        Math.max(BORDER_WALL_THICKNESS, segment.size[0]),
        BORDER_WALL_HEIGHT,
        Math.max(BORDER_WALL_THICKNESS, segment.size[2]),
      ],
    });
  }

  return walls;
}

function isSegmentInsideSpawnCutout(segment: BorderSegment) {
  const spawn = DUNGEON_LAYOUT_GRAPH.spawnPlatform;
  const minX = spawn.center[0] - spawn.size.width * 0.5 - SPAWN_BORDER_HIDE_PADDING;
  const maxX = spawn.center[0] + spawn.size.width * 0.5 + SPAWN_BORDER_HIDE_PADDING;
  const minZ = spawn.center[2] - spawn.size.depth * 0.5 - SPAWN_BORDER_HIDE_PADDING;
  const maxZ = spawn.center[2] + spawn.size.depth * 0.5 + SPAWN_BORDER_HIDE_PADDING;

  return (
    segment.position[0] >= minX &&
    segment.position[0] <= maxX &&
    segment.position[2] >= minZ &&
    segment.position[2] <= maxZ
  );
}

export default function DungeonWorld() {
  const ruins = useGLTF(RUINS_GLB_PATH) as { nodes?: Record<string, Object3D> };
  const ruinsNodes = useMemo(() => ruins.nodes ?? {}, [ruins.nodes]);
  const resolveNode = useMemo(() => createSafeNodeResolver(ruinsNodes), [ruinsNodes]);

  const dungeon = useMemo(() => buildDungeon(DUNGEON_LAYOUT_GRAPH), []);

  const floorPieces = useMemo(
    () => dungeon.pieces.filter((piece) => FLOOR_KINDS.has(piece.kind)),
    [dungeon.pieces],
  );

  const floorVisuals = useMemo<FloorVisual[]>(() => {
    return floorPieces.map((piece) => {
      const nodeCandidates = floorNodeCandidates(piece);
      const sourceNode = resolveNode(nodeCandidates[0], nodeCandidates.slice(1), `floor:${piece.id}`);
      if (!sourceNode) {
        return { piece, object: null };
      }

      const floorObject = buildScaledFloorObject(sourceNode, piece.size);
      if (!floorObject) {
        return { piece, object: null };
      }

      return { piece, object: floorObject };
    });
  }, [floorPieces, resolveNode]);

  const floorIds = useMemo(() => new Set(floorPieces.map((piece) => piece.id)), [floorPieces]);

  const floorColliders = useMemo(
    () => dungeon.colliders.filter((collider) => floorIds.has(collider.id)),
    [dungeon.colliders, floorIds],
  );

  const borderSegments = useMemo(
    () =>
      buildBorderSegments(dungeon.pieces.filter((piece) => BORDER_LINE_SOURCE_KINDS.has(piece.kind))).filter(
        (segment) => !isSegmentInsideSpawnCutout(segment),
      ),
    [dungeon.pieces],
  );

  const borderWallSegments = useMemo(
    () => buildBorderSegments(dungeon.pieces.filter((piece) => BORDER_WALL_SOURCE_KINDS.has(piece.kind))),
    [dungeon.pieces],
  );

  const borderWalls = useMemo(
    () => buildVerticalBorderWalls(borderWallSegments),
    [borderWallSegments],
  );

  const borderColliders = useMemo(
    () =>
      borderWalls.map((wall) => ({
        id: `collider-${wall.id}`,
        position: wall.position,
        size: [
          wall.size[0] + BORDER_COLLIDER_PAD,
          wall.size[1] + BORDER_COLLIDER_HEIGHT_PAD,
          wall.size[2] + BORDER_COLLIDER_PAD,
        ] as [number, number, number],
      })),
    [borderWalls],
  );

  useEffect(() => {
    setDungeonVisualLiftTiles(dungeon.walkableTiles);
    return () => {
      clearDungeonVisualLiftTiles();
    };
  }, [dungeon.walkableTiles]);

  return (
      <group name="dungeon-world-debug-layout">
      {floorVisuals.map(({ piece, object }) => (
        <group key={piece.id} position={piece.position} rotation={[0, piece.rotationY, 0]}>
          {(() => {
            const underlay = underlaySpecForFloor(piece);
            return (
              <mesh
                position={[0, -(piece.size[1] * 0.5 + underlay.thickness * 0.5 + underlay.drop), 0]}
                material={floorUnderlayMaterial}
                castShadow={false}
                receiveShadow
              >
                <boxGeometry
                  args={[
                    piece.size[0] + underlay.expand,
                    underlay.thickness,
                    piece.size[2] + underlay.expand,
                  ]}
                />
              </mesh>
            );
          })()}
          {object ? (
            <primitive object={object} />
          ) : (
            <mesh material={materialForFloor(piece)} castShadow={false} receiveShadow>
              <boxGeometry args={piece.size} />
            </mesh>
          )}
        </group>
      ))}

      {borderSegments.map((segment) => (
        <mesh
          key={segment.id}
          position={segment.position}
          material={borderMaterial}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={segment.size} />
        </mesh>
      ))}

      {borderWalls.map((wall) => (
        <mesh
          key={wall.id}
          position={wall.position}
          material={borderWallMaterial}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={wall.size} />
        </mesh>
      ))}

      <RigidBody type="fixed" colliders={false} name="dungeon-world-colliders">
        {floorColliders.map((collider) => (
          <CuboidCollider
            key={collider.id}
            args={[collider.size[0] / 2, collider.size[1] / 2, collider.size[2] / 2]}
            position={collider.position}
          />
        ))}
        {borderColliders.map((collider) => (
          <CuboidCollider
            key={collider.id}
            args={[collider.size[0] / 2, collider.size[1] / 2, collider.size[2] / 2]}
            position={collider.position}
          />
        ))}
        <CuboidCollider args={[220, 0.2, 220]} position={[0, -0.3, 0]} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(RUINS_GLB_PATH);
