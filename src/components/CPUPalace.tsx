'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ToonMaterial } from './ToonMaterial';
import { ChatInterface } from './ChatInterface';

export function CPUPalace({ position }: { position: [number, number, number] }) {
    const lidRef = useRef<THREE.Group>(null);
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        if (!lidRef.current) return;

        // Toggle state
        setIsOpen(!isOpen);

        // Animate Lid
        gsap.to(lidRef.current.rotation, {
            x: !isOpen ? -Math.PI / 1.5 : 0, // Open to ~120 degrees
            duration: 1,
            ease: 'power2.inOut',
        });
    };

    return (
        <group position={position} onClick={toggleOpen}>
            {/* Base */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[10, 2, 10]} />
                <ToonMaterial color="#333" outlineColor="cyan" />
            </mesh>

            {/* The Core (Glowing Orb inside) */}
            <mesh position={[0, 2, 0]}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#00ffff" />
                <pointLight intensity={2} color="#00ffff" distance={10} />

                {/* Chatbot Overlay - Visible only when found/opened? 
            For now always there but hidden by lid until opened.
        */}
                {/* Chatbot Overlay */}
                <ChatInterface />
            </mesh>

            {/* The Lid (Hinged) */}
            {/* Hinge point should be at the back edge */}
            <group position={[0, 1, -5]} ref={lidRef}>
                <mesh position={[0, 0, 5]}> {/* Offset mesh to pivot around group origin */}
                    <boxGeometry args={[10, 0.5, 10]} />
                    <ToonMaterial color="#444" outlineColor="cyan" />
                    {/* CPU Logo/Text decal could go here */}
                </mesh>
            </group>
        </group>
    );
}
