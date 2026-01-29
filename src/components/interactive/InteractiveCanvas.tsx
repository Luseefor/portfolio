'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ACESFilmicToneMapping } from 'three';
import LoadingScreen from '@/components/interactive/LoadingScreen';
import DungeonScene from '@/components/dungeon/DungeonScene';
import { rendererToneMapping } from '@/constants/scene';

export default function InteractiveCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 4, 10] }}
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = rendererToneMapping.exposure;
        }}
      >
        <Suspense fallback={null}>
          <DungeonScene />
        </Suspense>
      </Canvas>
      <LoadingScreen />
    </div>
  );
}
