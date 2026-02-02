'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import LoadingScreen from './LoadingScreen';
import DungeonScene from './dungeon/DungeonScene';
import { rendererToneMapping } from '@/constants/scene';
import { useDungeonInput } from '@/lib/dungeonInput';

export default function InteractiveCanvas() {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const setHasFocus = useDungeonInput((state) => state.setHasFocus);
  const setPointerLocked = useDungeonInput((state) => state.setPointerLocked);
  const addEvent = useDungeonInput((state) => state.addEvent);
  const setMouseDown = useDungeonInput((state) => state.setMouseDown);
  const forcePointerLock = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('forcePointerLock') === '1',
    [],
  );

  useEffect(() => {
    if (!canvasEl) return;

    const handleNativeMouseDown = () => {
      setMouseDown(true);
      if (forcePointerLock) {
        setPointerLocked(true);
        setHasFocus(true);
        addEvent('pointerlock forced via query');
        return;
      }

      if (document.pointerLockElement !== canvasEl) {
        canvasEl.requestPointerLock();
        addEvent('pointerlock requested');
      }
    };
    const handleMouseUp = () => {
      setMouseDown(false);
      addEvent('mouse up');
    };
    const handleMouseLeave = () => {
      setMouseDown(false);
      addEvent('mouse leave');
    };

    canvasEl.addEventListener('mousedown', handleNativeMouseDown);
    canvasEl.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      canvasEl.removeEventListener('mousedown', handleNativeMouseDown);
      canvasEl.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [addEvent, canvasEl, forcePointerLock, setHasFocus, setMouseDown, setPointerLocked]);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
    addEvent('canvas focus');
  }, [setHasFocus]);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
    if (forcePointerLock) {
      setPointerLocked(false);
    }
    addEvent('canvas blur');
  }, [forcePointerLock, setHasFocus, setPointerLocked]);

  useEffect(() => {
    if (!canvasEl) return;
    if (forcePointerLock) return;
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvasEl;
      setPointerLocked(isLocked);
      if (isLocked) {
        setHasFocus(true);
        addEvent('pointerlock acquired');
      } else if (document.activeElement !== canvasEl) {
        setHasFocus(false);
        addEvent('pointerlock released');
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, [canvasEl, forcePointerLock, setHasFocus, setPointerLocked]);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 4, 10] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = rendererToneMapping.exposure;
          setCanvasEl(gl.domElement);
          gl.domElement.focus();
        }}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <DungeonScene />
      </Canvas>
      <LoadingScreen />
    </div>
  );
}
