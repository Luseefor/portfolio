'use client';

import * as THREE from 'three';
import { cityCurve } from '@/utils/curve';
import { useMemo } from 'react';

export function MotherboardCity() {

    // STRATEGY:
    // 1. We want the visual road to look flat (Asphalt Ribbon).
    //    - Best way is TubeGeometry with scale=[1, 0.05, 1] (flattens the tube).
    // 2. We want Elevation (Hills).
    //    - If we scale the mesh Y by 0.05, we kill the hills (Y=20 becomes Y=1).
    // 3. FIX: Create a 'visualCurve' with Y values multiplied by 20.
    //    - (Y * 20) * 0.05 scale = Y (Original Height).
    //    - This preserves the Hills while flattening the Tube cross-section.

    const visualCurve = useMemo(() => {
        const c = cityCurve.clone();
        c.points.forEach(p => {
            p.y *= 20; // Inverse of 0.05 scale
        });
        return c;
    }, []);

    return (
        <group>
            {/* THE ROAD: Black Asphalt */}
            <mesh name="road" position={[0, 0, 0]} scale={[1, 0.05, 1]}>
                <tubeGeometry args={[visualCurve, 1000, 6, 12, false]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>
        </group>
    );
}
