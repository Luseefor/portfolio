'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { subscribeToPlayerState, usePlayerState } from '@/lib/playerState';
import { useSettings } from '@/lib/settings';
import type { ChestPOI } from '@/constants/dungeonLayout';
import { Chest } from './chest-system/Chest';
import { CLOSED_CHEST_GLB, OPEN_CHEST_GLB } from './chest-system/constants';
import { findNearbyChestId, isWithinChestInteractionRange } from './chest-system/proximity';
import { useRenderedChests } from './chest-system/useRenderedChests';

interface ChestSystemProps {
  onChestOpen: (chest: ChestPOI) => void;
  onNearbyChange: (chestId: string | null) => void;
  activeChestId: string | null;
  nearbyChestId: string | null;
}

export function ChestSystem({
  onChestOpen,
  onNearbyChange,
  activeChestId,
  nearbyChestId,
}: ChestSystemProps) {
  const playerPositionRef = useRef(usePlayerState.getState().position);
  const prevNearbyRef = useRef<string | null>(null);
  const masterVolume = useSettings((state: { masterVolume: number }) => state.masterVolume);
  const renderedChests = useRenderedChests();

  useEffect(() => {
    const unsubscribe = subscribeToPlayerState((state, prevState) => {
      if (state.position !== prevState.position) {
        playerPositionRef.current = state.position;
      }
    });
    return unsubscribe;
  }, []);

  useFrame(() => {
    const newNearby = findNearbyChestId(playerPositionRef.current, renderedChests);
    if (newNearby !== prevNearbyRef.current) {
      prevNearbyRef.current = newNearby;
      onNearbyChange(newNearby);
    }
  });

  return (
    <group name="chest-system">
      {renderedChests.map((entry) => (
        <Chest
          key={entry.chest.id}
          chest={entry.chest}
          position={entry.position}
          isOpen={activeChestId === entry.chest.id}
          isNearby={nearbyChestId === entry.chest.id}
          onOpen={() => {
            const playerPosition = playerPositionRef.current;
            if (!isWithinChestInteractionRange(playerPosition, entry.chest, entry.position)) return;
            onChestOpen(entry.chest);
          }}
          masterVolume={masterVolume}
        />
      ))}
    </group>
  );
}

useGLTF.preload(CLOSED_CHEST_GLB);
useGLTF.preload(OPEN_CHEST_GLB);
