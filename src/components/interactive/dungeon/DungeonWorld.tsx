'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import {
  Box3,
  DoubleSide,
  Material,
  Mesh,
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
const CEILING_NODE_FALLBACKS = ['Floor_Standard_Half', 'Floor_Standard', 'Floor_Squares'] as const;
const BUSH_NODE_FALLBACKS = ['Bush_1x1', 'Bush_2x1', 'Bush_Round', 'Bush_2x2', 'Bush_Large'] as const;
const WALL_NODE_FALLBACKS = [
  'Wall',
  'Wall_Overgrown',
  'Wall_Broken',
  'Window_Bars',
  'Window_Bars_Overgrown',
] as const;
const WALL_BACKER_NODE_FALLBACKS = ['Wall', 'Wall_Overgrown', 'Wall_Broken'] as const;

const FLOOR_KINDS = new Set<DungeonPieceKind>(['floor', 'corridor-floor', 'spawn-platform']);
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
const WALL_FLOOR_LEVEL_Y = 0;
const WALL_FLOOR_SINK = 0.16;
const WALL_PANEL_MAX_LENGTH = 4.2;
const WALL_PANEL_MIN_LENGTH = 1.2;
const WALL_FACE_SAMPLE_OFFSET = 0.7;
const WALL_FRONT_OFFSET_Y = 0;
const WALL_BACKER_OFFSET = 0.14;
const WALL_BACKER_THICKNESS = 0.2;
const WALL_BACKER_EXPAND_X = 0.28;
const WALL_BACKER_EXPAND_Y = 0.34;
const BORDER_COLLIDER_PAD = 0.06;
const BORDER_COLLIDER_HEIGHT_PAD = 0.12;
const SPAWN_BORDER_HIDE_PADDING = 1.4;
const FLOOR_UNDERLAY_THICKNESS = 0.08;
const FLOOR_UNDERLAY_EXPAND = 0.24;
const FLOOR_UNDERLAY_DROP = 0.02;
const FLOOR_VISUAL_OVERHANG = 0.42;
const CEILING_CLEARANCE = 8.2;
const CEILING_THICKNESS = 0.28;
const CEILING_EXPAND = 0.18;
const CEILING_CAP_THICKNESS = 0.08;
const CEILING_CAP_EXPAND = 0.32;
const CEILING_CAP_RISE = 0.03;
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
const ceilingFallbackMaterial = new MeshStandardMaterial({
  color: '#6d6659',
  roughness: 0.92,
  metalness: 0.04,
});
const ceilingCapMaterial = new MeshStandardMaterial({
  color: '#7c807f',
  roughness: 0.95,
  metalness: 0.02,
});
const wallFallbackMaterial = new MeshStandardMaterial({
  color: '#5f655f',
  roughness: 0.9,
  metalness: 0.03,
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

type CeilingVisual = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  object: Object3D | null;
};

type WallPanel = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  axis: 'x' | 'z';
};

type WallVisual = WallPanel & {
  object: Object3D | null;
};

type WallBackerVisual = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  object: Object3D | null;
};

type BushVisual = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
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

function cloneMaterialDoubleSided(material: Material) {
  const cloned = material.clone();
  cloned.side = DoubleSide;
  return cloned;
}

function setObjectMaterialsDoubleSided(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => cloneMaterialDoubleSided(material));
    } else if (child.material) {
      child.material = cloneMaterialDoubleSided(child.material);
    }
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

function ceilingNodeCandidates(piece: DungeonBuildPiece): readonly string[] {
  const start = hashString(`ceiling-${piece.id}`) % CEILING_NODE_FALLBACKS.length;
  const rotated: string[] = [
    ...CEILING_NODE_FALLBACKS.slice(start),
    ...CEILING_NODE_FALLBACKS.slice(0, start),
  ];
  return rotated;
}

function wallNodeCandidates(panelId: string): readonly string[] {
  const start = hashString(`wall-${panelId}`) % WALL_NODE_FALLBACKS.length;
  const rotated: string[] = [...WALL_NODE_FALLBACKS.slice(start), ...WALL_NODE_FALLBACKS.slice(0, start)];
  return rotated;
}

function wallBackerNodeCandidates(panelId: string): readonly string[] {
  const start = hashString(`wall-backer-${panelId}`) % WALL_BACKER_NODE_FALLBACKS.length;
  const rotated: string[] = [
    ...WALL_BACKER_NODE_FALLBACKS.slice(start),
    ...WALL_BACKER_NODE_FALLBACKS.slice(0, start),
  ];
  return rotated;
}

