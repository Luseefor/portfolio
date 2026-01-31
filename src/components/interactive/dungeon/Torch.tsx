'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { TORCH_PLACEMENTS, DUNGEON_SCALE } from '@/constants/DungeonLayout';

interface TorchProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  intensity?: number;
  color?: string;
  flickerSpeed?: number;
  flickerIntensity?: number;
}

/**
 * Torch Component - Agent B (B1)
 *
 * Loads wall_torch.glb and adds a warm flickering PointLight.
 * The flicker uses smooth noise (sin + random) for subtle effect.
 */
function Torch({
  position,
  rotation = [0, 0, 0],
  intensity = 3,
  color = '#ff9040',
  flickerSpeed = 8,
  flickerIntensity = 0.15,
}: TorchProps) {
  const { scene } = useGLTF('/models/dungeon/props/wall_torch.glb');
  const lightRef = useRef<THREE.PointLight>(null);

  // Clone the scene to allow multiple instances
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Store random offset for each torch to desync flickers
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  // Flicker animation using smooth noise
  useFrame((state) => {
    if (!lightRef.current) return;

    const time = state.clock.elapsedTime * flickerSpeed + randomOffset;

    // Combine multiple sin waves + subtle random for organic flicker
    const flicker =
      Math.sin(time) * 0.5 +
      Math.sin(time * 2.3) * 0.25 +
      Math.sin(time * 5.7) * 0.15 +
      (Math.random() - 0.5) * 0.1;

    // Apply flicker to intensity (subtle variation around base intensity)
    lightRef.current.intensity = intensity * (1 + flicker * flickerIntensity);
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Torch model - Scaled to match dungeon */}
      <primitive object={clonedScene} scale={DUNGEON_SCALE} />

      {/* Warm flickering point light */}
      <pointLight
        ref={lightRef}
        position={[0, 0.5 * DUNGEON_SCALE, 0.1 * DUNGEON_SCALE]} // Offset to flame position
        color={color}
        intensity={intensity}
        distance={12 * DUNGEON_SCALE}
        decay={2}
        castShadow={false}
      />

      {/* Secondary fill light for softer glow */}
      <pointLight
        position={[0, 0.3 * DUNGEON_SCALE, 0]}
        color="#ffb366"
        intensity={intensity * 0.3}
        distance={6 * DUNGEON_SCALE}
        decay={2}
      />
    </group>
  );
}

/**
 * TorchSystem - Places all torches in the dungeon
 * Uses TORCH_PLACEMENTS from DungeonLayout for consistent positioning
 */
export function TorchSystem() {
  // Memoize torch configs to avoid re-randomizing on each render
  const torchConfigs = useMemo(
    () =>
      TORCH_PLACEMENTS.map((torch) => ({
        ...torch,
        position: [
          torch.position[0] * DUNGEON_SCALE,
          torch.position[1] * DUNGEON_SCALE,
          torch.position[2] * DUNGEON_SCALE
        ] as [number, number, number],
        intensity: 2.5 + Math.random() * 0.5,
        flickerSpeed: 6 + Math.random() * 4,
      })),
    [],
  );

  return (
    <group name="torch-system">
      {torchConfigs.map((torch, index) => (
        <Torch
          key={`torch-${index}`}
          position={torch.position}
          rotation={torch.rotation}
          intensity={torch.intensity}
          flickerSpeed={torch.flickerSpeed}
        />
      ))}
    </group>
  );
}

export default Torch;

// Preload torch model
useGLTF.preload('/models/dungeon/props/wall_torch.glb');
