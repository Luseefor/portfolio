'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmokeParticlesProps {
    velocity: number;
}

const PARTICLE_COUNT = 40;
const MAX_LIFE = 1.5;

export function SmokeParticles({ velocity }: SmokeParticlesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null!);

    // Arrays to store particle state
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            temp.push({
                position: new THREE.Vector3(0, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                life: Math.random() * -MAX_LIFE, // Start staggered
                scale: 0
            });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        particles.forEach((p, i) => {
            p.life += delta;

            // Respawn particle if it's dead
            if (p.life > MAX_LIFE) {
                p.life = 0;
                // Randomized starting position near exhaust
                p.position.set(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    0
                );
                // Velocity influenced by car speed
                p.velocity.set(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.5 + 0.2, // Upwards
                    2.0 + velocity * 2.0 // Backwards
                );
            }

            if (p.life > 0) {
                const age = p.life / MAX_LIFE;

                // Update position
                p.position.x += p.velocity.x * delta;
                p.position.y += p.velocity.y * delta;
                p.position.z += p.velocity.z * delta;

                // Scale up then fade
                p.scale = Math.sin(age * Math.PI) * 0.5 * (1 + velocity);

                dummy.position.copy(p.position);
                dummy.scale.setScalar(p.scale);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);

                // Opacity handled via vertex colors or just uniform transparency?
                // Let's use simple instance matrix for now.
            } else {
                dummy.scale.setScalar(0);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.15}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
}
