'use client';

import { useCallback, useEffect, useState } from 'react';
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
  const setMouseDown = useDungeonInput((state) => state.setMouseDown);

  useEffect(() => {
    if (!canvasEl) return;

    const handleNativeMouseDown = () => {
      setMouseDown(true);
      if (document.pointerLockElement !== canvasEl) {
        canvasEl.requestPointerLock();
      }
    };
    const handleMouseUp = () => {
      setMouseDown(false);
    };
    const handleMouseLeave = () => {
      setMouseDown(false);
    };

    canvasEl.addEventListener('mousedown', handleNativeMouseDown);
    canvasEl.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      canvasEl.removeEventListener('mousedown', handleNativeMouseDown);
      canvasEl.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasEl, setHasFocus, setMouseDown, setPointerLocked]);

  useEffect(() => {
    if (!canvasEl) return;
    const focusCanvas = () => {
      canvasEl.focus();
      setHasFocus(true);
    };
    window.addEventListener('keydown', focusCanvas);
    return () => window.removeEventListener('keydown', focusCanvas);
  }, [canvasEl, setHasFocus]);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, [setHasFocus]);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
    setPointerLocked(false);
  }, [setHasFocus, setPointerLocked]);

  useEffect(() => {
    if (!canvasEl) return;
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvasEl;
      setPointerLocked(isLocked);
      if (isLocked) setHasFocus(true);
      else if (document.activeElement !== canvasEl) setHasFocus(false);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, [canvasEl, setHasFocus, setPointerLocked]);

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
        <DungeonScene />
      </Canvas>
      <LoadingScreen />
    </div>
  );
}
