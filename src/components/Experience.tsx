'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useScroll, ScrollControls, Sky, Stars, Grid } from '@react-three/drei';
import { useStore } from '@/utils/store';
import { MotherboardCity } from './MotherboardCity';
import { CameraRig } from './CameraRig';
import { WindStreaks } from './WindStreaks';
import { HardwareLandmarks } from './HardwareLandmark';
import { cityCurve } from '@/utils/curve';
import { EffectComposer, Bloom, Vignette, Scanline, Noise } from '@react-three/postprocessing';

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

            {/* The City & Road */}
            <MotherboardCity />
            <HardwareLandmarks curve={cityCurve} />
            <CameraRig curve={cityCurve} />

            {/* Particles */}
            <WindStreaks />

            {/* Post Processing: Stable Cinematic Glow */}
            <EffectComposer enableNormalPass={false}>
                <Bloom
                    intensity={1.5}
                    luminanceThreshold={0.2}
                    luminanceSmoothing={0.9}
                    mipmapBlur
                />
                <Scanline opacity={0.05} />
                <Noise opacity={0.03} />
                <Vignette eskil={false} offset={0.1} darkness={0.8} />
            </EffectComposer>
        </>
    );
}

export function Experience() {
    return (
        <>
            {/* Cinematic Atmosphere */}
            <group>
                <color attach="background" args={['#020205']} />
                <fog attach="fog" args={['#02040a', 1, 300]} />

                <ambientLight intensity={0.2} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={0.5}
                    color="#ffffff"
                />

                {/* Stars for a high-end night feel */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Expanded Ground Plane with Motherboard Grid */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                    <planeGeometry args={[20000, 20000]} />
                    <meshStandardMaterial color="#010201" roughness={1} metalness={0} />
                </mesh>
                <Grid
                    infiniteGrid
                    fadeDistance={150}
                    fadeStrength={10}
                    cellSize={1}
                    sectionSize={10}
                    sectionColor="#004444"
                    sectionThickness={1}
                    cellColor="#001111"
                    cellThickness={0.5}
                    position={[0, -0.08, 0]}
                />
            </group>

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
