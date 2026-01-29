'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TORCH_PLACEMENTS } from '@/constants/DungeonLayout';

// ========================================
// DUST MOTES - Global ambient particles
// ========================================

interface DustMotesProps {
  count?: number;
  bounds?: [number, number, number]; // x, y, z extent
  opacity?: number;
}

export function DustMotes({
  count = 200,
  bounds = [30, 8, 40],
  opacity = 0.3,
}: DustMotesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create particle positions and velocities
  const { positions, velocities, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random position within bounds
      pos[i3] = (Math.random() - 0.5) * bounds[0];
      pos[i3 + 1] = Math.random() * bounds[1];
      pos[i3 + 2] = (Math.random() - 0.5) * bounds[2] + 15; // Center around dungeon
      
      // Slow upward drift + horizontal noise
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = 0.005 + Math.random() * 0.01; // Upward
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
      
      // Random phase for noise variation
      ph[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions: pos, velocities: vel, phases: ph };
  }, [count, bounds]);

  // Animate particles
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const geometry = pointsRef.current.geometry;
    const posArray = geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Apply velocity with noise
      posArray[i3] += velocities[i3] + Math.sin(time * 0.5 + phases[i]) * 0.002;
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2] + Math.cos(time * 0.3 + phases[i]) * 0.002;
      
      // Wrap around when out of bounds
      if (posArray[i3 + 1] > bounds[1]) {
        posArray[i3 + 1] = 0;
        posArray[i3] = (Math.random() - 0.5) * bounds[0];
        posArray[i3 + 2] = (Math.random() - 0.5) * bounds[2] + 15;
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
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

// ========================================
// EMBER SPARKS - Local particles near torches
// ========================================

interface EmberSparksProps {
  position: [number, number, number];
  count?: number;
  spread?: number;
}

function EmberSparkEmitter({ position, count = 15, spread = 0.5 }: EmberSparksProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create ember particles
  const { positions, velocities, lifetimes, maxLifetimes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);
    const maxLife = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Start at emitter position with small random offset
      pos[i3] = position[0] + (Math.random() - 0.5) * spread * 0.5;
      pos[i3 + 1] = position[1] + Math.random() * 0.3;
      pos[i3 + 2] = position[2] + (Math.random() - 0.5) * spread * 0.5;
      
      // Upward drift with random horizontal
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = 0.02 + Math.random() * 0.03;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
      
      // Staggered lifetimes
      maxLife[i] = 1 + Math.random() * 2;
      life[i] = Math.random() * maxLife[i];
    }
    
    return { positions: pos, velocities: vel, lifetimes: life, maxLifetimes: maxLife };
  }, [count, position, spread]);

  // Animate embers
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    
    const geometry = pointsRef.current.geometry;
    const posArray = geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update lifetime
      lifetimes[i] += delta;
      
      // Reset if lifetime exceeded
      if (lifetimes[i] > maxLifetimes[i]) {
        lifetimes[i] = 0;
        posArray[i3] = position[0] + (Math.random() - 0.5) * spread * 0.5;
        posArray[i3 + 1] = position[1] + Math.random() * 0.2;
        posArray[i3 + 2] = position[2] + (Math.random() - 0.5) * spread * 0.5;
        
        // New random velocity
        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = 0.02 + Math.random() * 0.03;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      }
      
      // Apply velocity
      posArray[i3] += velocities[i3];
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2];
      
      // Add slight horizontal wobble
      posArray[i3] += Math.sin(lifetimes[i] * 5) * 0.001;
    }
    
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
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

// ========================================
// EMBER SYSTEM - Emitters at all torch positions
// ========================================

export function EmberSystem() {
  return (
    <group name="ember-system">
      {TORCH_PLACEMENTS.map((torch, index) => (
        <EmberSparkEmitter
          key={`ember-${index}`}
          position={[
            torch.position[0],
            torch.position[1] + 0.5, // Offset up to flame
            torch.position[2],
          ]}
          count={12}
          spread={0.4}
        />
      ))}
    </group>
  );
}

// ========================================
// COMBINED PARTICLE SYSTEM
// ========================================

export default function DungeonParticles() {
  return (
    <group name="dungeon-particles">
      <DustMotes count={150} opacity={0.25} />
      <EmberSystem />
    </group>
  );
}
