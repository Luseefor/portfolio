'use client';

import { Float, Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export interface POIData {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  radius: number;
  actions?: {
    label: string;
    url?: string;
    type: 'link' | 'github' | 'custom';
  }[];
  icon?: 'project' | 'artifact' | 'location' | 'secret';
}

export const POI_LIST: POIData[] = [
  {
    id: 'coral-reef',
    title: 'Coral Reef',
    description:
      'Vivid coral growth detected. Scan bio-luminescent patterns for navigation data. This ecosystem houses rare specimens worth investigating.',
    position: [12, -1.6, -18],
    radius: 6,
    actions: [
      { label: 'View Project', url: '/projects/coral', type: 'link' },
      { label: 'GitHub', url: 'https://github.com', type: 'github' },
    ],
    icon: 'project',
  },
  {
    id: 'shipwreck',
    title: 'Ancient Shipwreck',
    description:
      'Residual energy signatures found. Stabilize the hull to extract archival logs. Centuries of maritime history await discovery.',
    position: [-20, -1.8, 22],
    radius: 7,
    actions: [
      { label: 'Explore Archive', url: '/projects/archive', type: 'link' },
      { label: 'View Source', url: 'https://github.com', type: 'github' },
    ],
    icon: 'artifact',
  },
  {
    id: 'anchor-site',
    title: 'Anchor Site',
    description:
      'Anchor chain embedded in the seabed. Potential salvage and waypoint data. Structural analysis reveals ancient construction techniques.',
    position: [26, -2.0, 8],
    radius: 5,
    actions: [{ label: 'Analyze', url: '/projects/anchor', type: 'link' }],
    icon: 'location',
  },
  {
    id: 'deep-trench',
    title: 'Abyssal Trench',
    description:
      'Uncharted depths detected. Extreme pressure readings. Unknown specimens may lurk in the darkness below.',
    position: [-8, -2.2, -30],
    radius: 8,
    actions: [{ label: 'Descend', type: 'custom' }],
    icon: 'secret',
  },
];

interface HologramBeaconProps {
  poi: POIData;
  isHighlighted: boolean;
  isActive: boolean;
  isNearby: boolean;
}

function HologramBeacon({ poi, isHighlighted, isActive, isNearby }: HologramBeaconProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  // Reusable vectors
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Gentle bob
    groupRef.current.position.y = poi.position[1] + Math.sin(time * 1.2) * 0.08;

    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.y = time * 0.5;
      ringRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }

    // Pulse scale
    if (pulseRef.current) {
      const pulseScale = 1 + Math.sin(time * 2) * 0.15;
      pulseRef.current.scale.setScalar(pulseScale);
    }
  });

  const baseColor = isHighlighted ? '#22d3ee' : isNearby ? '#7dd3fc' : '#38bdf8';
  const emissiveIntensity = isHighlighted ? 2.5 : isActive ? 2.0 : isNearby ? 1.5 : 1.0;

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={[poi.position[0], poi.position[1], poi.position[2]]}>
        {/* Core beacon sphere */}
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={emissiveIntensity}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Outer glow sphere */}
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial
            color={baseColor}
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Rotating ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 32]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={emissiveIntensity * 0.6}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Vertical beam */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.02, 0.06, 1.4, 8]} />
          <meshBasicMaterial
            color={baseColor}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Active waypoint cone */}
        {isActive && (
          <group position={[0, 1.6, 0]}>
            <mesh rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.2, 0.5, 16]} />
              <meshStandardMaterial
                color="#22d3ee"
                emissive="#22d3ee"
                emissiveIntensity={2.0}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        )}

        {/* Billboard label */}
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          <group position={[0, 0.6, 0]}>
            {/* Label background */}
            <mesh>
              <planeGeometry args={[2.0, 0.4]} />
              <meshBasicMaterial
                color="#020410"
                transparent
                opacity={0.75}
                depthWrite={false}
              />
            </mesh>
            {/* Label text uses Html in parent component */}
          </group>
        </Billboard>
      </group>
    </Float>
  );
}

interface POIMarkersEnhancedProps {
  pois: POIData[];
  highlightedIds: Set<string>;
  activePoiId: string | null;
  nearbyPoiId: string | null;
}

export function POIMarkersEnhanced({
  pois,
  highlightedIds,
  activePoiId,
  nearbyPoiId,
}: POIMarkersEnhancedProps) {
  return (
    <group name="poi-markers">
      {pois.map((poi) => (
        <HologramBeacon
          key={poi.id}
          poi={poi}
          isHighlighted={highlightedIds.has(poi.id)}
          isActive={activePoiId === poi.id}
          isNearby={nearbyPoiId === poi.id}
        />
      ))}
    </group>
  );
}
