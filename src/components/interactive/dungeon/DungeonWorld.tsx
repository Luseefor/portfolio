'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import {
  Box3,
  DoubleSide,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SpotLight as SpotLightImpl,
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
const TORCH_NODE_FALLBACKS = ['Torch'] as const;
const POT_INTACT_NODE_FALLBACKS = ['Pot1', 'Pot2', 'Pot3'] as const;
const POT_BROKEN_NODE_FALLBACKS = ['Pot1_Broken', 'Pot2_Broken', 'Pot3_Broken'] as const;
const AMBIENT_PROP_NODE_FALLBACKS = ['Barrel', 'Crate', 'Candles_1', 'Candles_2', 'Skull'] as const;
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
const TORCH_LIGHT_DECAY = 1.9;
const TORCH_PLACEMENT_LIMIT = 22;
const TORCH_MOUNT_HEIGHT = 2.3;
const POT_PLACEMENT_LIMIT = 24;
const AMBIENT_PROP_PLACEMENT_LIMIT = 24;
const PROP_COLLIDER_INSET = 0.82;

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

type TorchVisual = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
  object: Object3D | null;
  glowColor: string;
  baseIntensity: number;
  distance: number;
  flickerSeed: number;
  lightTarget: Object3D;
};

type PotVisual = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
  brokenHeight: number;
  intactObject: Object3D | null;
  brokenObject: Object3D | null;
};

type AmbientPropVisual = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
  object: Object3D | null;
};

