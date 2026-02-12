'use client';

import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef, useMemo, useEffect } from 'react';
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
  const groupRef = useRef<THREE.Group>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedOpenSoundRef = useRef(false);
  const baseSize = useMemo(() => {
    const scale = 0.9 * DUNGEON_SCALE;
    return {
      width: 1.2 * scale,
      height: 0.6 * scale,
      depth: 0.9 * scale,
      lidHeight: 0.25 * scale,
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/props/chest_open.mp3');
      audioRef.current.preload = 'auto';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play open sound when chest opens
  useEffect(() => {
    if (isOpen && !hasPlayedOpenSoundRef.current && audioRef.current) {
      const safeVolume = clampVolume(masterVolume);
      audioRef.current.volume = Number.isFinite(safeVolume) ? safeVolume : 0.7;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      hasPlayedOpenSoundRef.current = true;
    }
  }, [isOpen, masterVolume]);

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
      {/* Chest blockout */}
      <mesh position={[0, baseSize.height / 2, 0]}>
        <boxGeometry args={[baseSize.width, baseSize.height, baseSize.depth]} />
        <meshStandardMaterial color={isOpen ? '#6b4f3a' : '#7a5a3e'} roughness={0.8} />
      </mesh>
      <mesh
        position={[0, baseSize.height + baseSize.lidHeight / 2, -baseSize.depth * 0.25]}
        rotation={[isOpen ? -0.9 : 0, 0, 0]}
      >
        <boxGeometry args={[baseSize.width, baseSize.lidHeight, baseSize.depth]} />
        <meshStandardMaterial color="#8b6646" roughness={0.75} />
      </mesh>

      {/* Collider only when closed */}
      {!isOpen && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[baseSize.width / 2, baseSize.height / 2, baseSize.depth / 2]}
            position={[0, baseSize.height / 2, 0]}
          />
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
