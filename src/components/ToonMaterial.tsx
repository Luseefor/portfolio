'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { Outlines } from '@react-three/drei';

interface ToonMaterialProps {
    color: string | THREE.Color;
    emissive?: string | THREE.Color;
    emissiveIntensity?: number;
    outlineColor?: string | THREE.Color;
    outlineThickness?: number;
    transparent?: boolean;
    opacity?: number;
    side?: THREE.Side;
}

export function ToonMaterial({
    color,
    emissive = '#000000',
    emissiveIntensity = 0,
    outlineColor = '#000000',
    outlineThickness = 0.1,
    transparent = false,
    opacity = 1,
    side,
}: ToonMaterialProps) {

    // Generate a 3-step gradient map for cel-shading
    const gradientMap = useMemo(() => {
        if (typeof document === 'undefined') return null;

        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 1;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createLinearGradient(0, 0, 4, 0);
            // 3 steps: Shadow (dark), Mid (base), Highlight (light)
            gradient.addColorStop(0.0, '#444444'); // Shadow
            gradient.addColorStop(0.5, '#888888'); // Mid
            gradient.addColorStop(1.0, '#ffffff'); // Highlight
            context.fillStyle = gradient;
            context.fillRect(0, 0, 4, 1);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        return texture;
    }, []);

    return (
        <>
            <meshToonMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                gradientMap={gradientMap}
                transparent={transparent}
                opacity={opacity}
                side={side}
            />
            {/* Inverted Hull Outline */}
            <Outlines thickness={outlineThickness} color={outlineColor} />
        </>
    );
}
