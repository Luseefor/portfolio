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
import { BUILT_DUNGEON } from '@/game/dungeon/buildDungeon';

const FOG_COLOR = new Color('#101418');
const DEV_FULLBRIGHT = false;
const TORCH_LIGHTS = BUILT_DUNGEON.torchAnchors.slice(0, 36).map((anchor, index) => ({
  id: anchor.id,
  position: anchor.position,
  color:
    anchor.source === 'spawn'
      ? '#ffc272'
      : anchor.source === 'corridor'
        ? '#ffad63'
        : '#ffbf7a',
  intensity:
    anchor.source === 'spawn'
      ? 1.65 + (index % 3) * 0.08
      : anchor.source === 'corridor'
        ? 1.25 + (index % 2) * 0.1
        : 1.45,
  distance: anchor.source === 'corridor' ? 10 : 12,
}));

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
      <color attach="background" args={['#0a0d10']} />
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.0175]} />

      {/* Global lighting */}
      <ambientLight intensity={0.2} color="#cfd8df" />
      <hemisphereLight intensity={0.35} color="#b8cad6" groundColor="#1c1d1d" />
      <directionalLight
        position={[12, 18, 8]}
        intensity={0.72}
        color="#f8e4c7"
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

      {TORCH_LIGHTS.map((light) => (
        <pointLight
          key={`torch-light-${light.id}`}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
          distance={light.distance}
          decay={2}
        />
      ))}

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
