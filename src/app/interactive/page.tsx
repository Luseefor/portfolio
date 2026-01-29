'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';

function PlaceholderScene() {
  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 12, 6]} intensity={1} />
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#cbd5f5" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

export default function InteractivePage() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousMargin = document.body.style.margin;
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.margin = previousMargin;
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0b0f1a] text-white">
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <PlaceholderScene />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute bottom-6 left-6 text-xs uppercase tracking-[0.3em] text-white/60">
        Dungeon scene placeholder
      </div>
    </main>
  );
}
