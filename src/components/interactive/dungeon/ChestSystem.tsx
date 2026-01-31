'use client';

import { useGLTF, PositionalAudio } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';
import { clampVolume, useSettings } from '@/lib/settings';

import { DUNGEON_SCALE, CHEST_POIS, type ChestPOI } from '@/constants/DungeonLayout';

interface ChestProps {
  chest: ChestPOI;
  isOpen: boolean;
  isNearby: boolean;
  onOpen: () => void;
  masterVolume: number;
}

function Chest({ chest, isOpen, isNearby, masterVolume }: ChestProps) {
  const closedGltf = useGLTF('/models/dungeon/props/closed_chest.glb');
  const openGltf = useGLTF('/models/dungeon/props/open_chest.glb');
  const groupRef = useRef<THREE.Group>(null);
  const audioRef = useRef<THREE.PositionalAudio>(null);
  const [hasPlayedOpenSound, setHasPlayedOpenSound] = useState(false);

  // Clone scenes to avoid sharing issues
  const closedScene = useMemo(() => closedGltf.scene.clone(true), [closedGltf.scene]);
  const openScene = useMemo(() => openGltf.scene.clone(true), [openGltf.scene]);

  // Play open sound when chest opens
  useEffect(() => {
    if (isOpen && !hasPlayedOpenSound && audioRef.current) {
      audioRef.current.setVolume(clampVolume(masterVolume));
      audioRef.current.play();
      setHasPlayedOpenSound(true);
    }
  }, [isOpen, hasPlayedOpenSound, masterVolume]);

  // Glow effect when nearby
  useFrame((state) => {
    if (!groupRef.current) return;
    if (isNearby && !isOpen) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      groupRef.current.scale.setScalar(pulse);
    } else {
      groupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={chest.position}
      rotation={chest.rotation ? new THREE.Euler(...chest.rotation) : undefined}
    >
      {/* Chest model */}
      <primitive object={isOpen ? openScene : closedScene} scale={0.8} />

      {/* Positional audio for chest open sound */}
      <PositionalAudio
        ref={audioRef}
        url="/sounds/props/chest_open.mp3"
        distance={5}
        loop={false}
        autoplay={false}
      />

      {/* Collider only when closed */}
      {!isOpen && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[0.5, 0.4, 0.4]} position={[0, 0.4, 0]} />
        </RigidBody>
      )}

      {/* Glow indicator when nearby */}
      {isNearby && !isOpen && (
        <pointLight position={[0, 1, 0]} color="#fbbf24" intensity={2} distance={3} decay={2} />
      )}
    </group>
  );
}

interface ChestSystemProps {
  onChestOpen: (chest: ChestPOI) => void;
  onNearbyChange: (chestId: string | null) => void;
  openedChests: Set<string>;
  nearbyChestId: string | null;
}

export function ChestSystem({
  onChestOpen,
  onNearbyChange,
  openedChests,
  nearbyChestId,
}: ChestSystemProps) {
  const playerPosition = usePlayerState(playerStateSelectors.position);
  const masterVolume = useSettings((s: { masterVolume: number }) => s.masterVolume);
  const prevNearbyRef = useRef<string | null>(null);

  // Check proximity to chests
  useFrame(() => {
    let nearest: { id: string; distance: number } | null = null;

    for (const chest of CHEST_POIS) {
      if (openedChests.has(chest.id)) continue;

      const chestX = chest.position[0] * DUNGEON_SCALE;
      const chestZ = chest.position[2] * DUNGEON_SCALE;

      const dx = playerPosition.x - chestX;
      const dz = playerPosition.z - chestZ;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Scale interactivity radius too
      const scaledInteractionRadius = chest.interactionRadius * DUNGEON_SCALE;

      if (distance < scaledInteractionRadius) {
        if (!nearest || distance < nearest.distance) {
          nearest = { id: chest.id, distance };
        }
      }
    }

    const newNearby = nearest ? nearest.id : null;
    if (newNearby !== prevNearbyRef.current) {
      prevNearbyRef.current = newNearby;
      onNearbyChange(newNearby);
    }
  });

  return (
    <group name="chest-system">
      {CHEST_POIS.map((chest) => (
        <Chest
          key={chest.id}
          chest={{
            ...chest,
            // Pass scaled position to the Chest instance
            position: [
              chest.position[0] * DUNGEON_SCALE,
              chest.position[1] * DUNGEON_SCALE,
              chest.position[2] * DUNGEON_SCALE
            ]
          }}
          isOpen={openedChests.has(chest.id)}
          isNearby={nearbyChestId === chest.id}
          onOpen={() => onChestOpen(chest)}
          masterVolume={masterVolume}
        />
      ))}
    </group>
  );
}

// Preload chest models
useGLTF.preload('/models/dungeon/props/closed_chest.glb');
useGLTF.preload('/models/dungeon/props/open_chest.glb');
