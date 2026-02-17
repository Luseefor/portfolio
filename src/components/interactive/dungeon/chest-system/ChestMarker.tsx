'use client';

import type { MutableRefObject } from 'react';
import type * as THREE from 'three';
import { MARKER_BASE_HEIGHT } from './constants';

type ChestMarkerProps = {
  markerRef: MutableRefObject<THREE.Group | null>;
  isNearby: boolean;
};

export function ChestMarker({ markerRef, isNearby }: ChestMarkerProps) {
  return (
    <>
      <group ref={markerRef} position={[0, MARKER_BASE_HEIGHT, 0]}>
        <mesh position={[0, 0.38, 0]} castShadow={false} receiveShadow={false}>
          <capsuleGeometry args={[0.11, 0.82, 8, 14]} />
          <meshStandardMaterial color="#ffe06a" emissive="#ff9a34" emissiveIntensity={1.35} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.34, 0]} castShadow={false} receiveShadow={false}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#ffe06a" emissive="#ff9a34" emissiveIntensity={1.35} roughness={0.35} />
        </mesh>
      </group>
      {isNearby && (
        <pointLight position={[0, MARKER_BASE_HEIGHT + 0.05, 0]} color="#fbbf24" intensity={2.1} distance={4.6} decay={2} />
      )}
    </>
  );
}
