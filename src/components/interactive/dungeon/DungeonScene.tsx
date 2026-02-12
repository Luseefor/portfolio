'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { AudioListener, Color } from 'three';
import { Physics, type RapierRigidBody } from '@react-three/rapier';
import { useThree } from '@react-three/fiber';
import PlayerController from './PlayerController';
import CameraController from './CameraController';
import { ChestSystem } from './ChestSystem';
import DungeonAmbience from './DungeonAmbience';
import DungeonWorld from './DungeonWorld';
import type { ChestPOI } from '@/constants/dungeonLayout';
import { CAMERA_PITCH } from '@/constants/camera';

const FOG_COLOR = new Color('#101418');
const BASE_BACKGROUND = '#0a0d10';
const FULLBRIGHT_BACKGROUND = '#a3afbb';
const BASE_FOG_DENSITY = 0.0175;
const FULLBRIGHT_FOG_DENSITY = 0.0028;

type DungeonSceneProps = {
  activeChestId: string | null;
  nearbyChestId: string | null;
  onChestOpen: (chest: ChestPOI) => void;
  onNearbyChange: (chestId: string | null) => void;
};

export default function DungeonScene({
  activeChestId,
  nearbyChestId,
  onChestOpen,
  onNearbyChange,
}: DungeonSceneProps) {
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(CAMERA_PITCH.initial);
  const { camera } = useThree();
  const listenerRef = useRef<AudioListener | null>(null);
  const [fullbrightEnabled, setFullbrightEnabled] = useState(false);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyL' || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target) {
        const isTypingTarget =
          target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (isTypingTarget) return;
      }
      setFullbrightEnabled((current) => !current);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <group>
      <color attach="background" args={[fullbrightEnabled ? FULLBRIGHT_BACKGROUND : BASE_BACKGROUND]} />
      <fogExp2
        attach="fog"
        args={[FOG_COLOR, fullbrightEnabled ? FULLBRIGHT_FOG_DENSITY : BASE_FOG_DENSITY]}
      />

      {/* Global lighting */}
      <ambientLight intensity={fullbrightEnabled ? 1.45 : 0.2} color="#cfd8df" />
      <hemisphereLight
        intensity={fullbrightEnabled ? 0.9 : 0.35}
        color={fullbrightEnabled ? '#e8f2ff' : '#b8cad6'}
        groundColor={fullbrightEnabled ? '#7f8a93' : '#1c1d1d'}
      />
      <directionalLight
        position={fullbrightEnabled ? [0, 20, 0] : [12, 18, 8]}
        intensity={fullbrightEnabled ? 1.25 : 0.72}
        color={fullbrightEnabled ? '#ffffff' : '#f8e4c7'}
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

      <Suspense fallback={null}>
        <DungeonAmbience />
      </Suspense>

      <Physics gravity={[0, -24, 0]}>
        <Suspense fallback={null}>
          <DungeonWorld />
        </Suspense>
        <ChestSystem
          onChestOpen={onChestOpen}
          onNearbyChange={onNearbyChange}
          activeChestId={activeChestId}
          nearbyChestId={nearbyChestId}
        />
        <CameraController targetBody={playerBodyRef} yawRef={cameraYawRef} pitchRef={cameraPitchRef} />
        <PlayerController bodyRef={playerBodyRef} cameraYawRef={cameraYawRef} />
      </Physics>
    </group>
  );
}
