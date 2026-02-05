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
  const setKeys = useDungeonInput((state) => state.setKeys);

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
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (document.pointerLockElement === canvasEl) {
        document.exitPointerLock();
      }
      setPointerLocked(false);
      setHasFocus(true);
    };

    canvasEl.addEventListener('mousedown', handleNativeMouseDown);
    canvasEl.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('mouseleave', handleMouseLeave);
    canvasEl.addEventListener('contextmenu', handleContextMenu);
    return () => {
      canvasEl.removeEventListener('mousedown', handleNativeMouseDown);
      canvasEl.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('mouseleave', handleMouseLeave);
      canvasEl.removeEventListener('contextmenu', handleContextMenu);
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
        case 'Space':
          setKeys({ jump: pressed });
          break;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    const onBlur = () =>
      setKeys({ forward: false, backward: false, left: false, right: false, run: false, jump: false });

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [setKeys]);

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
