'use client';

import { Suspense, useEffect, useRef } from 'react';
import { AudioListener, Color } from 'three';
import { Physics, type RapierRigidBody } from '@react-three/rapier';
import { useThree } from '@react-three/fiber';
import PlayerController from './PlayerController';
import CameraRig from './CameraRig';
import { ChestSystem } from './ChestSystem';
import DungeonAmbience from './DungeonAmbience';
import DungeonWorld from './DungeonWorld';
import DungeonDebugPrimitives from './debug/DungeonDebugPrimitives';
import { useDungeonDebugOverlayToggle } from './debug/useDungeonDebugOverlayToggle';
import type { ChestPOI } from '@/constants/dungeonLayout';
import { CAMERA_PITCH } from '@/constants/camera';
import { sceneLighting } from '@/constants/scene';

const FOG_COLOR = new Color(sceneLighting.fogColor);
const BASE_BACKGROUND = '#0a0d10';
const BASE_FOG_DENSITY = sceneLighting.fogDensity;

function getShadowMapSize(graphicsQuality: DungeonSceneProps['graphicsQuality']) {
  if (graphicsQuality === 'high') return 1024;
  if (graphicsQuality === 'medium') return 768;
  return 512;
}

type DungeonSceneProps = {
  graphicsQuality: 'low' | 'medium' | 'high';
  activeChestId: string | null;
  nearbyChestId: string | null;
  onChestOpen: (chest: ChestPOI) => void;
  onNearbyChange: (chestId: string | null) => void;
};

export default function DungeonScene({
  graphicsQuality,
  activeChestId,
  nearbyChestId,
  onChestOpen,
  onNearbyChange,
}: DungeonSceneProps) {
  const debugOverlayEnabled = useDungeonDebugOverlayToggle();
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(CAMERA_PITCH.initial);
  const { camera } = useThree();
  const listenerRef = useRef<AudioListener | null>(null);
  const shadowMapSize = getShadowMapSize(graphicsQuality);
  const shouldUseDirectionalShadows = graphicsQuality !== 'low';

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
      <color attach="background" args={[BASE_BACKGROUND]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, BASE_FOG_DENSITY]} />

      {/* Global lighting */}
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
        castShadow={shouldUseDirectionalShadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={2}
        shadow-camera-far={40}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {debugOverlayEnabled ? <DungeonDebugPrimitives /> : null}

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
        <PlayerController bodyRef={playerBodyRef} cameraYawRef={cameraYawRef} />
        <CameraRig targetBody={playerBodyRef} yawRef={cameraYawRef} pitchRef={cameraPitchRef} />
      </Physics>
    </group>
  );
}
