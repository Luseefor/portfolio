'use client';

import { Physics } from '@react-three/rapier';
import { useRef } from 'react';
import { Color, type Group } from 'three';
import PlayerController from '@/components/dungeon/PlayerController';
import CameraRig from '@/components/dungeon/CameraRig';
import DungeonAmbience from '@/components/dungeon/DungeonAmbience';
import { TorchSystem } from '@/components/dungeon/Torch';
import DungeonPostProcessing from '@/components/dungeon/DungeonPostProcessing';
import DungeonParticles from '@/components/dungeon/DungeonParticles';
import { sceneLighting } from '@/constants/scene';
import DungeonLayout from '@/components/dungeon/DungeonLayout';
import DungeonColliders from '@/components/dungeon/DungeonColliders';

const FOG_COLOR = new Color(sceneLighting.fogColor);

export default function DungeonScene() {
  const playerRef = useRef<Group>(null);
  const cameraYawRef = useRef(0);

  return (
    <group>
      <color attach="background" args={['#0b0908']} />
      <fogExp2 attach="fog" args={[FOG_COLOR, sceneLighting.fogDensity]} />

      {/* Base ambient lighting */}
      <ambientLight intensity={sceneLighting.ambientIntensity} color={sceneLighting.ambientColor} />
      <hemisphereLight
        intensity={sceneLighting.hemisphereIntensity}
        color={sceneLighting.hemisphereSky}
        groundColor={sceneLighting.hemisphereGround}
      />
      <directionalLight
        position={sceneLighting.fillDirectionalPosition}
        intensity={sceneLighting.fillDirectionalIntensity}
        color={sceneLighting.fillDirectionalColor}
      />

      {/* Static point lights for base illumination */}
      {sceneLighting.torchLights.map((torch, index) => (
        <pointLight
          key={`torch-${index}`}
          position={torch.position}
          intensity={torch.intensity}
          color={torch.color}
          distance={torch.distance}
        />
      ))}

      {/* Agent B: Torch system with flickering lights */}
      <TorchSystem />

      {/* Agent B: Atmospheric particles (dust motes + torch embers) */}
      <DungeonParticles />

      <DungeonAmbience />

      <Physics gravity={[0, -25, 0]}>
        <DungeonLayout />
        <DungeonColliders />

        <PlayerController playerRef={playerRef} cameraYawRef={cameraYawRef} />
        <CameraRig target={playerRef} yawRef={cameraYawRef} />
      </Physics>

      {/* Agent B: Postprocessing (bloom, vignette, tone mapping) */}
      <DungeonPostProcessing />
    </group>
  );
}
