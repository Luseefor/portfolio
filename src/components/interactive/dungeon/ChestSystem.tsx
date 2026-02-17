'use client';

import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { subscribeToPlayerState, usePlayerState } from '@/lib/playerState';
import { clampVolume, useSettings } from '@/lib/settings';
import {
  DUNGEON_LAYOUT_GRAPH,
  DUNGEON_SCALE,
  CHEST_POIS,
  type ChestPOI,
} from '@/constants/dungeonLayout';
import { buildDungeon, type DungeonBuildPiece } from '@/game/dungeon/buildDungeon';

const CLOSED_CHEST_GLB = '/models/dungeon/props/closed_chest.glb';
const OPEN_CHEST_GLB = '/models/dungeon/props/open_chest.glb';

const FLOOR_KINDS = new Set(['floor', 'corridor-floor', 'spawn-platform']);

const CHEST_SIZE_MULTIPLIER = 1.5;
const CHEST_BASE_SCALE = 0.9;
const CHEST_WORLD_WIDTH = 1.2 * CHEST_BASE_SCALE * CHEST_SIZE_MULTIPLIER * DUNGEON_SCALE;
const CHEST_WORLD_HEIGHT = 0.82 * CHEST_BASE_SCALE * CHEST_SIZE_MULTIPLIER * DUNGEON_SCALE;
const CHEST_WORLD_DEPTH = 0.95 * CHEST_BASE_SCALE * CHEST_SIZE_MULTIPLIER * DUNGEON_SCALE;
const CHEST_COLLIDER_HEIGHT_SCALE = 0.85;
const CHEST_SURFACE_OFFSET = 0.02;
const CHEST_PLACEMENT_SEARCH_STEP = 0.9 * DUNGEON_SCALE;
const CHEST_PLACEMENT_SEARCH_RINGS = 2;
const CHEST_FOOTPRINT_RADIUS = Math.max(CHEST_WORLD_WIDTH, CHEST_WORLD_DEPTH) * 0.46;

const MARKER_BASE_HEIGHT = CHEST_WORLD_HEIGHT * 1.55;
const MARKER_BOB_AMPLITUDE = 0.14 * DUNGEON_SCALE;

type ChestGLTF = {
  scene: THREE.Object3D;
};

type ObstacleBox = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

type RenderedChest = {
  chest: ChestPOI;
  position: [number, number, number];
};

const FOOTPRINT_PROBES: Array<[number, number]> = [
  [0, 0],
  [CHEST_FOOTPRINT_RADIUS * 0.56, 0],
  [-CHEST_FOOTPRINT_RADIUS * 0.56, 0],
  [0, CHEST_FOOTPRINT_RADIUS * 0.56],
  [0, -CHEST_FOOTPRINT_RADIUS * 0.56],
  [CHEST_FOOTPRINT_RADIUS * 0.42, CHEST_FOOTPRINT_RADIUS * 0.42],
  [CHEST_FOOTPRINT_RADIUS * 0.42, -CHEST_FOOTPRINT_RADIUS * 0.42],
  [-CHEST_FOOTPRINT_RADIUS * 0.42, CHEST_FOOTPRINT_RADIUS * 0.42],
  [-CHEST_FOOTPRINT_RADIUS * 0.42, -CHEST_FOOTPRINT_RADIUS * 0.42],
];

function safePauseAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return;
  try {
    audio.pause();
  } catch {
    // Ignore pause errors in non-browser test environments.
  }
}

function sanitizeSize(value: number) {
  return Number.isFinite(value) && value > 0.0001 ? value : 1;
}

