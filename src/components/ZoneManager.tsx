'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZONES, ZoneConfig, getDistanceToZone } from '@/world/zones';

interface ZoneState {
  id: string;
  loaded: boolean;
}

interface ZoneManagerProps {
  playerPosition: { x: number; y: number; z: number };
}

function ZoneModel({ zone }: { zone: ZoneConfig }) {
  const { scene } = useGLTF(zone.glbPath);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    
    // Apply underwater material tweaks
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material;
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = 0.3;
          material.roughness = Math.max(material.roughness, 0.7);
          // Add underwater tint
          material.color.lerp(new THREE.Color('#4a90a4'), 0.15);
          material.needsUpdate = true;
        }
      }
    });
    
    return clone;
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      position={zone.center}
      scale={zone.scale ?? 1}
      rotation={zone.rotation ?? [0, 0, 0]}
    />
  );
}

function ZoneLoader({ zone, onLoad }: { zone: ZoneConfig; onLoad: () => void }) {
  useEffect(() => {
    // Preload the GLB
    useGLTF.preload(zone.glbPath);
    onLoad();
  }, [zone.glbPath, onLoad]);

  return <ZoneModel zone={zone} />;
}

export default function ZoneManager({ playerPosition }: ZoneManagerProps) {
  const [loadedZones, setLoadedZones] = useState<Set<string>>(new Set());
  const prevLoadedRef = useRef<Set<string>>(new Set());

  // Determine which zones should be loaded
  const activeZones = useMemo(() => {
    const shouldLoad = new Set<string>();
    
    ZONES.forEach((zone) => {
      const distance = getDistanceToZone(playerPosition, zone);
      const wasLoaded = prevLoadedRef.current.has(zone.id);
      
      if (wasLoaded) {
        // Use unload radius for already loaded zones (hysteresis)
        if (distance < zone.unloadRadius) {
          shouldLoad.add(zone.id);
        }
      } else {
        // Use load radius for not-yet-loaded zones
        if (distance < zone.loadRadius) {
          shouldLoad.add(zone.id);
        }
      }
    });
    
    prevLoadedRef.current = shouldLoad;
    return shouldLoad;
  }, [playerPosition]);

  const handleZoneLoad = (zoneId: string) => {
    setLoadedZones((prev) => new Set([...prev, zoneId]));
  };

  return (
    <group name="zone-manager">
      {ZONES.map((zone) => {
        if (!activeZones.has(zone.id)) return null;
        
        return (
          <ZoneLoader
            key={zone.id}
            zone={zone}
            onLoad={() => handleZoneLoad(zone.id)}
          />
        );
      })}
    </group>
  );
}

// Preload hint for faster initial load
export function preloadNearestZone(playerPosition: { x: number; y: number; z: number }) {
  let nearest: ZoneConfig | null = null;
  let minDist = Infinity;
  
  ZONES.forEach((zone) => {
    const dist = getDistanceToZone(playerPosition, zone);
    if (dist < minDist) {
      minDist = dist;
      nearest = zone;
    }
  });
  
  if (nearest !== null) {
    useGLTF.preload((nearest as ZoneConfig).glbPath);
  }
}
