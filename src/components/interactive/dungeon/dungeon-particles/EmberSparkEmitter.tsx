'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EmberSparkEmitterProps {
  position: [number, number, number];
  count?: number;
  spread?: number;
}

export function EmberSparkEmitter({ position, count = 15, spread = 0.5 }: EmberSparkEmitterProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities, lifetimes, maxLifetimes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);
    const maxLife = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = position[0] + (Math.random() - 0.5) * spread * 0.5;
      pos[i3 + 1] = position[1] + Math.random() * 0.3;
      pos[i3 + 2] = position[2] + (Math.random() - 0.5) * spread * 0.5;
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = 0.02 + Math.random() * 0.03;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
      maxLife[i] = 1 + Math.random() * 2;
      life[i] = Math.random() * maxLife[i];
    }

    return { positions: pos, velocities: vel, lifetimes: life, maxLifetimes: maxLife };
  }, [count, position, spread]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    const posArray = points.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      lifetimes[i] += delta;
      if (lifetimes[i] > maxLifetimes[i]) {
        lifetimes[i] = 0;
        posArray[i3] = position[0] + (Math.random() - 0.5) * spread * 0.5;
        posArray[i3 + 1] = position[1] + Math.random() * 0.2;
        posArray[i3 + 2] = position[2] + (Math.random() - 0.5) * spread * 0.5;
        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = 0.02 + Math.random() * 0.03;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      }

      posArray[i3] += velocities[i3] + Math.sin(lifetimes[i] * 5) * 0.001;
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2];
    }

    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ff6a00"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
