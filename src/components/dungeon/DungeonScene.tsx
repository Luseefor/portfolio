'use client';

import { useGLTF } from '@react-three/drei';
import { MeshCollider, Physics, RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import { Color, type Group } from 'three';
import PlayerController from '@/components/dungeon/PlayerController';
import CameraRig from '@/components/dungeon/CameraRig';
import DungeonAmbience from '@/components/dungeon/DungeonAmbience';
import { TorchSystem } from '@/components/dungeon/Torch';
import DungeonPostProcessing from '@/components/dungeon/DungeonPostProcessing';
import { sceneLighting } from '@/constants/scene';

const FOG_COLOR = new Color(sceneLighting.fogColor);

export default function DungeonScene() {
  const { scene } = useGLTF('/models/dungeon/structure/Modular Ruins Pack.glb');
  const playerRef = useRef<Group>(null);

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

      <DungeonAmbience />

      <Physics gravity={[0, -25, 0]}>
        <RigidBody type="fixed" colliders={false}>
          <MeshCollider type="trimesh">
            <primitive object={scene} position={[0, -1.5, 0]} />
          </MeshCollider>
        </RigidBody>

        <RigidBody type="fixed" colliders="cuboid">
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#2a1f19" roughness={0.95} />
          </mesh>
        </RigidBody>

        <PlayerController playerRef={playerRef} />
      </Physics>

      <CameraRig target={playerRef} />

      {/* Agent B: Postprocessing (bloom, vignette, tone mapping) */}
      <DungeonPostProcessing />
    </group>
  );
}

useGLTF.preload('/models/dungeon/structure/Modular Ruins Pack.glb');
