'use client';

import { Suspense, useEffect, useRef } from 'react';
import { AudioListener, Color } from 'three';
import { Physics, type RapierRigidBody } from '@react-three/rapier';
import { useThree } from '@react-three/fiber';
import PlayerController from './PlayerController';
import CameraRig from './CameraRig';
import DungeonAmbience from './DungeonAmbience';
import DungeonWorld from './DungeonWorld';

const FOG_COLOR = new Color('#0b0f14');

export default function DungeonScene() {
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const { camera } = useThree();
  const listenerRef = useRef<AudioListener | null>(null);

  useEffect(() => {
    if (!listenerRef.current) {
      listenerRef.current = new AudioListener();
    }
    const listener = listenerRef.current;
    camera.add(listener);

    // Reduce far clipping plane to prevent rendering beyond dungeon
    camera.far = 100;
    camera.updateProjectionMatrix();

    return () => {
      camera.remove(listener);
    };
  }, [camera]);

  return (
    <group>
      <color attach="background" args={['#050607']} />
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.025]} />

      {/* Global lighting — tuned for enclosed dungeon atmosphere */}
      <ambientLight intensity={0.3} color="#cfd6dc" />
      <hemisphereLight intensity={0.35} color="#9bb7c8" groundColor="#1a1a1a" />
      <directionalLight
        position={[8, 10, 6]}
        intensity={0.7}
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
      <pointLight position={[0, 3, 0]} intensity={2.5} color="#ffb26b" distance={22} decay={2} />
      <pointLight position={[0, 3, 18]} intensity={2.8} color="#ffb26b" distance={22} decay={2} />
      <pointLight position={[18, 3, 18]} intensity={2.5} color="#ffb26b" distance={22} decay={2} />
      <pointLight position={[-18, 3, 18]} intensity={1.8} color="#9bb6ff" distance={18} decay={2} />

      <Suspense fallback={null}>
        <DungeonAmbience />
      </Suspense>

      <Physics gravity={[0, -24, 0]}>
        <Suspense fallback={null}>
          <DungeonWorld />
        </Suspense>
        <CameraRig targetBody={playerBodyRef} />
        <PlayerController bodyRef={playerBodyRef} />
      </Physics>
    </group>
  );
}
