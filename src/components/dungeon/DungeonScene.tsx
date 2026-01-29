'use client';

import { Physics } from '@react-three/rapier';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AxesHelper, Color, type Group } from 'three';
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
const DEBUG_TOGGLE_KEY = 'F1';

export default function DungeonScene() {
  const playerRef = useRef<Group>(null);
  const cameraYawRef = useRef(0);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const axesHelper = useMemo(() => new AxesHelper(6), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== DEBUG_TOGGLE_KEY && event.key !== DEBUG_TOGGLE_KEY) return;
      event.preventDefault();
      setDebugEnabled((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

      {debugEnabled && (
        <group name="debug-primitives">
          <directionalLight position={[6, 12, 4]} intensity={3.5} color="#ffffff" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color="#2f5d57" />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[2.5, 2.5, 2.5]} />
            <meshStandardMaterial color="#ff2d55" />
          </mesh>
          <primitive object={axesHelper} />
        </group>
      )}

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

      <Suspense fallback={null}>
        {/* Agent B: Torch system with flickering lights */}
        <TorchSystem />
      </Suspense>

      {/* Agent B: Atmospheric particles (dust motes + torch embers) */}
      <DungeonParticles />

      <DungeonAmbience />

      <Suspense fallback={null}>
        <DungeonLayout />
      </Suspense>

      <Physics gravity={[0, -25, 0]}>
        <DungeonColliders />
        <CameraRig target={playerRef} yawRef={cameraYawRef} />
        <Suspense fallback={null}>
          <PlayerController playerRef={playerRef} cameraYawRef={cameraYawRef} />
        </Suspense>
      </Physics>

      {/* Agent B: Postprocessing (bloom, vignette, tone mapping) */}
      <DungeonPostProcessing />
    </group>
  );
}
