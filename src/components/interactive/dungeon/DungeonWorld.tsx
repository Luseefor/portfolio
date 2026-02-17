'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Object3D } from 'three';
import {
  FLOOR_KINDS,
  RUINS_GLB_PATH,
  TORCH_PLACEMENT_LIMIT,
} from './dungeon-world/constants';
import { usePotBreakState } from './dungeon-world/usePotBreakState';
import { useTorchFlicker } from './dungeon-world/useTorchFlicker';
import { useDungeonVisualLiftSync } from './dungeon-world/useDungeonVisualLiftSync';
import { useFloorCeilingVisuals } from './dungeon-world/useFloorCeilingVisuals';
import { useWallPanelLayout } from './dungeon-world/useWallPanelLayout';
import { useWallVisuals } from './dungeon-world/useWallVisuals';
import { useBushVisuals } from './dungeon-world/useBushVisuals';
import { useTorchVisuals } from './dungeon-world/useTorchVisuals';
import { usePotVisuals } from './dungeon-world/usePotVisuals';
import { useAmbientPropVisuals } from './dungeon-world/useAmbientPropVisuals';
import { useDungeonColliders } from './dungeon-world/useDungeonColliders';
import DungeonFloorCeilingLayer from './dungeon-world/render/DungeonFloorCeilingLayer';
import DungeonWallLayer from './dungeon-world/render/DungeonWallLayer';
import DungeonTorchLayer from './dungeon-world/render/DungeonTorchLayer';
import DungeonPotLayer from './dungeon-world/render/DungeonPotLayer';
import DungeonColliderLayer from './dungeon-world/render/DungeonColliderLayer';
import { DUNGEON_LAYOUT, DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';
import { DUNGEON_LAYOUT_GRAPH_MINIMAL, DUNGEON_LAYOUT_MINIMAL } from '@/constants/dungeonLayoutMinimal';
import {
  buildDungeon,
} from '@/game/dungeon/buildDungeon';
import { createSafeNodeResolver } from '@/game/dungeon/utils';
import { useSettings } from '@/lib/settings';
import {
  buildOriginProbeObject,
  hasRenderableVisualObjects,
  warnAboutDungeonLayoutNodes,
} from './dungeon-world/renderDiagnostics';

export default function DungeonWorld() {
  const masterVolume = useSettings((state) => state.masterVolume);
  const graphicsQuality = useSettings((state) => state.graphicsQuality);
  const { brokenPotIds, handlePotPointerDown } = usePotBreakState(masterVolume);
  const torchLimit = graphicsQuality === 'low' ? 12 : graphicsQuality === 'medium' ? 16 : TORCH_PLACEMENT_LIMIT;
  const torchIntensityScale = graphicsQuality === 'low' ? 0.75 : graphicsQuality === 'medium' ? 0.9 : 1;
  const wallFillPointLightEnabled = graphicsQuality === 'high';

  const ruins = useGLTF(RUINS_GLB_PATH) as { nodes?: Record<string, Object3D> };
  const ruinsNodes = useMemo(() => ruins.nodes ?? {}, [ruins.nodes]);
  const resolveNode = useMemo(() => createSafeNodeResolver(ruinsNodes), [ruinsNodes]);
  const originProbeObject = useMemo(() => buildOriginProbeObject(ruinsNodes), [ruinsNodes]);

  const dungeon = useMemo(() => {
    const primary = buildDungeon(DUNGEON_LAYOUT_GRAPH);
    if (primary.pieces.length > 0) return primary;
    console.warn('[DungeonWorld] Primary dungeon graph was empty. Falling back to DUNGEON_LAYOUT_GRAPH_MINIMAL.');
    return buildDungeon(DUNGEON_LAYOUT_GRAPH_MINIMAL);
  }, []);
  const layoutForDiagnostics = useMemo(
    () => (DUNGEON_LAYOUT.length > 0 ? DUNGEON_LAYOUT : DUNGEON_LAYOUT_MINIMAL),
    [],
  );

  const floorPieces = useMemo(
    () => dungeon.pieces.filter((piece) => FLOOR_KINDS.has(piece.kind)),
    [dungeon.pieces],
  );

  const { floorVisuals, ceilingVisuals, floorColliders } = useFloorCeilingVisuals(
    floorPieces,
    resolveNode,
    dungeon.colliders,
  );

  const { borderWalls, wallPanels } = useWallPanelLayout(dungeon.pieces, floorPieces);
  const { wallVisuals, wallBackers, wallCollisionBoxes } = useWallVisuals(wallPanels, resolveNode);

  const bushVisuals = useBushVisuals(wallPanels, floorPieces, resolveNode);
  const torchVisuals = useTorchVisuals(
    dungeon.torchAnchors,
    torchLimit,
    wallPanels,
    floorPieces,
    wallCollisionBoxes,
    resolveNode,
    graphicsQuality,
    torchIntensityScale,
  );
  const potVisuals = usePotVisuals(wallPanels, floorPieces, wallCollisionBoxes, resolveNode);
  const ambientPropVisuals = useAmbientPropVisuals(wallPanels, floorPieces, wallCollisionBoxes, resolveNode);

  const { borderColliders, torchColliders, ambientColliders, potColliders } = useDungeonColliders(
    borderWalls,
    torchVisuals,
    ambientPropVisuals,
    potVisuals,
    brokenPotIds,
  );

  const { torchLightRefs } = useTorchFlicker(torchVisuals);
  useDungeonVisualLiftSync(dungeon.walkableTiles);
  const hasRenderableDungeonVisuals = useMemo(
    () =>
      hasRenderableVisualObjects(
        floorVisuals,
        ceilingVisuals,
        wallVisuals,
        wallBackers,
        torchVisuals,
        potVisuals,
        ambientPropVisuals,
        bushVisuals,
      ),
    [ambientPropVisuals, bushVisuals, ceilingVisuals, floorVisuals, potVisuals, torchVisuals, wallBackers, wallVisuals],
  );

  useEffect(() => {
    warnAboutDungeonLayoutNodes(layoutForDiagnostics, ruinsNodes);
  }, [layoutForDiagnostics, ruinsNodes]);

  useEffect(() => {
    if (dungeon.pieces.length > 0) return;
    console.warn('[DungeonWorld] Dungeon build returned zero pieces.');
  }, [dungeon.pieces.length]);

  useEffect(() => {
    if (hasRenderableDungeonVisuals || !originProbeObject) return;
    console.warn('[DungeonWorld] No renderable dungeon visuals resolved; showing origin probe.');
  }, [hasRenderableDungeonVisuals, originProbeObject]);

  return (
    <group name="dungeon-world-debug-layout">
      {!hasRenderableDungeonVisuals && originProbeObject ? (
        <group name="dungeon-origin-probe" position={[0, 0, 0]}>
          <primitive object={originProbeObject} />
        </group>
      ) : null}
      <DungeonFloorCeilingLayer ceilingVisuals={ceilingVisuals} floorVisuals={floorVisuals} />
      <DungeonWallLayer
        wallBackers={wallBackers}
        wallVisuals={wallVisuals}
        bushVisuals={bushVisuals}
        ambientPropVisuals={ambientPropVisuals}
      />
      <DungeonTorchLayer
        torchVisuals={torchVisuals}
        torchLightRefs={torchLightRefs}
        wallFillPointLightEnabled={wallFillPointLightEnabled}
      />
      <DungeonPotLayer
        potVisuals={potVisuals}
        brokenPotIds={brokenPotIds}
        onPotPointerDown={handlePotPointerDown}
      />
      <DungeonColliderLayer
        floorColliders={floorColliders}
        borderColliders={borderColliders}
        torchColliders={torchColliders}
        ambientColliders={ambientColliders}
        potColliders={potColliders}
      />
    </group>
  );
}

useGLTF.preload(RUINS_GLB_PATH);
