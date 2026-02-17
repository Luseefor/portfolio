'use client';

import { useMemo, useRef } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { ChestPOI } from '@/constants/dungeonLayout';
import {
  CHEST_COLLIDER_HEIGHT_SCALE,
  CHEST_WORLD_SIZE,
  CLOSED_CHEST_GLB,
  OPEN_CHEST_GLB,
  type RenderedChest,
} from './constants';
import { buildChestModel } from './model';
import { ChestMarker } from './ChestMarker';
import { useChestAudio } from './useChestAudio';
import { useChestVisuals } from './useChestVisuals';

type ChestGLTF = {
  scene: THREE.Object3D;
};

type ChestProps = {
  chest: ChestPOI;
  position: RenderedChest['position'];
  isOpen: boolean;
  isNearby: boolean;
  onOpen: () => void;
  masterVolume: number;
};

function ChestFallback({ color }: { color: string }) {
  return (
    <mesh position={[0, CHEST_WORLD_SIZE.height * 0.5, 0]}>
      <boxGeometry args={[CHEST_WORLD_SIZE.width, CHEST_WORLD_SIZE.height, CHEST_WORLD_SIZE.depth]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

export function Chest({ chest, position, isOpen, isNearby, onOpen, masterVolume }: ChestProps) {
  const groupRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Group>(null);
  const closedChestAsset = useGLTF(CLOSED_CHEST_GLB) as ChestGLTF;
  const openChestAsset = useGLTF(OPEN_CHEST_GLB) as ChestGLTF;

  const closedModel = useMemo(
    () => buildChestModel(closedChestAsset.scene, CHEST_WORLD_SIZE),
    [closedChestAsset.scene],
  );
  const openModel = useMemo(
    () => buildChestModel(openChestAsset.scene, CHEST_WORLD_SIZE),
    [openChestAsset.scene],
  );
  const rotation = chest.rotation ? new THREE.Euler(...chest.rotation) : undefined;

  useChestAudio(isOpen, masterVolume);
  useChestVisuals({ isOpen, isNearby, groupRef, markerRef });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (!isOpen && isNearby) onOpen();
  };

  return (
    <group ref={groupRef} position={position} rotation={rotation} onPointerDown={handlePointerDown}>
      {isOpen ? openModel ? <primitive object={openModel} /> : <ChestFallback color="#6b4f3a" /> : null}
      {!isOpen ? closedModel ? <primitive object={closedModel} /> : <ChestFallback color="#7a5a3e" /> : null}

      {!isOpen && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[
              CHEST_WORLD_SIZE.width / 2,
              (CHEST_WORLD_SIZE.height * CHEST_COLLIDER_HEIGHT_SCALE) / 2,
              CHEST_WORLD_SIZE.depth / 2,
            ]}
            position={[0, (CHEST_WORLD_SIZE.height * CHEST_COLLIDER_HEIGHT_SCALE) / 2, 0]}
          />
        </RigidBody>
      )}

      {!isOpen && <ChestMarker markerRef={markerRef} isNearby={isNearby} />}
    </group>
  );
}