function buildChestModel(
  sourceScene: THREE.Object3D,
  targetSize: { width: number; height: number; depth: number },
): THREE.Object3D | null {
  const clone = sourceScene.clone(true);
  clone.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  if (size.lengthSq() < 1e-8) return null;

  // Ground-align chest model so position.y always represents floor-contact point.
  clone.position.x -= center.x;
  clone.position.z -= center.z;
  clone.position.y -= bounds.min.y;

  const wrapper = new THREE.Group();
  wrapper.scale.set(
    targetSize.width / sanitizeSize(size.x),
    targetSize.height / sanitizeSize(size.y),
    targetSize.depth / sanitizeSize(size.z),
  );
  wrapper.add(clone);
  wrapper.updateMatrixWorld(true);
  return wrapper;
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

function floorSurfaceYAt(x: number, z: number, floorPieces: DungeonBuildPiece[]) {
  let hasFloor = false;
  let topY = 0;

  for (let i = 0; i < floorPieces.length; i += 1) {
    const piece = floorPieces[i];
    if (!pointInsideFloorPiece(x, z, piece)) continue;
    hasFloor = true;
    topY = Math.max(topY, piece.position[1] + piece.size[1] * 0.5);
  }

  return hasFloor ? topY : null;
}

function circleIntersectsBox(x: number, z: number, radius: number, box: ObstacleBox) {
  const closestX = Math.max(box.minX, Math.min(box.maxX, x));
  const closestZ = Math.max(box.minZ, Math.min(box.maxZ, z));
  const dx = x - closestX;
  const dz = z - closestZ;
  return dx * dx + dz * dz < radius * radius;
}

function obstacleOverlapCount(x: number, z: number, radius: number, boxes: ObstacleBox[]) {
  let count = 0;
  for (let i = 0; i < boxes.length; i += 1) {
    if (circleIntersectsBox(x, z, radius, boxes[i])) count += 1;
  }
  return count;
}

function buildPlacementCandidates(baseX: number, baseZ: number) {
  const candidates: Array<[number, number, number]> = [];

  for (let ring = 0; ring <= CHEST_PLACEMENT_SEARCH_RINGS; ring += 1) {
    if (ring === 0) {
      candidates.push([baseX, baseZ, 0]);
      continue;
    }

    for (let ix = -ring; ix <= ring; ix += 1) {
      for (let iz = -ring; iz <= ring; iz += 1) {
        if (Math.max(Math.abs(ix), Math.abs(iz)) !== ring) continue;
        const x = baseX + ix * CHEST_PLACEMENT_SEARCH_STEP;
        const z = baseZ + iz * CHEST_PLACEMENT_SEARCH_STEP;
        const distance = Math.hypot(ix, iz) * CHEST_PLACEMENT_SEARCH_STEP;
        candidates.push([x, z, distance]);
      }
    }
  }

  return candidates;
}

function resolveChestPlacement(
  baseX: number,
  baseZ: number,
  floorPieces: DungeonBuildPiece[],
  obstacleBoxes: ObstacleBox[],
) {
  const candidates = buildPlacementCandidates(baseX, baseZ);

  let best: { x: number; z: number; y: number; score: number } | null = null;

  for (let i = 0; i < candidates.length; i += 1) {
    const [x, z, distancePenalty] = candidates[i];

    let supportCount = 0;
    let topY = -Infinity;

    for (let s = 0; s < FOOTPRINT_PROBES.length; s += 1) {
      const [ox, oz] = FOOTPRINT_PROBES[s];
      const floorY = floorSurfaceYAt(x + ox, z + oz, floorPieces);
      if (floorY === null) continue;
      supportCount += 1;
      topY = Math.max(topY, floorY);
    }

    if (supportCount === 0 || !Number.isFinite(topY)) continue;

    const unsupported = FOOTPRINT_PROBES.length - supportCount;
    const overlapPenalty = obstacleOverlapCount(x, z, CHEST_FOOTPRINT_RADIUS * 0.72, obstacleBoxes);
    const score = overlapPenalty * 120 + unsupported * 10 + distancePenalty;

    if (!best || score < best.score) {
      best = { x, z, y: topY + CHEST_SURFACE_OFFSET, score };
      if (score <= 0.001) break;
    }
  }

  if (best) return best;

  const fallbackY = floorSurfaceYAt(baseX, baseZ, floorPieces);
  return {
    x: baseX,
    z: baseZ,
    y: (fallbackY ?? 0) + CHEST_SURFACE_OFFSET,
    score: Number.POSITIVE_INFINITY,
  };
}

interface ChestProps {
  chest: ChestPOI;
  isOpen: boolean;
  isNearby: boolean;
  onOpen: () => void;
  masterVolume: number;
}

function Chest({ chest, isOpen, isNearby, onOpen, masterVolume }: ChestProps) {
  const groupRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Group>(null);
  const openAudioRef = useRef<HTMLAudioElement | null>(null);
  const closeAudioRef = useRef<HTMLAudioElement | null>(null);
  const wasOpenRef = useRef(false);
  const closedChestAsset = useGLTF(CLOSED_CHEST_GLB) as ChestGLTF;
  const openChestAsset = useGLTF(OPEN_CHEST_GLB) as ChestGLTF;

  const baseSize = useMemo(
    () => ({
      width: CHEST_WORLD_WIDTH,
      height: CHEST_WORLD_HEIGHT,
      depth: CHEST_WORLD_DEPTH,
    }),
    [],
  );

  const closedModel = useMemo(
    () => buildChestModel(closedChestAsset.scene, baseSize),
    [baseSize, closedChestAsset.scene],
  );
  const openModel = useMemo(
    () => buildChestModel(openChestAsset.scene, baseSize),
    [baseSize, openChestAsset.scene],
  );

  useEffect(() => {
    if (!openAudioRef.current) {
      openAudioRef.current = new Audio('/sounds/props/chest_open.mp3');
      openAudioRef.current.preload = 'auto';
    }
    if (!closeAudioRef.current) {
      closeAudioRef.current = new Audio('/sounds/ui/ui_close.wav');
      closeAudioRef.current.preload = 'auto';
    }
    return () => {
      if (openAudioRef.current) {
        safePauseAudio(openAudioRef.current);
        openAudioRef.current = null;
      }
      if (closeAudioRef.current) {
        safePauseAudio(closeAudioRef.current);
        closeAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const safeVolume = clampVolume(masterVolume);
    const openAudio = openAudioRef.current;
    const closeAudio = closeAudioRef.current;
    if (openAudio) openAudio.volume = Number.isFinite(safeVolume) ? safeVolume : 0.7;
    if (closeAudio) closeAudio.volume = Number.isFinite(safeVolume) ? safeVolume * 0.75 : 0.5;

    if (isOpen && !wasOpenRef.current && openAudio) {
      openAudio.currentTime = 0;
      openAudio.play().catch(() => { });
    } else if (!isOpen && wasOpenRef.current && closeAudio) {
      closeAudio.currentTime = 0;
      closeAudio.play().catch(() => { });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, masterVolume]);

  useFrame((state) => {
    const chestGroup = groupRef.current;
    if (chestGroup) {
      if (isNearby && !isOpen) {
        const pulse = Math.sin(state.clock.elapsedTime * 3.1) * 0.05 + 1;
        chestGroup.scale.setScalar(pulse);
      } else {
        chestGroup.scale.setScalar(1);
      }
    }

    const marker = markerRef.current;
    if (!marker || isOpen) return;
    const elapsed = state.clock.elapsedTime;
    const bob = Math.sin(elapsed * 2.8) * MARKER_BOB_AMPLITUDE;
    const pulse = (isNearby ? 1.3 : 1.12) + Math.sin(elapsed * 6.2) * (isNearby ? 0.2 : 0.12);
    marker.position.y = MARKER_BASE_HEIGHT + bob;
    marker.scale.setScalar(pulse);
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    // Guard local pointer interactions to nearby-only openings.
    if (!isOpen && isNearby) onOpen();
  };

  return (
    <group
      ref={groupRef}
      position={chest.position}
      rotation={chest.rotation ? new THREE.Euler(...chest.rotation) : undefined}
      onPointerDown={handlePointerDown}
    >
      {isOpen ? (
        openModel ? (
          <primitive object={openModel} />
        ) : (
          <mesh position={[0, baseSize.height * 0.5, 0]}>
            <boxGeometry args={[baseSize.width, baseSize.height, baseSize.depth]} />
            <meshStandardMaterial color="#6b4f3a" roughness={0.8} />
          </mesh>
        )
      ) : closedModel ? (
        <primitive object={closedModel} />
      ) : (
        <mesh position={[0, baseSize.height * 0.5, 0]}>
          <boxGeometry args={[baseSize.width, baseSize.height, baseSize.depth]} />
          <meshStandardMaterial color="#7a5a3e" roughness={0.8} />
        </mesh>
      )}

      {!isOpen && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[
              baseSize.width / 2,
              (baseSize.height * CHEST_COLLIDER_HEIGHT_SCALE) / 2,
              baseSize.depth / 2,
            ]}
            position={[0, (baseSize.height * CHEST_COLLIDER_HEIGHT_SCALE) / 2, 0]}
          />
        </RigidBody>
      )}

      {!isOpen && (
        <group ref={markerRef} position={[0, MARKER_BASE_HEIGHT, 0]}>
          <mesh position={[0, 0.38, 0]} castShadow={false} receiveShadow={false}>
            <capsuleGeometry args={[0.11, 0.82, 8, 14]} />
            <meshStandardMaterial
              color="#ffe06a"
              emissive="#ff9a34"
              emissiveIntensity={1.35}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, -0.34, 0]} castShadow={false} receiveShadow={false}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial
              color="#ffe06a"
              emissive="#ff9a34"
              emissiveIntensity={1.35}
              roughness={0.35}
            />
          </mesh>
        </group>
      )}

      {isNearby && !isOpen && (
        <pointLight
          position={[0, MARKER_BASE_HEIGHT + 0.05, 0]}
          color="#fbbf24"
          intensity={2.1}
          distance={4.6}
          decay={2}
        />
      )}
    </group>
  );
}

interface ChestSystemProps {
  onChestOpen: (chest: ChestPOI) => void;
  onNearbyChange: (chestId: string | null) => void;
  activeChestId: string | null;
  nearbyChestId: string | null;
}

export function ChestSystem({
  onChestOpen,
  onNearbyChange,
  activeChestId,
  nearbyChestId,
}: ChestSystemProps) {
  const playerPositionRef = useRef(usePlayerState.getState().position);
  const masterVolume = useSettings((s: { masterVolume: number }) => s.masterVolume);
  const prevNearbyRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPlayerState((state, prevState) => {
      if (state.position !== prevState.position) {
        playerPositionRef.current = state.position;
      }
    });
    return unsubscribe;
  }, []);

  const dungeon = useMemo(() => buildDungeon(DUNGEON_LAYOUT_GRAPH), []);

  const floorPieces = useMemo(
    () => dungeon.pieces.filter((piece) => FLOOR_KINDS.has(piece.kind)),
    [dungeon.pieces],
  );

  const floorIds = useMemo(() => new Set(floorPieces.map((piece) => piece.id)), [floorPieces]);

  const obstacleBoxes = useMemo<ObstacleBox[]>(
    () =>
      dungeon.colliders
        .filter((collider) => !floorIds.has(collider.id))
        .map((collider) => ({
          minX: collider.position[0] - collider.size[0] * 0.5,
          maxX: collider.position[0] + collider.size[0] * 0.5,
          minZ: collider.position[2] - collider.size[2] * 0.5,
          maxZ: collider.position[2] + collider.size[2] * 0.5,
        })),
    [dungeon.colliders, floorIds],
  );

  const renderedChests = useMemo<RenderedChest[]>(
    () =>
      CHEST_POIS.map((chest) => {
        const baseX = chest.position[0] * DUNGEON_SCALE;
        const baseY = chest.position[1] * DUNGEON_SCALE;
        const baseZ = chest.position[2] * DUNGEON_SCALE;
        const resolved = resolveChestPlacement(baseX, baseZ, floorPieces, obstacleBoxes);

        return {
          chest,
          position: [resolved.x, Math.max(baseY, resolved.y), resolved.z],
        };
      }),
    [floorPieces, obstacleBoxes],
  );

  useFrame(() => {
    const playerPosition = playerPositionRef.current;
    let nearest: { id: string; distance: number } | null = null;

    for (let i = 0; i < renderedChests.length; i += 1) {
      const entry = renderedChests[i];
      const chestX = entry.position[0];
      const chestZ = entry.position[2];

      const dx = playerPosition.x - chestX;
      const dz = playerPosition.z - chestZ;
      const distance = Math.sqrt(dx * dx + dz * dz);

      const scaledInteractionRadius = entry.chest.interactionRadius * DUNGEON_SCALE;
      if (distance < scaledInteractionRadius) {
        if (!nearest || distance < nearest.distance) {
          nearest = { id: entry.chest.id, distance };
        }
      }
    }

    const newNearby = nearest ? nearest.id : null;
    if (newNearby !== prevNearbyRef.current) {
      prevNearbyRef.current = newNearby;
      onNearbyChange(newNearby);
    }
  });

  return (
    <group name="chest-system">
      {renderedChests.map((entry) => (
        <Chest
          key={entry.chest.id}
          chest={{
            ...entry.chest,
            position: entry.position,
          }}
          isOpen={activeChestId === entry.chest.id}
          isNearby={nearbyChestId === entry.chest.id}
          onOpen={() => {
            // Authoritative proximity check at click time prevents opening
            // distant chests when UI nearby state is stale for a frame.
            const playerPosition = playerPositionRef.current;
            const dx = playerPosition.x - entry.position[0];
            const dz = playerPosition.z - entry.position[2];
            const distance = Math.sqrt(dx * dx + dz * dz);
            const scaledInteractionRadius = entry.chest.interactionRadius * DUNGEON_SCALE;
            if (distance > scaledInteractionRadius) return;
            onChestOpen(entry.chest);
          }}
          masterVolume={masterVolume}
        />
      ))}
    </group>
  );
}

useGLTF.preload(CLOSED_CHEST_GLB);
useGLTF.preload(OPEN_CHEST_GLB);
