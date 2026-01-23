'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll, ScrollControls, Stars } from '@react-three/drei';
import { useStore } from '@/utils/store';
import { MotherboardCity } from './MotherboardCity';
import { CameraRig } from './CameraRig';
import { WindStreaks } from './WindStreaks';
import { InteractiveHardware } from './InteractiveHardware';
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

function HardwareInteractions() {
    const componentPositions = useMemo(() => {
        const data = [
            {
                t: 0.12,
                offset: 18,
                type: 'gpu' as const,
                title: "The Architect / GPU Node",
                content: "I designed the structural integrity of this motherboard. Every trace is a neural pathway into Rijan's creative logic.",
                color: "#e11d48", // Crimson
                scale: 2.5
            },
            {
                t: 0.38,
                offset: -18,
                type: 'ram' as const,
                title: "Data Guardian / RAM Module",
                content: "Processing gigabytes of creative vision... Rijan's attention to detail is stored in my high-speed cache.",
                color: "#db2777", // Pink
                scale: 3.5
            },
            {
                t: 0.65,
                offset: 20,
                type: 'cpu' as const,
                title: "Core Processor / CPU Hub",
                content: "BEEP... Rijan's technical skills are operating at peak frequency. Overclocking imminent.",
                color: "#2563eb", // Blue
                scale: 2.8
            },
            {
                t: 0.88,
                offset: -20,
                type: 'fan' as const,
                title: "Cooling Specialist / Thermal Unit",
                content: "My fans keep the hardware cool while Rijan's projects heat up. Stability is our primary protocol.",
                color: "#16a34a", // Green
                scale: 3.0
            }
        ];

        return data.map(d => {
            const p = cityCurve.getPointAt(d.t);
            const tan = cityCurve.getTangentAt(d.t).normalize();
            const norm = new THREE.Vector3(-tan.z, 0, tan.x);
            const pos = p.clone().add(norm.multiplyScalar(d.offset));
            const angle = Math.atan2(tan.x, tan.z);
            return { ...d, pos: [pos.x, 0, pos.z] as [number, number, number], rotation: [0, angle + Math.PI / 2, 0] as [number, number, number] };
        });
    }, []);

    return (
        <group>
            {componentPositions.map((comp, i) => (
                <InteractiveHardware
                    key={i}
                    position={comp.pos}
                    rotation={comp.rotation}
                    title={comp.title}
                    content={comp.content}
                    type={comp.type}
                    color={comp.color}
                    scale={comp.scale}
                />
            ))}
        </group>
    );
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
            <HardwareInteractions />
            <MotherboardCity />
            <CameraRig curve={cityCurve} />
            <WindStreaks />

            <EffectComposer enableNormalPass={false}>
                <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
                <Vignette eskil={false} offset={0.1} darkness={0.8} />
            </EffectComposer>
        </>
    );
}

function MovingPCB() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (meshRef.current) {
            // Ground follows the camera to stay visible infinitely
            meshRef.current.position.x = state.camera.position.x;
            meshRef.current.position.z = state.camera.position.z;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[2000, 2000]} />
            <shaderMaterial
                attach="material"
                args={[PCBShader]}
                transparent
            />
        </mesh>
    );
}

export function Experience() {
    return (
        <>
            <group>
                <color attach="background" args={['#000100']} />
                <fog attach="fog" args={['#000100', 100, 350]} />

                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />

                <Stars
                    radius={200}
                    depth={100}
                    count={8000}
                    factor={7}
                    saturation={0.5}
                    fade
                    speed={0.2}
                />

                <MovingPCB />
            </group>

            <ScrollControls pages={25} damping={0.85} infinite={false}>
                <ExperienceContent />
            </ScrollControls>
        </>
    );
}
