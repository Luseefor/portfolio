'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Scene from '@/components/Scene';

export default function CanvasRoot() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 55, near: 0.1, far: 600, position: [0, 6, 18] }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <LoadingScreen />
    </div>
  );
}
