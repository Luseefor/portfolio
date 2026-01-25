'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const HolographicAvatar = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Constant rotation
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={[1.5, 1.5, 0.1]}>
                <MeshDistortMaterial
                    color="#00f0ff"
                    emissive="#06b6d4"
                    emissiveIntensity={0.2}
                    roughness={0.1}
                    metalness={1}
                    distort={0.4}
                    speed={2}
                    wireframe={true}
                />
            </Sphere>
            {/* Inner Core Glow */}
            <Sphere args={[1.0, 32, 32]} scale={[1.2, 1.2, 0.1]}>
                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
            </Sphere>
        </Float>
    );
};

export default function HeroAvatar3D() {
    return (
        <div className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] mx-auto relative">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -5]} intensity={1} color="#00f0ff" />

                <HolographicAvatar />
            </Canvas>
        </div>
    );
}
