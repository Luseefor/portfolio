'use client';

import { Float, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';

export interface PointOfInterest {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
}

interface PoiMarkersProps {
  pois: PointOfInterest[];
}

export function PoiMarkers({ pois }: PoiMarkersProps) {
  return (
    <group>
      {pois.map((poi) => (
        <Float key={poi.id} speed={1} rotationIntensity={0.2} floatIntensity={0.6}>
          <group position={poi.position}>
            <mesh>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial emissive="#38bdf8" emissiveIntensity={1} color="#0ea5e9" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, 0.32, 32]} />
              <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.6} />
            </mesh>
            <Html distanceFactor={10} center>
              <div className="pointer-events-none rounded-full border border-cyan-300/30 bg-[#020410]/70 px-3 py-1 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-200">
                {poi.title}
              </div>
            </Html>
          </group>
        </Float>
      ))}
    </group>
  );
}

interface PoiHudProps {
  pois: PointOfInterest[];
  activePoiId: string | null;
  nearbyPoiId: string | null;
}

export function PoiHud({ pois, activePoiId, nearbyPoiId }: PoiHudProps) {
  const { camera, size } = useThree();
  const [screenPois, setScreenPois] = useState<
    { id: string; x: number; y: number; offscreen: boolean; angle: number }[]
  >([]);

  const poiVectors = useMemo(
    () =>
      pois.map((poi) => ({
        id: poi.id,
        position: new THREE.Vector3(...poi.position),
      })),
    [pois],
  );

  useFrame(() => {
    const next = poiVectors.map(({ id, position }) => {
      const projected = position.clone().project(camera);
      const isOffscreen = projected.z < 0 || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1;

      const clampedX = THREE.MathUtils.clamp(projected.x, -0.9, 0.9);
      const clampedY = THREE.MathUtils.clamp(projected.y, -0.9, 0.9);

      const screenX = ((isOffscreen ? clampedX : projected.x) * 0.5 + 0.5) * size.width;
      const screenY = (-(isOffscreen ? clampedY : projected.y) * 0.5 + 0.5) * size.height;

      const angle = Math.atan2(projected.y, projected.x);
      return {
        id,
        x: screenX,
        y: screenY,
        offscreen: isOffscreen,
        angle,
      };
    });

    setScreenPois(next);
  });

  const activePoi = pois.find((poi) => poi.id === activePoiId) ?? null;
  const nearbyPoi = pois.find((poi) => poi.id === nearbyPoiId) ?? null;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-30">
        {screenPois.map((poi) => (
          <div
            key={poi.id}
            className="absolute flex items-center gap-2"
            style={{ left: poi.x, top: poi.y, transform: 'translate(-50%, -50%)' }}
          >
            {poi.offscreen && (
              <div
                className="h-0 w-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-cyan-300"
                style={{ transform: `rotate(${poi.angle}rad)` }}
              />
            )}
            {!poi.offscreen && (
              <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            )}
          </div>
        ))}
      </div>

      {nearbyPoi && !activePoi && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-cyan-300/40 bg-[#020410]/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-200">
          Press E to {nearbyPoi.title}
        </div>
      )}

      {activePoi && (
        <div className="pointer-events-none absolute right-8 top-24 z-40 w-[320px] rounded-3xl border border-cyan-300/30 bg-[#020410]/80 p-6 text-white shadow-[0_0_40px_rgba(34,211,238,0.2)] backdrop-blur">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-200">
            Intel Log
          </div>
          <h2 className="mt-3 text-xl font-black text-white">{activePoi.title}</h2>
          <p className="mt-3 text-sm text-white/60">{activePoi.description}</p>
        </div>
      )}
    </>
  );
}
