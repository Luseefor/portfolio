'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance, useScroll } from '@react-three/drei';
import * as THREE from 'three';

export function WindStreaks() {
    const scroll = useScroll();
    const ref = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame((state, delta) => {
        if (!ref.current || !materialRef.current) return;

        // Calculate speed based on scroll delta
        // This is approximate; useScroll().delta gives per-frame delta
        const speed = scroll.delta * 100;

        // Opacity increases with speed
        materialRef.current.opacity = THREE.MathUtils.lerp(
            materialRef.current.opacity,
            Math.min(speed * 2, 0.5), // Cap at 0.5 opacity
            0.1
        );

        // If speed is low, hide
        ref.current.visible = materialRef.current.opacity > 0.01;

        // Animate particles past the camera if visible
        // For simplicity in this demo, just rotating the group or z-scrolling texture is easier,
        // but moving instances is "cooler". 
        // Let's just create a static 'tunnel' of lines that fades in.
    });

    return (
        <group ref={ref}>
            <Instances range={100}>
                <boxGeometry args={[0.1, 0.1, 5]} />
                <meshBasicMaterial
                    ref={materialRef}
                    color="white"
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                />

                {Array.from({ length: 50 }).map((_, i) => (
                    <Instance
                        key={i}
                        position={[
                            (Math.random() - 0.5) * 40, // Random X around camera
                            (Math.random() - 0.5) * 40, // Random Y
                            (Math.random() - 0.5) * 40 - 20 // Random Z ahead/behind
                        ]}
                        rotation={[0, 0, Math.random() * Math.PI]}
                    />
                ))}
            </Instances>
        </group>
    );
}
