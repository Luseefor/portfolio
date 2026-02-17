'use client';

import { useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, type WebGLRenderer } from 'three';
import LoadingScreen from './LoadingScreen';
import DungeonScene from './dungeon/DungeonScene';
import MobileControls from './dungeon/ui/MobileControls';
import { DungeonUI, useDungeonInteraction } from './dungeon/DungeonInteractionManager';
import { CHEST_POIS } from '@/constants/dungeonLayout';
import { rendererToneMapping } from '@/constants/scene';
import { useDungeonInput } from '@/lib/dungeonInput';
import { useSettings } from '@/lib/settings';
import { getRenderQualitySettings } from './interactive-canvas/config';
import { useCanvasFocusOnKey } from './interactive-canvas/useCanvasFocusOnKey';
import { useCanvasPointerEvents } from './interactive-canvas/useCanvasPointerEvents';
import { useDetectTouchMode } from './interactive-canvas/useDetectTouchMode';
import { useDisablePointerLockOnTouch } from './interactive-canvas/useDisablePointerLockOnTouch';
import { useKeyboardMovement } from './interactive-canvas/useKeyboardMovement';
import { usePointerLockSync } from './interactive-canvas/usePointerLockSync';
import { useRendererSettings } from './interactive-canvas/useRendererSettings';

export default function InteractiveCanvas() {
  const {
    openedChests, nearbyChestId, activePanel, hintProgress, hintToast, isSettingsOpen, isWelcomeOpen,
    handleChestOpen, handleNearbyChange, handleClosePanel, handleOpenSettings, handleCloseSettings, handleCloseWelcome, handleResetHints,
  } = useDungeonInteraction();
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const setHasFocus = useDungeonInput((state) => state.setHasFocus);
  const setPointerLocked = useDungeonInput((state) => state.setPointerLocked);
  const setMouseDown = useDungeonInput((state) => state.setMouseDown);
  const setTouchDevice = useDungeonInput((state) => state.setTouchDevice);
  const setMoveAxis = useDungeonInput((state) => state.setMoveAxis);
  const setKeys = useDungeonInput((state) => state.setKeys);
  const isTouchDevice = useDungeonInput((state) => state.isTouchDevice);
  const graphicsQuality = useSettings((state) => state.graphicsQuality);
  const exposure = useSettings((state) => state.exposure);
  const unlockRequestRef = useRef(0);
  const rendererRef = useRef<WebGLRenderer | null>(null);

  const { shadowsEnabled, canvasDpr, antialiasEnabled } = getRenderQualitySettings(graphicsQuality);

  useDetectTouchMode(setTouchDevice);
  useDisablePointerLockOnTouch(isTouchDevice, setPointerLocked);
  useCanvasPointerEvents({
    canvasEl,
    isTouchDevice,
    setHasFocus,
    setPointerLocked,
    setMouseDown,
    unlockRequestRef,
  });
  useCanvasFocusOnKey(canvasEl, setHasFocus);
  useKeyboardMovement(setKeys, setMoveAxis);
  usePointerLockSync({
    canvasEl,
    isTouchDevice,
    isSettingsOpen,
    hasActivePanel: Boolean(activePanel),
    isWelcomeOpen,
    handleOpenSettings,
    setHasFocus,
    setPointerLocked,
    unlockRequestRef,
  });
  useRendererSettings(rendererRef, exposure, shadowsEnabled);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, [setHasFocus]);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
    setPointerLocked(false);
    setMoveAxis({ x: 0, y: 0 });
  }, [setHasFocus, setMoveAxis, setPointerLocked]);

  const handleMobileInteract = useCallback(() => {
    if (!nearbyChestId || activePanel || isSettingsOpen || isWelcomeOpen) return;
    const chest = CHEST_POIS.find((entry) => entry.id === nearbyChestId);
    if (chest) handleChestOpen(chest);
  }, [activePanel, handleChestOpen, isSettingsOpen, isWelcomeOpen, nearbyChestId]);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={canvasDpr}
        shadows={shadowsEnabled}
        gl={{ antialias: antialiasEnabled, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 4, 10] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = Number.isFinite(exposure) ? exposure : rendererToneMapping.exposure;
          gl.shadowMap.enabled = shadowsEnabled;
          rendererRef.current = gl;
          setCanvasEl(gl.domElement);
          gl.domElement.tabIndex = 0;
          gl.domElement.focus();
        }}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <DungeonScene
          graphicsQuality={graphicsQuality}
          activeChestId={activePanel?.id ?? null}
          nearbyChestId={nearbyChestId}
          onChestOpen={handleChestOpen}
          onNearbyChange={handleNearbyChange}
        />
      </Canvas>
      <DungeonUI
        openedChests={openedChests}
        nearbyChestId={nearbyChestId}
        activePanel={activePanel}
        hintProgress={hintProgress}
        hintToast={hintToast}
        isSettingsOpen={isSettingsOpen}
        isWelcomeOpen={isWelcomeOpen}
        onClosePanel={handleClosePanel}
        onCloseSettings={handleCloseSettings}
        onCloseWelcome={handleCloseWelcome}
        onResetHints={handleResetHints}
      />
      <MobileControls
        visible={isTouchDevice}
        blocked={Boolean(activePanel) || isSettingsOpen || isWelcomeOpen}
        canInteract={Boolean(nearbyChestId) && !activePanel && !isSettingsOpen && !isWelcomeOpen}
        onInteract={handleMobileInteract}
        onOpenSettings={handleOpenSettings}
      />
      <LoadingScreen />
    </div>
  );
}
