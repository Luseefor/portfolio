'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ToonMaterial } from './ToonMaterial';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

import { useScroll } from '@react-three/drei';

function ExhaustSmoke() {
    const scroll = useScroll();
    const particles = useMemo(() => {
        return new Array(60).fill(0).map(() => ({
            ref: React.createRef<THREE.Mesh>(),
            offset: Math.random() * 10,
            baseSpeed: 1.0 + Math.random() * 1.0 // Faster
        }));
    }, []);

    useFrame((state, delta) => {
        // Continuous emission logic
        particles.forEach((p, i) => {
            if (p.ref.current) {
                // Cycle based on index to create stream
                const time = state.clock.elapsedTime * p.baseSpeed + p.offset + (i * 0.1);
                const t = time % 1.5; // Faster cycle (1.5s life)

                // Emitting from -Z (Rear)
                // Start at -2.2, Move back to -8
                p.ref.current.position.z = -2.2 - t * 8;
                // Rise slightly
                p.ref.current.position.y = 0.3 + t * 0.5 + Math.sin(time * 5) * 0.1;

                // Grow
                p.ref.current.scale.setScalar(0.1 + t * 0.5);

                // Opacity fade (requires transparent material)
                if (p.ref.current.material instanceof THREE.MeshBasicMaterial) {
                    p.ref.current.material.opacity = Math.max(0, 0.8 * (1 - t / 1.5));
                }

                // Reset if done (handled by modulo, but ensure scale 0 if wrapping)
                if (t > 1.4) p.ref.current.scale.setScalar(0);
            }
        });
    });

    return (
        <group>
            {particles.map((p, i) => (
                <mesh key={i} ref={p.ref}>
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshBasicMaterial color="#cccccc" transparent opacity={0.6} depthWrite={false} />
                </mesh>
            ))}
        </group>
    )
}

export function Car() {
    const wheelRefs = useRef<(THREE.Object3D | null)[]>([]);
    const scroll = useScroll();

    useFrame((state, delta) => {
        // Spin wheels ONLY based on scroll delta
        // scroll.delta is the change in offset 0..1 per frame
        // We need to scale it to rotation.
        const moveSpeed = scroll.delta * 2000; // Arbitrary scale factor for wheel spin

        wheelRefs.current.forEach(w => {
            if (w) w.rotation.x += moveSpeed * delta;
        });
    });

    const BODY_COLOR = "#D12020";

    return (
        // FLIP FIX: Rotate Z 180 (Math.PI) to put wheels down
        <group scale={1.2} rotation={[0, 0, Math.PI]}>
            {/* 
         ORIENTATION:
         +Z is Forward (Hood)
         -Z is Backward (Trunk)
      */}

            {/* 1. Main Body Block (Cabin + sides) */}
            <mesh position={[0, 0.6, 0]}>
                <RoundedBox args={[1.6, 0.8, 2.2]} radius={0.15} smoothness={4}>
                    <ToonMaterial color={BODY_COLOR} outlineColor="black" />
                </RoundedBox>
            </mesh>

            {/* 2. Roof / Greenhouse (Extended down to merge with body) */}
            <mesh position={[0, 1.0, -0.1]}>
                <RoundedBox args={[1.25, 0.7, 1.3]} radius={0.3} smoothness={4}>
                    <ToonMaterial color="#eee" outlineColor="black" />
                </RoundedBox>
            </mesh>

            {/* 3. Hood (Front +Z) - Smoother fit */}
            <mesh position={[0, 0.55, 1.35]} rotation={[0.15, 0, 0]}>
                <RoundedBox args={[1.4, 0.4, 1.1]} radius={0.2} smoothness={4}>
                    <ToonMaterial color={BODY_COLOR} outlineColor="black" />
                </RoundedBox>
            </mesh>

            {/* 4. Trunk (Rear -Z) - Smoother fit */}
            <mesh position={[0, 0.55, -1.35]} rotation={[-0.1, 0, 0]}>
                <RoundedBox args={[1.4, 0.5, 1.0]} radius={0.2} smoothness={4}>
                    <ToonMaterial color={BODY_COLOR} outlineColor="black" />
                </RoundedBox>
            </mesh>


            {/* 5. Distinct Fenders (Wheel Arches) */}
            {[
                [0.85, 0.4, 1.2], // FL (+Z)
                [-0.85, 0.4, 1.2], // FR
                [0.85, 0.4, -1.2], // RL (-Z)
                [-0.85, 0.4, -1.2] // RR
            ].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                    <RoundedBox args={[0.5, 0.6, 0.9]} radius={0.25} smoothness={4}>
                        <ToonMaterial color={BODY_COLOR} outlineColor="black" />
                    </RoundedBox>
                </mesh>
            ))}

            {/* 6. Windows (Embedded properly) */}
            {/* Windshield (+Z) */}
            <mesh position={[0, 1.05, 0.58]} rotation={[-0.2, 0, 0]}>
                <boxGeometry args={[1.0, 0.4, 0.05]} />
                <meshBasicMaterial color="#334455" />
            </mesh>
            {/* Rear Window (-Z) */}
            <mesh position={[0, 1.05, -0.78]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[1.0, 0.35, 0.05]} />
                <meshBasicMaterial color="#334455" />
            </mesh>
            {/* Side Windows */}
            <mesh position={[0.63, 1.05, -0.1]}>
                <boxGeometry args={[0.05, 0.35, 0.9]} />
                <meshBasicMaterial color="#222" />
            </mesh>
            <mesh position={[-0.63, 1.05, -0.1]}>
                <boxGeometry args={[0.05, 0.35, 0.9]} />
                <meshBasicMaterial color="#222" />
            </mesh>

            {/* Details: Grill, Headlights, Bumpers */}
            {/* Grill (+Z) */}
            <mesh position={[0, 0.5, 2.05]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[0.8, 0.3, 0.1]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            {/* Headlights (+Z) */}
            <mesh position={[0.6, 0.65, 1.9]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[-0.6, 0.65, 1.9]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} />
            </mesh>

            {/* Bumpers */}
            <mesh position={[0, 0.3, 2.1]} rotation={[0, 0, 0]}>
                <boxGeometry args={[1.8, 0.15, 0.15]} />
                <meshStandardMaterial color="#eee" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.3, -2.0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[1.8, 0.15, 0.15]} />
                <meshStandardMaterial color="#eee" metalness={0.8} roughness={0.2} />
            </mesh>


            {/* WHEELS (Tucked Inward) */}
            {/* Fenders are at +/- 0.85. Wheels moved to +/- 0.70 to sit inside */}
            {[
                [0.70, 0.35, 1.2], // FL (+Z)
                [-0.70, 0.35, 1.2], // FR
                [0.70, 0.35, -1.2], // RL (-Z)
                [-0.70, 0.35, -1.2] // RR
            ].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]} ref={(el) => { wheelRefs.current[i] = el }}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.35, 0.35, 0.25, 24]} />
                        <meshStandardMaterial color="#111" roughness={0.9} />
                    </mesh>
                    <mesh rotation={[0, 0, Math.PI / 2]} position={[0, pos[0] > 0 ? 0.13 : -0.13, 0]}>
                        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                        <meshStandardMaterial color="#fff" metalness={0.6} roughness={0.2} />
                    </mesh>
                </group>
            ))}

            {/* SMOKE (Rear -Z) */}
            <group position={[0, 0.2, -2.2]}>
                <ExhaustSmoke />
            </group>

        </group>
    );
}
