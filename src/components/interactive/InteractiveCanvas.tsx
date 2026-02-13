'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import LoadingScreen from './LoadingScreen';
import DungeonScene from './dungeon/DungeonScene';
import MobileControls from './dungeon/ui/MobileControls';
import { DungeonUI, useDungeonInteraction } from './dungeon/DungeonInteractionManager';
import { CHEST_POIS } from '@/constants/dungeonLayout';
import { rendererToneMapping } from '@/constants/scene';
import { useDungeonInput } from '@/lib/dungeonInput';

export default function InteractiveCanvas() {
  const {
    openedChests,
    nearbyChestId,
    activePanel,
    isSettingsOpen,
    handleChestOpen,
    handleNearbyChange,
    handleClosePanel,
    handleOpenSettings,
    handleCloseSettings,
  } = useDungeonInteraction();
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const setHasFocus = useDungeonInput((state) => state.setHasFocus);
  const setPointerLocked = useDungeonInput((state) => state.setPointerLocked);
  const setMouseDown = useDungeonInput((state) => state.setMouseDown);
  const setTouchDevice = useDungeonInput((state) => state.setTouchDevice);
  const setMoveAxis = useDungeonInput((state) => state.setMoveAxis);
  const setKeys = useDungeonInput((state) => state.setKeys);
  const isTouchDevice = useDungeonInput((state) => state.isTouchDevice);
  const unlockRequestRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const computeIsTouchDevice = () => {
      if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
        return false;
      }
      const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return coarsePointer || touchCapable;
    };
    const updateTouchMode = () => setTouchDevice(computeIsTouchDevice());
    updateTouchMode();
    window.addEventListener('resize', updateTouchMode);
    return () => window.removeEventListener('resize', updateTouchMode);
  }, [setTouchDevice]);

  useEffect(() => {
    if (!isTouchDevice) return;
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setPointerLocked(false);
  }, [isTouchDevice, setPointerLocked]);

  useEffect(() => {
    if (!canvasEl) return;

    const requestUnlock = (event?: Event) => {
      unlockRequestRef.current = Date.now();
      if (event) {
        event.preventDefault();
        if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
      }
      if (document.pointerLockElement) {
        document.exitPointerLock();
        setTimeout(() => {
          if (document.pointerLockElement) document.exitPointerLock();
        }, 0);
        requestAnimationFrame(() => {
          if (document.pointerLockElement) document.exitPointerLock();
        });
      }
      setPointerLocked(false);
      setHasFocus(true);
    };

    const handleNativeMouseDown = (event: MouseEvent) => {
      if (isTouchDevice) return;
      setMouseDown(true);
      if (event.button === 2) {
        requestUnlock(event);
        return;
      }
      if (document.pointerLockElement !== canvasEl && event.target === canvasEl) {
        try {
          canvasEl.requestPointerLock();
        } catch {
          // Ignore pointer lock request errors and keep keyboard focus flow alive.
        }
      }
    };
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (isTouchDevice) return;
      setMouseDown(true);
      if (event.button === 2) {
        requestUnlock(event);
      }
    };
    const handleMouseUp = () => {
      setMouseDown(false);
    };
    const handleMouseLeave = () => {
      setMouseDown(false);
    };
    const handleContextMenu = (event: MouseEvent) => requestUnlock(event);

    const handlePointerDown = (event: PointerEvent) => {
      if (isTouchDevice || event.pointerType === 'touch') return;
      if (event.button === 2) {
        requestUnlock(event);
      }
    };
    const handlePointerUp = () => {
      setMouseDown(false);
    };

    canvasEl.addEventListener('mousedown', handleNativeMouseDown);
    canvasEl.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('mouseleave', handleMouseLeave);
    canvasEl.addEventListener('contextmenu', handleContextMenu);
    canvasEl.addEventListener('pointerdown', handlePointerDown);
    canvasEl.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mousedown', handleDocumentMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('pointerup', handlePointerUp, true);
    document.addEventListener('auxclick', handleContextMenu, true);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      canvasEl.removeEventListener('mousedown', handleNativeMouseDown);
      canvasEl.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('mouseleave', handleMouseLeave);
      canvasEl.removeEventListener('contextmenu', handleContextMenu);
      canvasEl.removeEventListener('pointerdown', handlePointerDown);
      canvasEl.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mousedown', handleDocumentMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('pointerup', handlePointerUp, true);
      document.removeEventListener('auxclick', handleContextMenu, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [canvasEl, isTouchDevice, setHasFocus, setMouseDown, setPointerLocked]);

  useEffect(() => {
    if (!canvasEl) return;
    const focusCanvas = () => {
      canvasEl.focus();
      setHasFocus(true);
    };
    window.addEventListener('keydown', focusCanvas);
    return () => window.removeEventListener('keydown', focusCanvas);
  }, [canvasEl, setHasFocus]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys({ forward: pressed });
          break;
        case 'KeyS':
        case 'ArrowDown':
          setKeys({ backward: pressed });
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setKeys({ left: pressed });
          break;
        case 'KeyD':
        case 'ArrowRight':
          setKeys({ right: pressed });
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys({ run: pressed });
          break;
        case 'KeyQ':
          setKeys({ dash: pressed });
          break;
        case 'Space':
          setKeys({ jump: pressed });
          break;
        case 'KeyC':
          setKeys({ roll: pressed });
          break;
        case 'KeyR':
          setKeys({ attack: pressed });
          break;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    const onBlur = () => {
      setMoveAxis({ x: 0, y: 0 });
      setKeys({
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
        dash: false,
        jump: false,
        roll: false,
        attack: false,
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [setKeys, setMoveAxis]);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, [setHasFocus]);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
    setPointerLocked(false);
    setMoveAxis({ x: 0, y: 0 });
  }, [setHasFocus, setMoveAxis, setPointerLocked]);

  const handleMobileInteract = useCallback(() => {
    if (!nearbyChestId || activePanel || isSettingsOpen) return;
    const chest = CHEST_POIS.find((entry) => entry.id === nearbyChestId);
    if (!chest) return;
    handleChestOpen(chest);
  }, [activePanel, handleChestOpen, isSettingsOpen, nearbyChestId]);

  useEffect(() => {
    if (!canvasEl) return;
    if (isTouchDevice) {
      setPointerLocked(false);
      return;
    }
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvasEl;
      if (isLocked && Date.now() - unlockRequestRef.current < 200) {
        document.exitPointerLock();
        return;
      }
      setPointerLocked(isLocked);
      if (isLocked) setHasFocus(true);
      else if (document.activeElement !== canvasEl) setHasFocus(false);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, [canvasEl, isTouchDevice, setHasFocus, setPointerLocked]);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 4, 10] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = rendererToneMapping.exposure;
          gl.shadowMap.enabled = true;
          setCanvasEl(gl.domElement);
          gl.domElement.tabIndex = 0;
          gl.domElement.focus();
        }}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <DungeonScene
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
        isSettingsOpen={isSettingsOpen}
        onClosePanel={handleClosePanel}
        onCloseSettings={handleCloseSettings}
      />
      <MobileControls
        visible={isTouchDevice}
        blocked={Boolean(activePanel) || isSettingsOpen}
        canInteract={Boolean(nearbyChestId) && !activePanel && !isSettingsOpen}
        onInteract={handleMobileInteract}
        onOpenSettings={handleOpenSettings}
      />
      <LoadingScreen />
    </div>
  );
}
