'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Experience } from './Experience';
import { Loader } from '@react-three/drei';

export function Scene() {
    return (
        <div className="fixed inset-0 z-0">
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{ antialias: true }}
                camera={{ position: [0, 5, 10], fov: 50 }}
            >
                <Suspense fallback={null}>
                    <Experience />
                </Suspense>
            </Canvas>
            <Loader />
        </div>
    );
}