type WallCollisionBox = {
  centerX: number;
  centerZ: number;
  halfX: number;
  halfZ: number;
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

function torchNodeCandidates(id: string): readonly string[] {
  const start = hashString(`torch-${id}`) % TORCH_NODE_FALLBACKS.length;
  const rotated: string[] = [...TORCH_NODE_FALLBACKS.slice(start), ...TORCH_NODE_FALLBACKS.slice(0, start)];
  return rotated;
}

function potVariantFor(id: string) {
  const index = hashString(`pot-variant-${id}`) % POT_INTACT_NODE_FALLBACKS.length;
  return {
    intact: POT_INTACT_NODE_FALLBACKS[index],
    broken: POT_BROKEN_NODE_FALLBACKS[index],
  };
}

function ambientPropNodeCandidates(id: string): readonly string[] {
  const start = hashString(`ambient-${id}`) % AMBIENT_PROP_NODE_FALLBACKS.length;
  const rotated: string[] = [
    ...AMBIENT_PROP_NODE_FALLBACKS.slice(start),
    ...AMBIENT_PROP_NODE_FALLBACKS.slice(0, start),
  ];
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

function floorSurfaceYAt(x: number, z: number, floorPieces: DungeonBuildPiece[]) {
  let topY = 0;

  for (let i = 0; i < floorPieces.length; i += 1) {
    const piece = floorPieces[i];
    if (!pointInsideFloorPiece(x, z, piece)) continue;
    topY = Math.max(topY, piece.position[1] + piece.size[1] * 0.5);
  }

  return topY;
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

function panelNormal(panel: WallPanel) {
  return {
    x: Math.sin(panel.rotationY),
    z: Math.cos(panel.rotationY),
  };
}

function getInteriorSideForPanel(panel: WallPanel, floorPieces: DungeonBuildPiece[]) {
  const normal = panelNormal(panel);
  const sampleDistance = 0.9;

  const positiveHasFloor = pointInsideAnyFloor(
    panel.position[0] + normal.x * sampleDistance,
    panel.position[2] + normal.z * sampleDistance,
    floorPieces,
  );
  const negativeHasFloor = pointInsideAnyFloor(
    panel.position[0] - normal.x * sampleDistance,
    panel.position[2] - normal.z * sampleDistance,
    floorPieces,
  );

  if (negativeHasFloor && !positiveHasFloor) {
    return -1;
  }

  return 1;
}

function findNearestWallPanel(x: number, z: number, wallPanels: WallPanel[]) {
  if (wallPanels.length === 0) return null;

  let nearest = wallPanels[0];
  let nearestDistanceSq = Number.POSITIVE_INFINITY;

  for (let i = 0; i < wallPanels.length; i += 1) {
    const panel = wallPanels[i];
    const dx = panel.position[0] - x;
    const dz = panel.position[2] - z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < nearestDistanceSq) {
      nearestDistanceSq = distanceSq;
      nearest = panel;
    }
  }

  return nearest;
}

function buildWallCollisionBoxes(wallPanels: WallPanel[]): WallCollisionBox[] {
  return wallPanels.map((panel) => {
    if (panel.axis === 'x') {
      return {
        centerX: panel.position[0],
        centerZ: panel.position[2],
        halfX: panel.size[0] * 0.5,
        halfZ: panel.size[2] * 0.5,
      };
    }

    return {
      centerX: panel.position[0],
      centerZ: panel.position[2],
      halfX: panel.size[2] * 0.5,
      halfZ: panel.size[0] * 0.5,
    };
  });
}

function circleIntersectsWallBox(x: number, z: number, radius: number, box: WallCollisionBox) {
  const minX = box.centerX - box.halfX;
  const maxX = box.centerX + box.halfX;
  const minZ = box.centerZ - box.halfZ;
  const maxZ = box.centerZ + box.halfZ;

  const closestX = Math.max(minX, Math.min(maxX, x));
  const closestZ = Math.max(minZ, Math.min(maxZ, z));

  const dx = x - closestX;
  const dz = z - closestZ;
  return dx * dx + dz * dz < radius * radius;
}

function wallOverlapCount(x: number, z: number, radius: number, wallBoxes: WallCollisionBox[]) {
  let count = 0;
  for (let i = 0; i < wallBoxes.length; i += 1) {
    if (circleIntersectsWallBox(x, z, radius, wallBoxes[i])) count += 1;
  }
  return count;
}

function computePanelPropXZ(
  panel: WallPanel,
  side: number,
  propRadius: number,
  seed: number,
  floorPieces: DungeonBuildPiece[],
  wallBoxes: WallCollisionBox[],
) {
  const normal = panelNormal(panel);
  const tangent = panel.axis === 'x' ? { x: 1, z: 0 } : { x: 0, z: 1 };
  const panelHalfThickness = panel.size[2] * 0.5;
  const baseDistance = panelHalfThickness + propRadius + 0.16;

  const jitterSpan = Math.max(0, panel.size[0] * 0.5 - propRadius - 0.22);
  const jitter = jitterSpan > 0 ? ((((seed % 1000) / 999) - 0.5) * 2 * Math.min(0.9, jitterSpan)) : 0;

  let x = panel.position[0] + tangent.x * jitter + normal.x * side * baseDistance;
  let z = panel.position[2] + tangent.z * jitter + normal.z * side * baseDistance;

  let bestX = x;
  let bestZ = z;
  let bestScore =
    wallOverlapCount(x, z, propRadius, wallBoxes) + (pointInsideAnyFloor(x, z, floorPieces) ? 0 : 1000);

  for (let i = 0; i < 10; i += 1) {
    const nextX = x + normal.x * side * 0.12;
    const nextZ = z + normal.z * side * 0.12;
    if (!pointInsideAnyFloor(nextX, nextZ, floorPieces)) break;
    x = nextX;
    z = nextZ;
    const score =
      wallOverlapCount(x, z, propRadius, wallBoxes) + (pointInsideAnyFloor(x, z, floorPieces) ? 0 : 1000);
    if (score < bestScore) {
      bestScore = score;
      bestX = x;
      bestZ = z;
      if (bestScore <= 0) break;
    }
  }

  return {
    x: bestX,
    z: bestZ,
    score: bestScore,
  };
}

function resolvePropXZForPanel(
  panel: WallPanel,
  propSize: [number, number, number],
  seed: number,
  floorPieces: DungeonBuildPiece[],
  wallBoxes: WallCollisionBox[],
) {
  const preferredSide = getInteriorSideForPanel(panel, floorPieces);
  const radius = Math.max(propSize[0], propSize[2]) * 0.52;
  const preferred = computePanelPropXZ(panel, preferredSide, radius, seed, floorPieces, wallBoxes);
  if (preferred.score <= 0) {
    return [preferred.x, preferred.z] as [number, number];
  }

  const opposite = computePanelPropXZ(panel, -preferredSide, radius, seed + 173, floorPieces, wallBoxes);
  if (opposite.score < preferred.score) {
    return [opposite.x, opposite.z] as [number, number];
  }

  return [preferred.x, preferred.z] as [number, number];
}

function groundAlignObjectToZeroY(object: Object3D) {
  object.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(object);
  if (!Number.isFinite(bounds.min.y)) return;
  object.position.y -= bounds.min.y;
  object.updateMatrixWorld(true);
}

function colliderArgsFromSize(
  size: [number, number, number],
  widthInset = PROP_COLLIDER_INSET,
): [number, number, number] {
  return [
    Math.max(0.06, (size[0] * widthInset) * 0.5),
    Math.max(0.06, size[1] * 0.5),
    Math.max(0.06, (size[2] * widthInset) * 0.5),
  ];
}

function setTorchGlowMaterial(object: Object3D) {
  const rootBox = new Box3().setFromObject(object);
  const rootSize = new Vector3();
  rootBox.getSize(rootSize);
  const flameThreshold = rootBox.min.y + rootSize.y * 0.72;

  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;

    const meshBox = new Box3().setFromObject(child);
    const meshCenter = new Vector3();
    meshBox.getCenter(meshCenter);
    const isFlameMesh = meshCenter.y >= flameThreshold;

    const applyGlow = (material: Material) => {
      if (!(material instanceof MeshStandardMaterial)) return;
      const next = material.clone();
      if (isFlameMesh) {
        next.emissive.set('#ff8f3a');
        next.emissiveIntensity = Math.max(next.emissiveIntensity, 0.95);
        next.roughness = Math.max(0.25, next.roughness * 0.6);
      } else {
        next.emissive.set('#000000');
        next.emissiveIntensity = 0;
      }
      return next;
    };

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => applyGlow(material) ?? material);
    } else if (child.material) {
      child.material = applyGlow(child.material) ?? child.material;
    }
  });
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
  const [brokenPotIds, setBrokenPotIds] = useState<Set<string>>(() => new Set());
  const torchLightRefs = useRef<Record<string, SpotLightImpl | null>>({});

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

  const wallCollisionBoxes = useMemo(() => buildWallCollisionBoxes(wallPanels), [wallPanels]);

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

      const normal = panelNormal(panel);
      const side = getInteriorSideForPanel(panel, floorPieces);

      const nodeCandidates = bushNodeCandidates(panel.id);
      const sourceNode = resolveNode(nodeCandidates[0], nodeCandidates.slice(1), `bush:${panel.id}`);

      const sizeSeed = hashString(`bush-size-${panel.id}`) % 3;
      const size: [number, number, number] =
        sizeSeed === 0 ? [2.2, 1.5, 2.1] : sizeSeed === 1 ? [2.8, 1.9, 2.6] : [3.4, 2.3, 3.2];

      const position: [number, number, number] = [
        panel.position[0] + normal.x * side * 0.7,
        0.18,
        panel.position[2] + normal.z * side * 0.7,
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

  const torchVisuals = useMemo<TorchVisual[]>(() => {
    return dungeon.torchAnchors.slice(0, TORCH_PLACEMENT_LIMIT).map((anchor) => {
      const candidates = torchNodeCandidates(anchor.id);
      const sourceNode = resolveNode(candidates[0], candidates.slice(1), `torch:${anchor.id}`);
      const size: [number, number, number] =
        anchor.source === 'spawn'
          ? [1.15, 2.35, 0.9]
          : anchor.source === 'corridor'
            ? [0.9, 2.05, 0.72]
            : [1, 2.15, 0.78];
      const panel = findNearestWallPanel(anchor.position[0], anchor.position[2], wallPanels);
      const seed = hashString(`torch-pos-${anchor.id}`);
      const [x, z] = panel
        ? resolvePropXZForPanel(panel, size, seed, floorPieces, wallCollisionBoxes)
        : [anchor.position[0], anchor.position[2]];
      const floorTopY = floorSurfaceYAt(x, z, floorPieces);
      const torchPosition: [number, number, number] = [x, floorTopY + 0.04, z];

      const object = sourceNode ? buildScaledFloorObject(sourceNode, size) : null;
      if (object) {
        setObjectMaterialsDoubleSided(object);
        markFloorMeshForShadows(object);
        groundAlignObjectToZeroY(object);
        setTorchGlowMaterial(object);
      }
      const lightTarget = new Object3D();
      lightTarget.position.set(0, TORCH_MOUNT_HEIGHT * 0.55, 1.25);

      return {
        id: `torch-prop-${anchor.id}`,
        position: torchPosition,
        rotationY: panel?.rotationY ?? anchor.rotationY,
        size,
        object,
        glowColor:
          anchor.source === 'spawn'
            ? '#ffcd86'
            : anchor.source === 'corridor'
              ? '#ff9f54'
              : '#ffba73',
        baseIntensity: anchor.source === 'spawn' ? 0.9 : anchor.source === 'corridor' ? 0.7 : 0.8,
        distance: anchor.source === 'corridor' ? 6.5 : 7.2,
        flickerSeed: (hashString(`torch-flicker-${anchor.id}`) % 6283) / 1000,
        lightTarget,
      };
    });
  }, [dungeon.torchAnchors, floorPieces, resolveNode, wallCollisionBoxes, wallPanels]);

  const potVisuals = useMemo<PotVisual[]>(() => {
    const pots: PotVisual[] = [];
    for (let i = 0; i < wallPanels.length; i += 1) {
      if (pots.length >= POT_PLACEMENT_LIMIT) break;

      const panel = wallPanels[i];
      const seed = hashString(`pot-${panel.id}`);
      if (seed % 5 !== 0) continue;

      const intactSize: [number, number, number] = [0.96, 0.92, 0.96];
      const brokenSize: [number, number, number] = [1.08, 0.56, 1.08];
      const [x, z] = resolvePropXZForPanel(panel, intactSize, seed, floorPieces, wallCollisionBoxes);
      if (!pointInsideAnyFloor(x, z, floorPieces)) continue;
      const floorTopY = floorSurfaceYAt(x, z, floorPieces);

      const position: [number, number, number] = [
        x,
        floorTopY + 0.04,
        z,
      ];

      const variant = potVariantFor(panel.id);
      const intactFallbacks = POT_INTACT_NODE_FALLBACKS.filter((key) => key !== variant.intact);
      const brokenFallbacks = POT_BROKEN_NODE_FALLBACKS.filter((key) => key !== variant.broken);
      const intactNode = resolveNode(variant.intact, intactFallbacks, `pot:${panel.id}`);
      const brokenNode = resolveNode(
        variant.broken,
        brokenFallbacks,
        `pot-broken:${panel.id}`,
      );

      const intactObject = intactNode ? buildScaledFloorObject(intactNode, intactSize) : null;
      const brokenObject = brokenNode ? buildScaledFloorObject(brokenNode, brokenSize) : null;
      if (intactObject) {
        markFloorMeshForShadows(intactObject);
        groundAlignObjectToZeroY(intactObject);
      }
      if (brokenObject) {
        markFloorMeshForShadows(brokenObject);
        groundAlignObjectToZeroY(brokenObject);
      }

      pots.push({
        id: `pot-${panel.id}`,
        position,
        rotationY: (seed % 6283) / 1000,
        size: intactSize,
        brokenHeight: brokenSize[1],
        intactObject,
        brokenObject,
      });
    }

    return pots;
  }, [floorPieces, resolveNode, wallCollisionBoxes, wallPanels]);

  const ambientPropVisuals = useMemo<AmbientPropVisual[]>(() => {
    const props: AmbientPropVisual[] = [];

    for (let i = 0; i < wallPanels.length; i += 1) {
      if (props.length >= AMBIENT_PROP_PLACEMENT_LIMIT) break;

      const panel = wallPanels[i];
      const seed = hashString(`ambient-prop-${panel.id}`);
      if (seed % 8 !== 0) continue;

      const candidates = ambientPropNodeCandidates(panel.id);
      const primary = candidates[0];
      const sourceNode = resolveNode(primary, candidates.slice(1), `ambient:${panel.id}`);
      if (!sourceNode) continue;

      const size: [number, number, number] =
        primary === 'Barrel'
          ? [1.12, 1.34, 1.12]
          : primary === 'Crate'
            ? [1.15, 1.02, 1.15]
            : primary === 'Candles_1'
              ? [0.68, 0.42, 0.68]
              : primary === 'Candles_2'
                ? [0.82, 0.5, 0.82]
                : [0.46, 0.36, 0.56];

      const [x, z] = resolvePropXZForPanel(panel, size, seed + 101, floorPieces, wallCollisionBoxes);
      if (!pointInsideAnyFloor(x, z, floorPieces)) continue;
      const floorTopY = floorSurfaceYAt(x, z, floorPieces);
      const isSmallFloorProp = /Candles|Skull/i.test(primary);
      const position: [number, number, number] = [
        x,
        floorTopY + (isSmallFloorProp ? 0.025 : 0.04),
        z,
      ];

      const object = buildScaledFloorObject(sourceNode, size);
      if (!object) continue;
      markFloorMeshForShadows(object);
      groundAlignObjectToZeroY(object);

      props.push({
        id: `ambient-${panel.id}`,
        position,
        rotationY: (hashString(`ambient-rot-${panel.id}`) % 6283) / 1000,
        size,
        object,
      });
    }

    return props;
  }, [floorPieces, resolveNode, wallCollisionBoxes, wallPanels]);

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

  const torchColliders = useMemo(
    () =>
      torchVisuals.map((torch) => ({
        id: `collider-${torch.id}`,
        position: [
          torch.position[0],
          torch.position[1] + torch.size[1] * 0.5,
          torch.position[2],
        ] as [number, number, number],
        args: colliderArgsFromSize(torch.size, 0.76),
      })),
    [torchVisuals],
  );

  const ambientColliders = useMemo(
    () =>
      ambientPropVisuals.map((prop) => ({
        id: `collider-${prop.id}`,
        position: [
          prop.position[0],
          prop.position[1] + prop.size[1] * 0.5,
          prop.position[2],
        ] as [number, number, number],
        args: colliderArgsFromSize(prop.size, prop.size[1] < 0.66 ? 0.6 : 0.8),
      })),
    [ambientPropVisuals],
  );

  const potColliders = useMemo(
    () =>
      potVisuals.map((pot) => {
        const broken = brokenPotIds.has(pot.id);
        const height = broken ? pot.brokenHeight : pot.size[1];
        const size: [number, number, number] = [pot.size[0], height, pot.size[2]];
        return {
          id: `collider-${pot.id}`,
          position: [
            pot.position[0],
            pot.position[1] + height * 0.5,
            pot.position[2],
          ] as [number, number, number],
          args: colliderArgsFromSize(size, 0.8),
        };
      }),
    [brokenPotIds, potVisuals],
  );

  const handlePotPointerDown = (potId: string, event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    setBrokenPotIds((previous) => {
      if (previous.has(potId)) return previous;
      const next = new Set(previous);
      next.add(potId);
      return next;
    });
  };

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    for (let i = 0; i < torchVisuals.length; i += 1) {
      const torch = torchVisuals[i];
      const light = torchLightRefs.current[torch.id];
      if (!light) continue;

      const flicker =
        Math.sin(elapsed * 7.4 + torch.flickerSeed) * 0.2 +
        Math.sin(elapsed * 11.2 + torch.flickerSeed * 1.7) * 0.08;
      light.intensity = torch.baseIntensity * (1 + flicker);
    }
  });

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

      {torchVisuals.map((torch) => (
        <group key={torch.id} position={torch.position} rotation={[0, torch.rotationY, 0]}>
          <primitive object={torch.lightTarget} />
          {torch.object ? (
            <primitive object={torch.object} />
          ) : (
            <group>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.1, 0.14, 1.2, 12]} />
                <meshStandardMaterial color="#474d4b" roughness={0.9} metalness={0.1} />
              </mesh>
              <mesh position={[0, 1.08, 0.08]}>
                <sphereGeometry args={[0.14, 10, 10]} />
                <meshStandardMaterial color="#ff9a4f" emissive="#ff7f2b" emissiveIntensity={1.3} />
              </mesh>
            </group>
          )}
          <spotLight
            ref={(light) => {
              torchLightRefs.current[torch.id] = light;
            }}
            target={torch.lightTarget}
            position={[0, 0.08, 0.2]}
            intensity={torch.baseIntensity}
            color={torch.glowColor}
            distance={torch.distance}
            angle={0.45}
            penumbra={0.62}
            decay={TORCH_LIGHT_DECAY}
            castShadow={false}
          />
        </group>
      ))}

      {ambientPropVisuals.map((prop) => (
        <group key={prop.id} position={prop.position} rotation={[0, prop.rotationY, 0]}>
          {prop.object ? <primitive object={prop.object} /> : null}
        </group>
      ))}

      {potVisuals.map((pot) => {
        const isBroken = brokenPotIds.has(pot.id);
        return (
          <group
            key={pot.id}
            position={pot.position}
            rotation={[0, pot.rotationY, 0]}
            onPointerDown={(event) => handlePotPointerDown(pot.id, event)}
          >
            {isBroken ? (
              pot.brokenObject ? (
                <primitive object={pot.brokenObject} />
              ) : (
                <mesh position={[0, pot.brokenHeight * 0.5, 0]}>
                  <cylinderGeometry args={[pot.size[0] * 0.5, pot.size[0] * 0.45, pot.brokenHeight, 8]} />
                  <meshStandardMaterial color="#6b6154" roughness={0.95} />
                </mesh>
              )
            ) : pot.intactObject ? (
              <primitive object={pot.intactObject} />
            ) : (
              <mesh position={[0, pot.size[1] * 0.5, 0]}>
                <cylinderGeometry args={[pot.size[0] * 0.42, pot.size[0] * 0.52, pot.size[1], 10]} />
                <meshStandardMaterial color="#8f7f67" roughness={0.88} />
              </mesh>
            )}
          </group>
        );
      })}

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
        {torchColliders.map((collider) => (
          <CuboidCollider
            key={collider.id}
            args={collider.args}
            position={collider.position}
          />
        ))}
        {ambientColliders.map((collider) => (
          <CuboidCollider
            key={collider.id}
            args={collider.args}
            position={collider.position}
          />
        ))}
        {potColliders.map((collider) => (
          <CuboidCollider
            key={collider.id}
            args={collider.args}
            position={collider.position}
          />
        ))}
        <CuboidCollider args={[220, 0.2, 220]} position={[0, -0.3, 0]} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(RUINS_GLB_PATH);
