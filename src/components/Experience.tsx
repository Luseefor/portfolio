'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useScroll, ScrollControls, Sky, Stars } from '@react-three/drei';
import { useStore } from '@/utils/store';
import { MotherboardCity } from './MotherboardCity';
import { CameraRig } from './CameraRig';
import { WindStreaks } from './WindStreaks';
import { cityCurve } from '@/utils/curve';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';

function KeyboardScroll() {
    const scroll = useScroll();
    const setLane = useStore((state) => state.setLane);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const speed = 150 * scroll.pages; // Adaptive scroll speed
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                scroll.el.scrollTop -= 100;
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                scroll.el.scrollTop += 100;
            } else if (e.key === 'a' || e.key === 'A') {
                setLane(-1);
            } else if (e.key === 'd' || e.key === 'D') {
                setLane(1);
            } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
                scroll.el.scrollTop -= window.innerHeight * 0.8;
            } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
                scroll.el.scrollTop += window.innerHeight * 0.8;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scroll]);
    return null;
}

function ExperienceContent() {
    return (
        <>
            <KeyboardScroll />
            {/* Daytime Lighting */}
            <ambientLight intensity={0.4} color="#ffffff" />
            <directionalLight
                position={[100, 100, 50]}
                intensity={2.5}
                color="#fffaf0"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            {/* Hemisphere light for natural sky/ground gradient */}
            <hemisphereLight
                args={['#87CEEB', '#2d4a35', 0.6]}
            />

            {/* The City & Road */}
            <MotherboardCity />

            {/* Driving Logic */}
            <CameraRig curve={cityCurve} />

            {/* Particles */}
            <WindStreaks />

            {/* Post Processing */}
            <EffectComposer enableNormalPass={false}>
                <Bloom
                    luminanceThreshold={1.2}
                    mipmapBlur
                    intensity={0.4}
                    radius={0.3}
                />
                <Vignette eskil={false} offset={0.1} darkness={0.5} />
            </EffectComposer>
        </>
    );
}

export function Experience() {
    return (
        <>
            {/* Cinematic Atmosphere */}
            <Sky
                distance={450000}
                sunPosition={[100, 20, 100]}
                inclination={0}
                azimuth={0.25}
            />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <color attach="background" args={['#87CEEB']} />
            <fog attach="fog" args={['#c8e6ff', 1, 1500]} />

            {/* Ground Plane: Massive to fill the horizon */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[20000, 20000]} />
                <meshStandardMaterial color="#1a2d1e" roughness={1} metalness={0} />
            </mesh>

            {/* SCROLL CONTROLS: Journey cut by half */}
            <ScrollControls
                pages={25}     // Reduced from 50
                damping={0.6}  // Buttery smooth feel
                infinite={false}
            >
                <ExperienceContent />
            </ScrollControls>
        </>
    );
}
