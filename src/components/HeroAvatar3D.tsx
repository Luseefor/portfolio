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
            <Sphere ref={meshRef} args={[1.4, 64, 64]} scale={1.3}>
                <MeshDistortMaterial
                    color="#00f0ff"
                    emissive="#000000"
                    roughness={0.1}
                    metalness={1}
                    distort={0.4}
                    speed={2}
                    wireframe={true} // Cyberpunk wireframe feel matching the old core
                />
            </Sphere>
            {/* Inner Core Glow */}
            <Sphere args={[1.0, 32, 32]}>
                <meshBasicMaterial color="white" wireframe transparent opacity={0.1} />
            </Sphere>
        </Float>
    );
};

export default function HeroAvatar3D() {
    return (
        <div className="w-[250px] h-[250px] mx-auto mb-4 relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -5]} intensity={1} color="#00f0ff" />

                <HolographicAvatar />
            </Canvas>
        </div>
    );
}
