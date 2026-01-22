'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll, ScrollControls, Sky, Stars, Grid } from '@react-three/drei';
import { useStore } from '@/utils/store';
import { MotherboardCity } from './MotherboardCity';
import { CameraRig } from './CameraRig';
import { WindStreaks } from './WindStreaks';
import { HardwareLandmarks } from './HardwareLandmark';
import { cityCurve } from '@/utils/curve';
import { EffectComposer, Bloom, Vignette, Scanline, Noise } from '@react-three/postprocessing';

import { PCBShader } from '@/utils/PCBShader';

function KeyboardScroll() {
    const scroll = useScroll();
    const setLane = useStore((state) => state.setLane);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                scroll.el.scrollTop -= 100;
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                scroll.el.scrollTop += 100;
            } else if (e.key === 'a' || e.key === 'A') {
                setLane(-1);
            } else if (e.key === 'd' || e.key === 'D') {
                setLane(1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scroll, setLane]);
    return null;
}

function ExperienceContent() {
    useFrame((state) => {
        if (PCBShader.uniforms) {
            PCBShader.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <>
            <KeyboardScroll />
            <MotherboardCity />
            <HardwareLandmarks curve={cityCurve} />
            <CameraRig curve={cityCurve} />
            <WindStreaks />

            <EffectComposer enableNormalPass={false}>
                <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
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
            <group>
                <color attach="background" args={['#020502']} />
                <fog attach="fog" args={['#020402', 1, 250]} />

                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* THE LIVING PCB GROUND */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                    <planeGeometry args={[2000, 2000]} />
                    <shaderMaterial
                        attach="material"
                        args={[PCBShader]}
                        transparent
                    />
                </mesh>
            </group>

            <ScrollControls pages={25} damping={0.6} infinite={false}>
                <ExperienceContent />
            </ScrollControls>
        </>
    );
}
