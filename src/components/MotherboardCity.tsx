'use client';

import { cityCurve as curve } from '@/utils/curve';

export function MotherboardCity() {

    // Minimalist: Only the Road

    return (
        <group>
            {/* THE ROAD: Black Asphalt */}
            {/* Wider Road: Radius 6 instead of 3 */}
            <mesh position={[0, -1, 0]} scale={[1, 0.05, 1]}>
                <tubeGeometry args={[curve, 800, 6, 12, false]} /> {/* Increased segments for smoothness */}
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>
        </group>
    );
}
