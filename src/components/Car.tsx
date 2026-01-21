'use client';

import { ToonMaterial } from './ToonMaterial';
import { Outlines } from '@react-three/drei';

export function Car() {
    return (
        <group>
            {/* Body */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 0.5, 2]} />
                <ToonMaterial color="#ff0055" outlineColor="black" />
            </mesh>
            {/* Cabin */}
            <mesh position={[0, 0.8, -0.2]}>
                <boxGeometry args={[0.8, 0.4, 1]} />
                <ToonMaterial color="#00ffff" outlineColor="black" />
            </mesh>
            {/* Wheels */}
            <mesh position={[0.6, 0.25, 0.6]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[-0.6, 0.25, 0.6]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.6, 0.25, -0.6]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[-0.6, 0.25, -0.6]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>

            {/* Headlights - glowing */}
            <mesh position={[0.3, 0.5, 1.01]}>
                <planeGeometry args={[0.2, 0.1]} />
                <meshBasicMaterial color="#ccffcc" />
            </mesh>
            <mesh position={[-0.3, 0.5, 1.01]}>
                <planeGeometry args={[0.2, 0.1]} />
                <meshBasicMaterial color="#ccffcc" />
            </mesh>
        </group>
    );
}
