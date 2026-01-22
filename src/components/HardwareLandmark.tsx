'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GraphicsCard, RamStick, Microchip, CoolingFan } from './HardwareAssets';
import { mapScrollToCurve } from '@/utils/curve';

interface Section {
    id: string;
    title: string;
    description: string;
    details: string[];
    asset: 'gpu' | 'ram' | 'cpu' | 'fan';
    t: number;
}

const SECTIONS: Section[] = [
    {
        id: 'bio',
        title: 'Graphics Processing',
        description: 'Who am I?',
        details: ['Passionate Full-Stack Developer', '3D Web Pioneer', 'AI Enthusiast'],
        asset: 'gpu',
        t: 0.25,
    },
    {
        id: 'education',
        title: 'Memory Module',
        description: 'Education & Research',
        details: ['BS in Computer Engineering', 'Focus on Hardware-Software Co-design', 'Specialized in High-Perf Architecture'],
        asset: 'ram',
        t: 0.45,
    },
    {
        id: 'skills',
        title: 'Central Processing',
        description: 'Technical Toolkit',
        details: ['React / Next.js / TypeScript', 'Three.js / WebGL / Shaders', 'Node.js / Python / Rust'],
        asset: 'cpu',
        t: 0.7,
    },
    {
        id: 'projects',
        title: 'Thermal Management',
        description: 'Dynamic Solutions',
        details: ['Hardware-Accelerated Web Apps', 'Interactive 3D Visualizations', 'Scalable AI Architectures'],
        asset: 'fan',
        t: 0.9,
    }
];

export function HardwareLandmarks({ curve }: { curve: THREE.CatmullRomCurve3 }) {
    return (
        <group>
            {SECTIONS.map((section) => (
                <HardwareLandmark key={section.id} section={section} curve={curve} />
            ))}
        </group>
    );
}

function HardwareLandmark({ section, curve }: { section: Section, curve: THREE.CatmullRomCurve3 }) {
    const scroll = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    const { position, rotation } = useMemo(() => {
        const p = curve.getPointAt(section.t);
        const tan = curve.getTangentAt(section.t).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x);
        // SIDEBANKED Landmarks: Pushed far back to sit behind sidewalks (Concrete/Asphalt logic)
        const sidePos = p.clone().add(norm.multiplyScalar(40));
        const angle = Math.atan2(tan.x, tan.z) + Math.PI / 2;
        return { position: sidePos, rotation: new THREE.Euler(0, angle, 0) };
    }, [section.t, curve]);

    useFrame(() => {
        const currentT = mapScrollToCurve(scroll.offset);
        const proximity = Math.abs(currentT - section.t);

        const threshold = 0.08;
        if (proximity < threshold) {
            if (!isVisible) setIsVisible(true);
        } else {
            if (isVisible) setIsVisible(false);
        }
    });

    return (
        <group position={position} rotation={rotation}>
            {section.asset === 'gpu' && <GraphicsCard position={[0, 0, 0]} scale={2.5} />}
            {section.asset === 'ram' && <RamStick position={[0, 0, 0]} scale={2} color="#00ffff" />}
            {section.asset === 'cpu' && <Microchip position={[0, 0, 0]} scale={3.5} />}
            {section.asset === 'fan' && <CoolingFan position={[0, 0, 0]} scale={3} />}

            <FallingScreen isVisible={isVisible} section={section} />
        </group>
    );
}

function FallingScreen({ isVisible, section }: { isVisible: boolean, section: Section }) {
    const groupRef = useRef<THREE.Group>(null!);
    const opacityRef = useRef(0);

    useFrame((state, delta) => {
        const targetY = isVisible ? 6 : 60;
        const targetOpacity = isVisible ? 1 : 0;

        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
        opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, targetOpacity, 0.1);
    });

    return (
        <group ref={groupRef} position={[-35, 60, 0]}>
            <mesh>
                <boxGeometry args={[14, 10, 0.2]} />
                <meshStandardMaterial
                    color="#000"
                    transparent
                    opacity={0.85}
                    roughness={0.05}
                    metalness={0.95}
                />
            </mesh>

            <mesh position={[0, 0, 0.11]}>
                <boxGeometry args={[14.3, 10.3, 0.05]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.4} toneMapped={false} />
            </mesh>

            <Html
                transform
                distanceFactor={10}
                position={[0, 0, 0.15]}
                className="pointer-events-none select-none"
            >
                <div
                    style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s' }}
                    className="flex flex-col items-center justify-center text-white w-[800px] h-[600px] p-12 border border-cyan-500/40 bg-black/60 backdrop-blur-3xl rounded-3xl"
                >
                    <div className="mb-4 flex items-center gap-4 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-6 py-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-xs font-black tracking-[0.3em] uppercase text-cyan-400">Section Loaded</span>
                    </div>

                    <h2 className="text-6xl font-black tracking-tighter uppercase text-white mb-2 drop-shadow-2xl">
                        {section.title}
                    </h2>
                    <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-10">
                        {section.description}
                    </p>

                    <div className="w-full flex flex-col gap-4">
                        {section.details.map((detail, i) => (
                            <div key={i} className="flex items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                                <div className="h-4 w-4 rounded-sm rotate-45 border-2 border-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                                <span className="text-2xl font-bold tracking-tight uppercase text-white/90">{detail}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-xs font-bold text-cyan-500/60 tracking-widest uppercase animate-bounce">
                        Continue Scrolling to proceed
                    </div>
                </div>
            </Html>
        </group>
    );
}
