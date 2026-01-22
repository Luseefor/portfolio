'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmokeParticlesProps {
    velocity: number;
}

const PARTICLE_COUNT = 60;
const MAX_LIFE = 1.8;

export function SmokeParticles({ velocity }: SmokeParticlesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null!);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            temp.push({
                position: new THREE.Vector3(0, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                life: Math.random() * -MAX_LIFE,
                scale: 0
            });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        particles.forEach((p, i) => {
            p.life += delta;

            if (p.life > MAX_LIFE) {
                p.life = 0;
                p.position.set(0, 0, 0);

                // Physics relative to car's internal axes:
                // X: side-to-side drift
                // Y: DOWN becomes UP because the car model group is rotated Math.PI
                // Z: POSITIVE Z is FORWARD, so NEGATIVE Z is BACKWARD
                p.velocity.set(
                    (Math.random() - 0.5) * 0.1,
                    -0.5 - Math.random() * 0.5, // Moving "down" in local coords (up in world)
                    -2.0 - velocity * 3.0      // Moving "back" in local coords (pos Z is forward)
                );
            }

            if (p.life > 0) {
                const age = p.life / MAX_LIFE;

                p.position.x += p.velocity.x * delta;
                p.position.y += p.velocity.y * delta;
                p.position.z += p.velocity.z * delta;

                // Tapered growth
                p.scale = Math.sin(age * Math.PI * 0.8) * 0.6 * (1 + velocity * 0.3);

                dummy.position.copy(p.position);
                dummy.scale.setScalar(p.scale);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
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
            <sphereGeometry args={[0.3, 6, 6]} />
            <meshBasicMaterial
                color="#666666"
                transparent
                opacity={0.3}
                depthWrite={false}
                blending={THREE.NormalBlending}
            />
        </instancedMesh>
    );
}
