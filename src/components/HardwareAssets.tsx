'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ToonMaterial } from './ToonMaterial';
import { Outlines } from '@react-three/drei';
import * as THREE from 'three';

// 1. RAM STICK
export function RamStick({ position, rotation, scale = 1, color = "#ff0055" }: { position: [number, number, number], rotation?: [number, number, number], scale?: number, color?: string }) {
    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            {/* PCB Board */}
            <mesh position={[0, 5, 0]}>
                <boxGeometry args={[0.5, 10, 4]} />
                <ToonMaterial color="#222" outlineColor="black" />
            </mesh>

            {/* Gold Pins */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.55, 1, 3.8]} />
                <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.8} />
            </mesh>

            {/* Heatsink Body */}
            <mesh position={[0, 6, 0]}>
                <boxGeometry args={[0.6, 9, 3.8]} />
                <ToonMaterial color={color} emissive={color} emissiveIntensity={0.2} outlineColor="black" />
            </mesh>

            {/* Heatsink Teeth/Serrations */}
            {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={i} position={[0.35, 3 + i * 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.4, 0.4, 3.8]} />
                    <ToonMaterial color={color} outlineColor="black" />
                </mesh>
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={i} position={[-0.35, 3 + i * 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.4, 0.4, 3.8]} />
                    <ToonMaterial color={color} outlineColor="black" />
                </mesh>
            ))}
        </group>
    );
}

// 2. CAPACITOR
export function Capacitor({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    return (
        <group position={position} scale={scale}>
            {/* Body */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 3, 16]} />
                <ToonMaterial color="#444" outlineColor="black" />
            </mesh>
            {/* Stripe */}
            <mesh position={[0.81, 1.5, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.1, 2.8, 0.5]} />
                <ToonMaterial color="#gold" />
            </mesh>
            {/* Top Cap (Silver with Vent) */}
            <mesh position={[0, 3.01, 0]}>
                <cylinderGeometry args={[0.7, 0.7, 0.05, 16]} />
                <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Cross Vent */}
            <mesh position={[0, 3.02, 0]}>
                <boxGeometry args={[1, 0.05, 0.1]} />
                <meshBasicMaterial color="#999" />
            </mesh>
            <mesh position={[0, 3.02, 0]}>
                <boxGeometry args={[0.1, 0.05, 1]} />
                <meshBasicMaterial color="#999" />
            </mesh>
        </group>
    );
}

// 3. MICROCHIP
export function Microchip({ position, scale = 1, rotation }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            {/* Body */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[4, 1, 4]} />
                <ToonMaterial color="#111" outlineColor="#333" />
            </mesh>

            {/* Legs */}
            {Array.from({ length: 6 }).map((_, i) => (
                <group key={i}>
                    {/* Side 1 */}
                    <mesh position={[-2.1, 0.2, -1.5 + i * 0.6]}>
                        <boxGeometry args={[0.4, 0.4, 0.2]} />
                        <meshStandardMaterial color="#ccc" metalness={0.9} />
                    </mesh>
                    {/* Side 2 */}
                    <mesh position={[2.1, 0.2, -1.5 + i * 0.6]}>
                        <boxGeometry args={[0.4, 0.4, 0.2]} />
                        <meshStandardMaterial color="#ccc" metalness={0.9} />
                    </mesh>
                </group>
            ))}

            {/* Label / Logo */}
            <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2, 2]} />
                <ToonMaterial color="#333" />
            </mesh>
            {/* Orientation Dot */}
            <mesh position={[-1.5, 1.02, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.2, 16]} />
                <meshBasicMaterial color="#555" />
            </mesh>
        </group>
    );
}

// 4. COOLING FAN
export function CoolingFan({ position, scale = 1, rotation }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    const bladeRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (bladeRef.current) {
            bladeRef.current.rotation.y += delta * 10; // Spin
        }
    });

    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            {/* Frame */}
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[2.5, 2.5, 2, 32, 1, true]} />
                <ToonMaterial color="#222" side={THREE.DoubleSide} outlineColor="black" />
            </mesh>

            {/* Blades */}
            <mesh position={[0, 1, 0]} ref={bladeRef}>
                <cylinderGeometry args={[0.5, 0.5, 0.5, 8]} />
                <meshStandardMaterial color="#333" />
                {/* Actual blades */}
                {Array.from({ length: 7 }).map((_, i) => (
                    <mesh key={i} position={[0, 0, 0]} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
                        <boxGeometry args={[2, 0.1, 0.5]} />
                        <meshStandardMaterial color="#444" />
                    </mesh>
                ))}
            </mesh>

            {/* RGB Ring */}
            <mesh position={[0, 2.01, 0]}>
                <ringGeometry args={[2.2, 2.5, 32]} />
                <meshBasicMaterial color="#00ffff" toneMapped={false} />
                <pointLight distance={5} intensity={1} color="#00ffff" />
            </mesh>
        </group>
    );
}
