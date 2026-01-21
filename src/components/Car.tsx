'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ToonMaterial } from './ToonMaterial';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function ExhaustSmoke() {
    const particles = useMemo(() => {
        return new Array(20).fill(0).map(() => ({
            ref: React.createRef<THREE.Mesh>(),
            offset: Math.random() * 100,
            speed: 0.5 + Math.random() * 0.5
        }));
    }, []);

    useFrame((state, delta) => {
        particles.forEach((p, i) => {
            if (p.ref.current) {
                const time = state.clock.elapsedTime * p.speed + p.offset;
                const t = time % 2;
                // Emitting from -Z (Rear) and moving further -Z (Behind)
                // Start at -2.2 (Bumper), Move to -6.0
                p.ref.current.position.z = -2.2 - t * 4;
                p.ref.current.position.y = 0.3 + t * 1;
                p.ref.current.scale.setScalar(0.1 + t * 0.4);
                if (t > 1.8) p.ref.current.scale.setScalar(0);
            }
        });
    });

    return (
        <group>
            {particles.map((p, i) => (
                <mesh key={i} ref={p.ref}>
                    <sphereGeometry args={[0.3, 8, 8]} />
                    <meshBasicMaterial color="#aaaaaa" transparent opacity={0.4} />
                </mesh>
            ))}
        </group>
    )
}

function WindUpKey() {
    const keyRef = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (keyRef.current) {
            keyRef.current.rotation.x += delta * 3;
        }
    });

    // Rear Deck is at -Z
    return (
        <group ref={keyRef} position={[0, 0.9, -1.6]} rotation={[0, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
                <meshStandardMaterial color="#ecc" metalness={1.0} roughness={0.2} />
            </mesh>
            <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.3, 0.08, 8, 16]} />
                <meshStandardMaterial color="#ecc" metalness={1.0} roughness={0.2} />
            </mesh>
        </group>
    );
}

export function Car() {
    const wheelRefs = useRef<(THREE.Object3D | null)[]>([]);

    useFrame((state, delta) => {
        const speed = 12 * delta;
        wheelRefs.current.forEach(w => {
            if (w) w.rotation.x += speed;
        });
    });

    const BODY_COLOR = "#D12020";

    return (
        <group scale={1.2}>
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

            {/* 2. Roof / Greenhouse */}
            <mesh position={[0, 1.1, -0.1]}>
                <RoundedBox args={[1.3, 0.6, 1.4]} radius={0.3} smoothness={4}>
                    <ToonMaterial color="#eee" outlineColor="black" />
                </RoundedBox>
            </mesh>

            {/* 3. Hood (Front +Z) */}
            <mesh position={[0, 0.55, 1.4]} rotation={[0.2, 0, 0]}>
                <RoundedBox args={[1.4, 0.4, 1.2]} radius={0.2} smoothness={4}>
                    <ToonMaterial color={BODY_COLOR} outlineColor="black" />
                </RoundedBox>
            </mesh>

            {/* 4. Trunk (Rear -Z) */}
            <mesh position={[0, 0.55, -1.4]} rotation={[-0.1, 0, 0]}>
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

            {/* 6. Windows */}
            {/* Windshield (+Z) */}
            <mesh position={[0, 1.15, 0.65]} rotation={[-0.2, 0, 0]}>
                <boxGeometry args={[1.1, 0.5, 0.05]} />
                <meshBasicMaterial color="#334455" />
            </mesh>
            {/* Rear Window (-Z) */}
            <mesh position={[0, 1.15, -0.85]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[1.1, 0.4, 0.05]} />
                <meshBasicMaterial color="#334455" />
            </mesh>
            {/* Side Windows */}
            <mesh position={[0.66, 1.15, -0.1]}>
                <boxGeometry args={[0.05, 0.45, 1.0]} />
                <meshBasicMaterial color="#222" />
            </mesh>
            <mesh position={[-0.66, 1.15, -0.1]}>
                <boxGeometry args={[0.05, 0.45, 1.0]} />
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


            {/* Wind-Up Key (Moved to REAR -Z) */}
            <WindUpKey />

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
