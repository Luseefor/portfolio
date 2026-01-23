'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/utils/store';
import { motion } from 'framer-motion';
import { GraphicsCard, RamStick, Microchip, CoolingFan } from './HardwareAssets';

interface HardwareProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    title: string;
    content: string;
    type: 'gpu' | 'ram' | 'cpu' | 'fan';
    color?: string;
    scale?: number;
}

export function InteractiveHardware({
    position,
    rotation = [0, 0, 0],
    title,
    content,
    type,
    color = "#00ffff",
    scale = 8 // Default HUGE scale
}: HardwareProps) {
    const setNpcDialogue = useStore((state) => state.setNpcDialogue);
    const [hovered, setHovered] = useState(false);
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            // Very slow, solid floating
            groupRef.current.position.y = position[1] + Math.sin(t * 0.3) * 0.1;
        }
    });

    return (
        <group position={position} rotation={rotation}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                <group
                    ref={groupRef}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setNpcDialogue({ title, content });
                    }}
                >
                    {/* The Hardware Component */}
                    <group scale={scale}>
                        {type === 'gpu' && <GraphicsCard position={[0, 0, 0]} />}
                        {type === 'ram' && <RamStick position={[0, 0, 0]} color={color} />}
                        {type === 'cpu' && <Microchip position={[0, 0, 0]} />}
                        {type === 'fan' && <CoolingFan position={[0, 0, 0]} />}
                    </group>

                    {/* Exclamation Mark - Optimized for integrated scales */}
                    <group position={[0, scale * 1.8, 0]}>
                        <Html center distanceFactor={15}>
                            <div className="flex flex-col items-center select-none pointer-events-none">
                                <motion.div
                                    className="w-4 h-12 bg-[#00ffff] rounded-full shadow-[0_0_20px_#00ffff]"
                                    animate={{
                                        y: [0, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 2.0,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        backgroundColor: color,
                                        boxShadow: `0 0 40px ${color}`
                                    }}
                                />
                                <div
                                    className="w-4 h-4 mt-2 bg-[#00ffff] rounded-full shadow-[0_0_20px_#00ffff]"
                                    style={{
                                        backgroundColor: color,
                                        boxShadow: `0 0 20px ${color}`
                                    }}
                                />
                            </div>
                        </Html>
                    </group>

                    {/* Selection Glow Plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                        <planeGeometry args={[scale * 2, scale * 2]} />
                        <meshBasicMaterial
                            color={color}
                            transparent
                            opacity={hovered ? 0.3 : 0.1}
                        />
                    </mesh>
                </group>
            </Float>
        </group>
    );
}
