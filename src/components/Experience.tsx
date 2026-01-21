'use client';

import React from 'react';
import { ScrollControls } from '@react-three/drei';
import { MotherboardCity } from './MotherboardCity';
import { CameraRig } from './CameraRig';
import { WindStreaks } from './WindStreaks';
import { cityCurve } from '@/utils/curve';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function ExperienceContent() {
    return (
        <>
            {/* Daytime Lighting */}
            <ambientLight intensity={0.6} color="#ffffff" />
            <directionalLight
                position={[50, 100, 30]}
                intensity={2}
                color="#fffaf0"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            {/* Hemisphere light for natural sky/ground gradient */}
            <hemisphereLight
                args={['#87CEEB', '#8B7355', 0.8]}
            />

            {/* The City & Road */}
            <MotherboardCity />

            {/* Driving Logic */}
            <CameraRig curve={cityCurve} />

            {/* Particles */}
            <WindStreaks />

            {/* Post Processing */}
            <EffectComposer>
                <Bloom
                    luminanceThreshold={1}
                    mipmapBlur
                    intensity={0.5}
                    radius={0.4}
                />
            </EffectComposer>
        </>
    );
}

export function Experience() {
    return (
        <>
            {/* Daytime Sky Background */}
            <color attach="background" args={['#87CEEB']} />
            <fogExp2 attach="fog" args={['#c8e6ff', 0.008]} />

            {/* Ground Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#4a7c59" />
            </mesh>

            {/* SCROLL CONTROLS: Longer duration for extended path */}
            {/* Damping 0.5 for smoother "floaty" feel */}
            <ScrollControls pages={20} damping={0.5}>
                <ExperienceContent />
                <InvertedControls />
            </ScrollControls>
        </>
    );
}

function InvertedControls() {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Invert Arrow Keys: 
            // Up Arrow -> Scroll Down (Forward)
            // Down Arrow -> Scroll Up (Backward)

            const scrollAmount = 50; // Step size

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                window.scrollBy({ top: scrollAmount, behavior: 'auto' }); // 'auto' allows damping to handle smoothing
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                window.scrollBy({ top: -scrollAmount, behavior: 'auto' });
            }
        };

        window.addEventListener('keydown', handleKeyDown, { passive: false });
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    return null;
}
