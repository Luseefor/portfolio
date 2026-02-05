'use client';

import { Suspense, useRef } from 'react';
import { Color } from 'three';
import { Physics, type RapierRigidBody } from '@react-three/rapier';
import { AudioListener } from '@react-three/drei';
import PlayerController from './PlayerController';
import CameraRig from './CameraRig';
import DungeonAmbience from './DungeonAmbience';
import DungeonWorld from './DungeonWorld';

const FOG_COLOR = new Color('#0b0f14');

export default function DungeonScene() {
  const playerBodyRef = useRef<RapierRigidBody | null>(null);

  return (
    <group>
      <color attach="background" args={['#050607']} />
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.03]} />

      {/* Global lighting */}
      <ambientLight intensity={0.22} color="#cfd6dc" />
      <hemisphereLight intensity={0.32} color="#9bb7c8" groundColor="#1a1a1a" />
      <directionalLight
        position={[8, 10, 6]}
        intensity={0.8}
        color="#f4e4c8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={2}
        shadow-camera-far={40}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Room lights */}
      <pointLight position={[0, 3, 0]} intensity={2.0} color="#ffb26b" distance={14} decay={2} />
      <pointLight position={[0, 3, 18]} intensity={2.3} color="#ffb26b" distance={14} decay={2} />
      <pointLight position={[18, 3, 18]} intensity={2.0} color="#ffb26b" distance={14} decay={2} />
      <pointLight position={[-18, 3, 18]} intensity={1.4} color="#9bb6ff" distance={12} decay={2} />

      <Suspense fallback={null}>
        <AudioListener />
        <DungeonAmbience />
      </Suspense>

      <DungeonWorld />

      <Physics gravity={[0, -24, 0]}>
        <CameraRig targetBody={playerBodyRef} />
        <Suspense fallback={null}>
          <PlayerController bodyRef={playerBodyRef} />
        </Suspense>
      </Physics>
    </group>
  );
}
