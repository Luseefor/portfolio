'use client';

import { Suspense, useRef } from 'react';
import { Color } from 'three';
import { Physics, type RapierRigidBody } from '@react-three/rapier';
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
      <ambientLight intensity={0.25} color="#cfd6dc" />
      <hemisphereLight intensity={0.35} color="#8fb2c7" groundColor="#1a1a1a" />
      <directionalLight position={[8, 10, 6]} intensity={0.6} color="#f2e7d5" />

      {/* Room lights */}
      <pointLight position={[0, 3, 0]} intensity={1.8} color="#ffb26b" distance={14} />
      <pointLight position={[0, 3, 18]} intensity={2.1} color="#ffb26b" distance={14} />
      <pointLight position={[18, 3, 18]} intensity={1.9} color="#ffb26b" distance={14} />
      <pointLight position={[-18, 3, 18]} intensity={1.2} color="#9bb6ff" distance={12} />

      <Suspense fallback={null}>
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
