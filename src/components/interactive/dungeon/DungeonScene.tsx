'use client';

import { Suspense, useEffect, useRef } from 'react';
import { AudioListener, Color } from 'three';
import { Physics, type RapierRigidBody } from '@react-three/rapier';
import { useThree } from '@react-three/fiber';
import PlayerController from './PlayerController';
import CameraController from './CameraController';
import DungeonAmbience from './DungeonAmbience';
import DungeonWorld from './DungeonWorld';
import { CAMERA_PITCH } from '@/constants/camera';

const FOG_COLOR = new Color('#0b0f14');
const DEV_FULLBRIGHT = false;

export default function DungeonScene() {
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(CAMERA_PITCH.initial);
  const { camera } = useThree();
  const listenerRef = useRef<AudioListener | null>(null);

  useEffect(() => {
    if (!listenerRef.current) {
      listenerRef.current = new AudioListener();
    }
    const listener = listenerRef.current;
    camera.add(listener);
    return () => {
      camera.remove(listener);
    };
  }, [camera]);

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
      {DEV_FULLBRIGHT ? (
        <>
          <ambientLight intensity={1.1} color="#ffffff" />
          <directionalLight position={[0, 18, 0]} intensity={1.4} color="#ffffff" />
        </>
      ) : null}

      {/* Room lights */}
      <pointLight position={[0, 3, 0]} intensity={2.0} color="#ffb26b" distance={14} decay={2} />
      <pointLight position={[0, 3, 18]} intensity={2.3} color="#ffb26b" distance={14} decay={2} />
      <pointLight position={[18, 3, 18]} intensity={2.0} color="#ffb26b" distance={14} decay={2} />
      <pointLight position={[-18, 3, 18]} intensity={1.4} color="#9bb6ff" distance={12} decay={2} />

      <Suspense fallback={null}>
        <DungeonAmbience />
      </Suspense>

      <Physics gravity={[0, -24, 0]}>
        <Suspense fallback={null}>
          <DungeonWorld />
        </Suspense>
        <CameraController targetBody={playerBodyRef} yawRef={cameraYawRef} pitchRef={cameraPitchRef} />
        <PlayerController bodyRef={playerBodyRef} cameraYawRef={cameraYawRef} />
      </Physics>
    </group>
  );
}