function bushNodeCandidates(id: string): readonly string[] {
  const start = hashString(`bush-${id}`) % BUSH_NODE_FALLBACKS.length;
  const rotated: string[] = [...BUSH_NODE_FALLBACKS.slice(start), ...BUSH_NODE_FALLBACKS.slice(0, start)];
  return rotated;
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
    const wallBaseY = WALL_FLOOR_LEVEL_Y - WALL_FLOOR_SINK;
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

function splitWallIntoPanels(wall: BorderSegment): WallPanel[] {
  const alongX = wall.size[0] >= wall.size[2];
  const majorLength = alongX ? wall.size[0] : wall.size[2];
  const thickness = alongX ? wall.size[2] : wall.size[0];

  if (majorLength <= WALL_PANEL_MIN_LENGTH) {
    return [
      {
        id: `${wall.id}-panel-0`,
        position: wall.position,
        size: [majorLength, wall.size[1], thickness],
        rotationY: alongX ? 0 : Math.PI * 0.5,
        axis: alongX ? 'x' : 'z',
      },
    ];
  }

  const panelCount = Math.max(1, Math.ceil(majorLength / WALL_PANEL_MAX_LENGTH));
  const panelLength = majorLength / panelCount;
  const panels: WallPanel[] = [];

  for (let i = 0; i < panelCount; i += 1) {
    const offset = -majorLength * 0.5 + panelLength * (i + 0.5);
    if (alongX) {
      panels.push({
        id: `${wall.id}-panel-${i}`,
        position: [wall.position[0] + offset, wall.position[1], wall.position[2]],
        size: [panelLength, wall.size[1], thickness],
        rotationY: 0,
        axis: 'x',
      });
    } else {
      panels.push({
        id: `${wall.id}-panel-${i}`,
        position: [wall.position[0], wall.position[1], wall.position[2] + offset],
        size: [panelLength, wall.size[1], thickness],
        rotationY: Math.PI * 0.5,
        axis: 'z',
      });
    }
  }

  return panels;
}

function pointInsideFloorPiece(x: number, z: number, piece: DungeonBuildPiece) {
  const halfX = piece.size[0] * 0.5;
  const halfZ = piece.size[2] * 0.5;
  return (
    x >= piece.position[0] - halfX &&
    x <= piece.position[0] + halfX &&
    z >= piece.position[2] - halfZ &&
    z <= piece.position[2] + halfZ
  );
}

function pointInsideAnyFloor(x: number, z: number, floorPieces: DungeonBuildPiece[]) {
  for (let i = 0; i < floorPieces.length; i += 1) {
    if (pointInsideFloorPiece(x, z, floorPieces[i])) {
      return true;
    }
  }
  return false;
}

function orientWallPanelTowardInterior(panel: WallPanel, floorPieces: DungeonBuildPiece[]): WallPanel {
  const alongX = panel.axis === 'x';
  const probe = Math.max(WALL_FACE_SAMPLE_OFFSET, Math.min(panel.size[0], panel.size[2]) + 0.2);
  let rotationY = panel.rotationY;

  if (alongX) {
    const hasPositiveZFloor = pointInsideAnyFloor(panel.position[0], panel.position[2] + probe, floorPieces);
    const hasNegativeZFloor = pointInsideAnyFloor(panel.position[0], panel.position[2] - probe, floorPieces);
    if (hasPositiveZFloor && !hasNegativeZFloor) {
      rotationY = 0;
    } else if (hasNegativeZFloor && !hasPositiveZFloor) {
      rotationY = Math.PI;
    }
  } else {
    const hasPositiveXFloor = pointInsideAnyFloor(panel.position[0] + probe, panel.position[2], floorPieces);
    const hasNegativeXFloor = pointInsideAnyFloor(panel.position[0] - probe, panel.position[2], floorPieces);
    if (hasPositiveXFloor && !hasNegativeXFloor) {
      rotationY = Math.PI * 0.5;
    } else if (hasNegativeXFloor && !hasPositiveXFloor) {
      rotationY = -Math.PI * 0.5;
    }
  }

  return {
    ...panel,
    rotationY: rotationY + WALL_FRONT_OFFSET_Y,
  };
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

      const floorObject = buildScaledFloorObject(sourceNode, [
        piece.size[0] + FLOOR_VISUAL_OVERHANG,
        piece.size[1],
        piece.size[2] + FLOOR_VISUAL_OVERHANG,
      ]);
      if (!floorObject) {
        return { piece, object: null };
      }

      return { piece, object: floorObject };
    });
  }, [floorPieces, resolveNode]);

  const ceilingVisuals = useMemo<CeilingVisual[]>(() => {
    return floorPieces.map((piece) => {
      const nodeCandidates = ceilingNodeCandidates(piece);
      const sourceNode = resolveNode(nodeCandidates[0], nodeCandidates.slice(1), `ceiling:${piece.id}`);
      const size: [number, number, number] = [
        piece.size[0] + CEILING_EXPAND,
        CEILING_THICKNESS,
        piece.size[2] + CEILING_EXPAND,
      ];
      const position: [number, number, number] = [
        piece.position[0],
        piece.position[1] + piece.size[1] * 0.5 + CEILING_CLEARANCE,
        piece.position[2],
      ];

      if (!sourceNode) {
        return {
          id: `ceiling-${piece.id}`,
          position,
          size,
          rotationY: piece.rotationY,
          object: null,
        };
      }

      const object = buildScaledFloorObject(sourceNode, size);
      if (!object) {
        return {
          id: `ceiling-${piece.id}`,
          position,
          size,
          rotationY: piece.rotationY,
          object: null,
        };
      }

      setObjectMaterialsDoubleSided(object);

      return {
        id: `ceiling-${piece.id}`,
        position,
        size,
        rotationY: piece.rotationY,
        object,
      };
    });
  }, [floorPieces, resolveNode]);

  const floorIds = useMemo(() => new Set(floorPieces.map((piece) => piece.id)), [floorPieces]);

  const floorColliders = useMemo(
    () => dungeon.colliders.filter((collider) => floorIds.has(collider.id)),
    [dungeon.colliders, floorIds],
  );

  const borderWallSegments = useMemo(
    () => buildBorderSegments(dungeon.pieces.filter((piece) => BORDER_WALL_SOURCE_KINDS.has(piece.kind))),
    [dungeon.pieces],
  );

  const borderWallsRaw = useMemo(
    () => buildVerticalBorderWalls(borderWallSegments),
    [borderWallSegments],
  );

  const borderWalls = useMemo(
    () => borderWallsRaw.filter((wall) => !isSegmentInsideSpawnCutout(wall)),
    [borderWallsRaw],
  );

  const wallPanels = useMemo(
    () =>
      borderWalls
        .flatMap((wall) => splitWallIntoPanels(wall))
        .map((panel) => orientWallPanelTowardInterior(panel, floorPieces)),
    [borderWalls, floorPieces],
  );

  const wallVisuals = useMemo<WallVisual[]>(
    () =>
      wallPanels.map((panel) => {
        const candidates = wallNodeCandidates(panel.id);
        const sourceNode = resolveNode(candidates[0], candidates.slice(1), `wall:${panel.id}`);
        if (!sourceNode) {
          return { ...panel, object: null };
        }

        const object = buildScaledFloorObject(sourceNode, panel.size);
        if (!object) {
          return { ...panel, object: null };
        }

        setObjectMaterialsDoubleSided(object);
        return { ...panel, object };
      }),
    [resolveNode, wallPanels],
  );

  const wallBackers = useMemo<WallBackerVisual[]>(
    () =>
      wallPanels.map((panel) => {
        const candidates = wallBackerNodeCandidates(panel.id);
        const sourceNode = resolveNode(candidates[0], candidates.slice(1), `wall-backer:${panel.id}`);
        const size: [number, number, number] = [
          panel.size[0] + WALL_BACKER_EXPAND_X,
          panel.size[1] + WALL_BACKER_EXPAND_Y,
          WALL_BACKER_THICKNESS,
        ];
        const normalX = Math.sin(panel.rotationY);
        const normalZ = Math.cos(panel.rotationY);
        const position: [number, number, number] = [
          panel.position[0] - normalX * WALL_BACKER_OFFSET,
          panel.position[1],
          panel.position[2] - normalZ * WALL_BACKER_OFFSET,
        ];

        if (!sourceNode) {
          return {
            id: `backer-${panel.id}`,
            position,
            size,
            rotationY: panel.rotationY,
            object: null,
          };
        }

        const object = buildScaledFloorObject(sourceNode, size);
        if (!object) {
          return {
            id: `backer-${panel.id}`,
            position,
            size,
            rotationY: panel.rotationY,
            object: null,
          };
        }

        setObjectMaterialsDoubleSided(object);
        return {
          id: `backer-${panel.id}`,
          position,
          size,
          rotationY: panel.rotationY,
          object,
        };
      }),
    [resolveNode, wallPanels],
  );

  const bushVisuals = useMemo<BushVisual[]>(() => {
    const bushes: BushVisual[] = [];

    for (let i = 0; i < wallPanels.length; i += 1) {
      const panel = wallPanels[i];
      if (hashString(panel.id) % 6 !== 0) continue;

      const normalX = Math.sin(panel.rotationY);
      const normalZ = Math.cos(panel.rotationY);
      const sampleDistance = 0.9;

      const posInsideX = panel.position[0] + normalX * sampleDistance;
      const posInsideZ = panel.position[2] + normalZ * sampleDistance;
      const negInsideX = panel.position[0] - normalX * sampleDistance;
      const negInsideZ = panel.position[2] - normalZ * sampleDistance;

      const positiveHasFloor = pointInsideAnyFloor(posInsideX, posInsideZ, floorPieces);
      const negativeHasFloor = pointInsideAnyFloor(negInsideX, negInsideZ, floorPieces);

      let side = 1;
      if (positiveHasFloor && !negativeHasFloor) side = 1;
      else if (negativeHasFloor && !positiveHasFloor) side = -1;

      const nodeCandidates = bushNodeCandidates(panel.id);
      const sourceNode = resolveNode(nodeCandidates[0], nodeCandidates.slice(1), `bush:${panel.id}`);

      const sizeSeed = hashString(`bush-size-${panel.id}`) % 3;
      const size: [number, number, number] =
        sizeSeed === 0 ? [2.2, 1.5, 2.1] : sizeSeed === 1 ? [2.8, 1.9, 2.6] : [3.4, 2.3, 3.2];

      const position: [number, number, number] = [
        panel.position[0] + normalX * side * 0.7,
        0.18,
        panel.position[2] + normalZ * side * 0.7,
      ];

      if (!sourceNode) {
        bushes.push({
          id: `bush-${panel.id}`,
          position,
          rotationY: (hashString(`bush-rot-${panel.id}`) % 6283) / 1000,
          size,
          object: null,
        });
        continue;
      }

      const object = buildScaledFloorObject(sourceNode, size);
      if (!object) continue;
      markFloorMeshForShadows(object);
      object.updateMatrixWorld(true);

      bushes.push({
        id: `bush-${panel.id}`,
        position,
        rotationY: (hashString(`bush-rot-${panel.id}`) % 6283) / 1000,
        size,
        object,
      });
    }

    return bushes;
  }, [floorPieces, resolveNode, wallPanels]);

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
      {ceilingVisuals.map((ceiling) => (
        <group
          key={ceiling.id}
          position={ceiling.position}
          rotation={[0, ceiling.rotationY, 0]}
        >
          <mesh
            position={[0, ceiling.size[1] * 0.5 + CEILING_CAP_THICKNESS * 0.5 + CEILING_CAP_RISE, 0]}
            material={ceilingCapMaterial}
            castShadow={false}
            receiveShadow
          >
            <boxGeometry
              args={[
                ceiling.size[0] + CEILING_CAP_EXPAND,
                CEILING_CAP_THICKNESS,
                ceiling.size[2] + CEILING_CAP_EXPAND,
              ]}
            />
          </mesh>
          {ceiling.object ? (
            <primitive object={ceiling.object} />
          ) : (
            <mesh material={ceilingFallbackMaterial} castShadow={false} receiveShadow>
              <boxGeometry args={ceiling.size} />
            </mesh>
          )}
        </group>
      ))}

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

      {wallBackers.map((backer) => (
        <group key={backer.id} position={backer.position} rotation={[0, backer.rotationY, 0]}>
          {backer.object ? (
            <primitive object={backer.object} />
          ) : (
            <mesh material={wallFallbackMaterial} castShadow={false} receiveShadow={false}>
              <boxGeometry args={backer.size} />
            </mesh>
          )}
        </group>
      ))}

      {wallVisuals.map((wall) => (
        <group key={wall.id} position={wall.position} rotation={[0, wall.rotationY, 0]}>
          {wall.object ? (
            <primitive object={wall.object} />
          ) : (
            <mesh material={wallFallbackMaterial} castShadow={false} receiveShadow>
              <boxGeometry args={wall.size} />
            </mesh>
          )}
        </group>
      ))}

      {bushVisuals.map((bush) => (
        <group key={bush.id} position={bush.position} rotation={[0, bush.rotationY, 0]}>
          {bush.object ? <primitive object={bush.object} /> : null}
        </group>
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
