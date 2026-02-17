import { useFrame } from '@react-three/fiber';
import type { MutableRefObject } from 'react';
import type * as THREE from 'three';
import { MARKER_BASE_HEIGHT, MARKER_BOB_AMPLITUDE } from './constants';

type UseChestVisualsParams = {
  isOpen: boolean;
  isNearby: boolean;
  groupRef: MutableRefObject<THREE.Group | null>;
  markerRef: MutableRefObject<THREE.Group | null>;
};

export function useChestVisuals({ isOpen, isNearby, groupRef, markerRef }: UseChestVisualsParams) {
  useFrame((state) => {
    const chestGroup = groupRef.current;
    if (chestGroup) {
      if (isNearby && !isOpen) {
        const pulse = Math.sin(state.clock.elapsedTime * 3.1) * 0.05 + 1;
        chestGroup.scale.setScalar(pulse);
      } else {
        chestGroup.scale.setScalar(1);
      }
    }

    const marker = markerRef.current;
    if (!marker || isOpen) return;
    const elapsed = state.clock.elapsedTime;
    const bob = Math.sin(elapsed * 2.8) * MARKER_BOB_AMPLITUDE;
    const pulse = (isNearby ? 1.3 : 1.12) + Math.sin(elapsed * 6.2) * (isNearby ? 0.2 : 0.12);
    marker.position.y = MARKER_BASE_HEIGHT + bob;
    marker.scale.setScalar(pulse);
  });
}
