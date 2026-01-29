'use client';

import { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import LoadingScreen from '@/components/interactive/LoadingScreen';
import DungeonScene from '@/components/dungeon/DungeonScene';
import { rendererToneMapping } from '@/constants/scene';
import { useDungeonInput } from '@/lib/dungeonInput';

export default function InteractiveCanvas() {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const setHasFocus = useDungeonInput((state) => state.setHasFocus);
  const setPointerLocked = useDungeonInput((state) => state.setPointerLocked);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    canvas.focus();
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  }, []);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, [setHasFocus]);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
  }, [setHasFocus]);

  useEffect(() => {
    if (!canvasEl) return;
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvasEl;
      setPointerLocked(isLocked);
      if (isLocked) {
        setHasFocus(true);
      } else if (document.activeElement !== canvasEl) {
        setHasFocus(false);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, [canvasEl, setHasFocus, setPointerLocked]);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 4, 10] }}
        onCreated={({ gl }) => {
          // Note: physicallyCorrectLights is deprecated in Three.js r155+
          // Modern Three.js uses physically correct lighting by default
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = rendererToneMapping.exposure;
          setCanvasEl(gl.domElement);
        }}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <DungeonScene />
      </Canvas>
      <LoadingScreen />
    </div>
  );
}
