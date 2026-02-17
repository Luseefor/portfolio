'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DustMotesProps {
  count?: number;
  bounds?: [number, number, number];
  opacity?: number;
}

export function DustMotes({ count = 200, bounds = [30, 8, 40], opacity = 0.3 }: DustMotesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * bounds[0];
      pos[i3 + 1] = Math.random() * bounds[1];
      pos[i3 + 2] = (Math.random() - 0.5) * bounds[2] + 15;
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = 0.005 + Math.random() * 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, velocities: vel, phases: ph };
  }, [count, bounds]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const posArray = points.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3] += velocities[i3] + Math.sin(time * 0.5 + phases[i]) * 0.002;
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2] + Math.cos(time * 0.3 + phases[i]) * 0.002;
      if (posArray[i3 + 1] > bounds[1]) {
        posArray[i3 + 1] = 0;
        posArray[i3] = (Math.random() - 0.5) * bounds[0];
        posArray[i3 + 2] = (Math.random() - 0.5) * bounds[2] + 15;
      }
    }

    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#d4c4a8"
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
