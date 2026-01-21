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

    const roadTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Background: Asphalt
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, 512, 512);

            // Center Line (Dashed)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4; // Thin line
            ctx.setLineDash([20, 30]); // Dash pattern
            ctx.beginPath();
            ctx.moveTo(256, 0);
            ctx.lineTo(256, 512);
            ctx.stroke();

            // Border Lines (Solid)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.setLineDash([]); // Solid
            // Left
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(20, 512);
            ctx.stroke();
            // Right
            ctx.beginPath();
            ctx.moveTo(492, 0);
            ctx.lineTo(492, 512);
            ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        // Repeat texture many times along the length (Y-axis of texture maps to U or V depending on tube unwrap)
        tex.repeat.set(1, 400);
        tex.anisotropy = 16;
        return tex;
    }, []);

    return (
        <group>
            {/* THE ROAD: Black Asphalt with Markings */}
            {/* 
                CRITICAL FIX: Do NOT scale X/Z. Use scale 1 to keep road spine aligned with car path.
                We widen the road by increasing the TubeGeometry radius instead.
            */}
            <mesh name="road" position={[0, 0, 0]} scale={[1, 0.05, 1]}>
                {/* Visual Curve (Y scaled 20x), Segments 1000, Radius 9 (Wider), RadialSegs 12, Closed false */}
                <tubeGeometry args={[visualCurve, 1000, 9, 12, false]} />
                <meshStandardMaterial
                    map={roadTexture}
                    color="#ffffff" // Tint white so texture color shows true
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>
        </group>
    );
}
