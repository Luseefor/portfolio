'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import {
  AdditiveBlending,
  SpotLight as SpotLightImpl,
} from 'three';
import {
  AMBIENT_PROP_PLACEMENT_LIMIT,
  BORDER_COLLIDER_HEIGHT_PAD,
  BORDER_COLLIDER_PAD,
  BORDER_WALL_SOURCE_KINDS,
  CEILING_CAP_EXPAND,
  CEILING_CAP_RISE,
  CEILING_CAP_THICKNESS,
  CEILING_CLEARANCE,
  CEILING_EXPAND,
  CEILING_THICKNESS,
  FLOOR_KINDS,
  FLOOR_VISUAL_OVERHANG,
  POT_BREAK_BASE_VOLUME,
  POT_BROKEN_NODE_FALLBACKS,
  POT_INTACT_NODE_FALLBACKS,
  POT_PLACEMENT_LIMIT,
  POT_RESPAWN_MS,
  RUINS_GLB_PATH,
  SPAWN_BORDER_HIDE_PADDING,
  TORCH_LIGHT_DECAY,
  TORCH_MOUNT_HEIGHT,
  TORCH_PLACEMENT_LIMIT,
  TORCH_WALL_ADVANCE,
  TORCH_WALL_CLEARANCE,
  TORCH_WALL_FILL_BACK_OFFSET,
  TORCH_WALL_FILL_HEIGHT,
  TORCH_WALL_GLOW_SIZE,
  WALL_BACKER_EXPAND_X,
  WALL_BACKER_EXPAND_Y,
  WALL_BACKER_OFFSET,
  WALL_BACKER_THICKNESS,
} from './dungeon-world/constants';
import {
  ceilingCapMaterial,
  ceilingFallbackMaterial,
  floorUnderlayMaterial,
  wallFallbackMaterial,
} from './dungeon-world/materials';
import {
  ambientPropNodeCandidates,
  bushNodeCandidates,
  ceilingNodeCandidates,
  floorNodeCandidates,
  hashString,
  potVariantFor,
  torchNodeCandidates,
  wallBackerNodeCandidates,
  wallNodeCandidates,
} from './dungeon-world/nodeCandidates';
import {
  buildScaledFloorObject,
  markFloorMeshForShadows,
  materialForFloor,
  setObjectMaterialsDoubleSided,
  underlaySpecForFloor,
} from './dungeon-world/floorUtils';
import { buildBorderSegments } from './dungeon-world/borderSegments';
import { buildVerticalBorderWalls, splitWallIntoPanels } from './dungeon-world/wallPanelSplit';
import { floorSurfaceYAt } from './dungeon-world/floorQueries';
import { orientWallPanelTowardInterior, resolvePropXZForPanel } from './dungeon-world/propPlacement';
import {
  buildWallCollisionBoxes,
  findNearestWallPanel,
  moveTowardWallPanel,
  wallFacingRotationY,
} from './dungeon-world/wallSpatial';
import { colliderArgsFromSize, groundAlignObjectToZeroY, setTorchGlowMaterial } from './dungeon-world/propHelpers';
import type {
  AmbientPropVisual,
  BorderSegment,
  BushVisual,
  CeilingVisual,
  FloorVisual,
  PotVisual,
  TorchVisual,
  WallBackerVisual,
  WallVisual,
} from './dungeon-world/types';
import { DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';
import {
  buildDungeon,
} from '@/game/dungeon/buildDungeon';
import { createSafeNodeResolver } from '@/game/dungeon/utils';
import { clearDungeonVisualLiftTiles, setDungeonVisualLiftTiles } from '@/lib/dungeonVisualLift';
import { clampVolume, useSettings } from '@/lib/settings';

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
  const potBreakAudioRef = useRef<HTMLAudioElement[]>([]);
  const potBreakAudioIndexRef = useRef(0);
  const potRespawnTimersRef = useRef<Map<string, number>>(new Map());
  const masterVolume = useSettings((state) => state.masterVolume);
  const graphicsQuality = useSettings((state) => state.graphicsQuality);
  const torchLimit = graphicsQuality === 'low' ? 12 : graphicsQuality === 'medium' ? 16 : TORCH_PLACEMENT_LIMIT;
  const torchIntensityScale = graphicsQuality === 'low' ? 0.75 : graphicsQuality === 'medium' ? 0.9 : 1;
  const wallFillPointLightEnabled = graphicsQuality === 'high';

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
    return dungeon.torchAnchors.slice(0, torchLimit).map((anchor) => {
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
      const torchPlacementSize: [number, number, number] = [0.42, size[1], 0.42];
      const [baseX, baseZ] = panel
        ? resolvePropXZForPanel(panel, torchPlacementSize, seed, floorPieces, wallCollisionBoxes)
        : [anchor.position[0], anchor.position[2]];
      const [x, z] = panel
        ? moveTowardWallPanel(panel, baseX, baseZ, TORCH_WALL_ADVANCE, TORCH_WALL_CLEARANCE)
        : [baseX, baseZ];
      const floorTopY = floorSurfaceYAt(x, z, floorPieces);
      const torchPosition: [number, number, number] = [x, floorTopY + 0.04, z];
      const rotationY = (panel ? wallFacingRotationY(panel, x, z) : anchor.rotationY) + Math.PI;

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
        rotationY,
        size,
        object,
        glowColor:
          anchor.source === 'spawn'
            ? '#ffcd86'
            : anchor.source === 'corridor'
              ? '#ff9f54'
              : '#ffba73',
        baseIntensity:
          (anchor.source === 'spawn' ? 0.9 : anchor.source === 'corridor' ? 0.7 : 0.8) *
          torchIntensityScale,
        wallFillIntensity:
          (anchor.source === 'spawn' ? 0.88 : anchor.source === 'corridor' ? 0.74 : 0.8) *
          torchIntensityScale,
        wallGlowOpacity:
          graphicsQuality === 'low' ? 0.16 : graphicsQuality === 'medium' ? 0.22 : 0.27,
        distance: (anchor.source === 'corridor' ? 6.5 : 7.2) * (graphicsQuality === 'low' ? 0.8 : 1),
        flickerSeed: (hashString(`torch-flicker-${anchor.id}`) % 6283) / 1000,
        lightTarget,
      };
    });
  }, [dungeon.torchAnchors, floorPieces, graphicsQuality, resolveNode, torchIntensityScale, torchLimit, wallCollisionBoxes, wallPanels]);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const respawnTimers = potRespawnTimersRef.current;
    if (!potBreakAudioRef.current.length) {
      potBreakAudioRef.current = [
        new Audio('/sounds/props/pot_break.wav'),
        new Audio('/sounds/props/pot_break.wav'),
      ];
      potBreakAudioRef.current.forEach((audio) => {
        audio.preload = 'auto';
        audio.volume = POT_BREAK_BASE_VOLUME;
      });
    }
    return () => {
      potBreakAudioRef.current.forEach((audio) => audio.pause());
      respawnTimers.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      respawnTimers.clear();
    };
  }, []);

  useEffect(() => {
    const volumeScale = clampVolume(masterVolume);
    potBreakAudioRef.current.forEach((audio) => {
      audio.volume = POT_BREAK_BASE_VOLUME * volumeScale;
    });
  }, [masterVolume]);

  const handlePotPointerDown = (potId: string, event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (brokenPotIds.has(potId)) return;

    const nextAudio = potBreakAudioRef.current.length
      ? potBreakAudioRef.current[potBreakAudioIndexRef.current % potBreakAudioRef.current.length]
      : null;
    potBreakAudioIndexRef.current += 1;
    if (nextAudio) {
      nextAudio.currentTime = 0;
      nextAudio.playbackRate = 0.96 + Math.random() * 0.08;
      nextAudio.play().catch(() => { });
    }

    const existingTimer = potRespawnTimersRef.current.get(potId);
    if (existingTimer !== undefined && typeof window !== 'undefined') {
      window.clearTimeout(existingTimer);
    }

    setBrokenPotIds((previous) => {
      if (previous.has(potId)) return previous;
      const next = new Set(previous);
      next.add(potId);
      return next;
    });

    if (typeof window !== 'undefined') {
      const restoreTimer = window.setTimeout(() => {
        setBrokenPotIds((previous) => {
          if (!previous.has(potId)) return previous;
          const next = new Set(previous);
          next.delete(potId);
          return next;
        });
        potRespawnTimersRef.current.delete(potId);
      }, POT_RESPAWN_MS);
      potRespawnTimersRef.current.set(potId, restoreTimer);
    }
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
          <mesh
            position={[0, TORCH_WALL_FILL_HEIGHT, TORCH_WALL_FILL_BACK_OFFSET]}
            rotation={[0, Math.PI, 0]}
            renderOrder={2}
          >
            <planeGeometry args={[TORCH_WALL_GLOW_SIZE, TORCH_WALL_GLOW_SIZE]} />
            <meshBasicMaterial
              color={torch.glowColor}
              transparent
              opacity={torch.wallGlowOpacity}
              depthWrite={false}
              side={DoubleSide}
              blending={AdditiveBlending}
            />
          </mesh>
          {wallFillPointLightEnabled && (
            <pointLight
              position={[0, TORCH_WALL_FILL_HEIGHT, TORCH_WALL_FILL_BACK_OFFSET]}
              intensity={torch.wallFillIntensity}
              color={torch.glowColor}
              distance={3.4}
              decay={2}
              castShadow={false}
            />
          )}
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
