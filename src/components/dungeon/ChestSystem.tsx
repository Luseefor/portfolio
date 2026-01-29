'use client';

import { useGLTF, PositionalAudio } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';
import { useSettings } from '@/lib/settings';

export interface ChestPOI {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  interactionRadius: number;
  loot?: {
    type: 'project' | 'artifact' | 'secret';
    label: string;
    url?: string;
  };
}

export const CHEST_POIS: ChestPOI[] = [
  {
    id: 'chest-main',
    title: 'Ancient Project Scroll',
    description: 'A weathered scroll containing blueprints for a legendary web application. The craftsmanship is remarkable.',
    position: [0, 0, 24], // Room B (Chest Room) center - on diamond floor tile
    rotation: [0, 0, 0], // Facing the entrance
    interactionRadius: 2.5,
    loot: {
      type: 'project',
      label: 'View Project',
      url: '/projects/web-app',
    },
  },
  {
    id: 'chest-2',
    title: 'Enchanted Code Tome',
    description: 'This mystical tome contains powerful algorithms and arcane programming knowledge passed down through generations.',
    position: [18, 0.3, 42], // Room C (Showcase) near statue
    rotation: [0, -Math.PI / 4, 0],
    interactionRadius: 2.5,
    loot: {
      type: 'artifact',
      label: 'View on GitHub',
      url: 'https://github.com',
    },
  },
  {
    id: 'chest-3',
    title: 'Hidden Treasure',
    description: 'A secret cache of valuable experience points and rare skills. Few adventurers have discovered this trove.',
    position: [0, 0, -6], // Room A (Spawn Hall) - optional starter chest
    rotation: [0, Math.PI, 0],
    interactionRadius: 2.5,
    loot: {
      type: 'secret',
      label: 'Discover Secret',
    },
  },
];

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
      audioRef.current.setVolume(masterVolume);
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
        <pointLight
          position={[0, 1, 0]}
          color="#fbbf24"
          intensity={2}
          distance={3}
          decay={2}
        />
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

      const dx = playerPosition.x - chest.position[0];
      const dz = playerPosition.z - chest.position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < chest.interactionRadius) {
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
          chest={chest}
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
