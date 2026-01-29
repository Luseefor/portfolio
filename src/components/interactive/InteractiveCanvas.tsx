'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Float } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, Noise, GodRays } from '@react-three/postprocessing';
import LoadingScreen from './LoadingScreen';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import SubmarineController from './SubmarineController';
import MarineScatter, { MarineAsset } from './MarineScatter';
import { PointOfInterest, PoiHud, PoiMarkers, ScreenPoi } from './PoiSystem';

function OceanFloor() {
  const sandTexture = useTexture('/textures/sand.svg');

  useMemo(() => {
    sandTexture.wrapS = THREE.RepeatWrapping;
    sandTexture.wrapT = THREE.RepeatWrapping;
    sandTexture.repeat.set(24, 24);
    sandTexture.anisotropy = 8;
    sandTexture.needsUpdate = true;
  }, [sandTexture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        map={sandTexture}
        color="#0b2a4a"
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
}

function CausticLight() {
  const caustics = useTexture('/textures/caustics.svg');
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useMemo(() => {
    caustics.wrapS = THREE.RepeatWrapping;
    caustics.wrapT = THREE.RepeatWrapping;
    caustics.repeat.set(8, 8);
    caustics.needsUpdate = true;
  }, [caustics]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    caustics.offset.x += delta * 0.02;
    caustics.offset.y += delta * 0.01;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.8, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial
        ref={materialRef}
        map={caustics}
        color="#7dd3fc"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function UnderseaLightShafts() {
  const sunRef = useRef<THREE.Mesh>(null!);

  return (
    <>
      <mesh ref={sunRef} position={[-4, 6, -8]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#7dd3fc" />
      </mesh>

      <EffectComposer>
        <GodRays
          sun={sunRef}
          blendFunction={THREE.AdditiveBlending}
          density={0.6}
          decay={0.95}
          weight={0.6}
          exposure={0.2}
          samples={40}
        />
        <Bloom intensity={0.45} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
        <Vignette eskil={false} offset={0.2} darkness={0.8} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </>
  );
}

function PoiProximityUpdater({
  pois,
  subPosition,
  onNearbyChange,
}: {
  pois: PointOfInterest[];
  subPosition: THREE.Vector3;
  onNearbyChange: (id: string | null) => void;
}) {
  const poiVectors = useMemo(
    () => pois.map((poi) => ({ id: poi.id, position: new THREE.Vector3(...poi.position) })),
    [pois],
  );

  useFrame(() => {
    let nearest: { id: string; distance: number } | null = null;
    poiVectors.forEach((poi) => {
      const distance = subPosition.distanceTo(poi.position);
      if (!nearest || distance < nearest.distance) {
        nearest = { id: poi.id, distance };
      }
    });

    if (nearest && nearest.distance < 6) {
      onNearbyChange(nearest.id);
    } else {
      onNearbyChange(null);
    }
  });

  return null;
}

function PoiScreenProjector({
  pois,
  onUpdate,
}: {
  pois: PointOfInterest[];
  onUpdate: (screenPois: ScreenPoi[]) => void;
}) {
  const { camera, size } = useThree();
  const poiVectors = useMemo(
    () => pois.map((poi) => ({ id: poi.id, position: new THREE.Vector3(...poi.position) })),
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
      return { id, x: screenX, y: screenY, offscreen: isOffscreen, angle };
    });

    onUpdate(next);
  });

  return null;
}

function SonarPulse({
  position,
  triggeredAt,
}: {
  position: THREE.Vector3;
  triggeredAt: number | null;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!triggeredAt || !ringRef.current) return;
    const elapsed = (Date.now() - triggeredAt) / 1000;
    const duration = 2.2;

    const progress = Math.min(1, elapsed / duration);
    const scale = THREE.MathUtils.lerp(0.5, 12, progress);
    const opacity = THREE.MathUtils.lerp(0.8, 0, progress);

    ringRef.current.scale.setScalar(scale);
    const material = ringRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = opacity;
  });

  if (!triggeredAt) return null;

  return (
    <mesh ref={ringRef} position={[position.x, position.y, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.4, 0.6, 64]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function SonarCooldownUpdater({
  cooldownUntil,
  onUpdate,
}: {
  cooldownUntil: number;
  onUpdate: (remaining: number) => void;
}) {
  useFrame(() => {
    if (!cooldownUntil) {
      onUpdate(0);
      return;
    }
    const remaining = Math.max(0, (cooldownUntil - Date.now()) / 1000);
    onUpdate(remaining);
  });

  return null;
}

export default function InteractiveCanvas() {
  const modelUrl = process.env.NEXT_PUBLIC_INTERACTIVE_MODEL_URL || '';
  const [subPosition, setSubPosition] = useState(new THREE.Vector3(0, -1, 0));
  const [activePoiId, setActivePoiId] = useState<string | null>(null);
  const [nearbyPoiId, setNearbyPoiId] = useState<string | null>(null);
  const [screenPois, setScreenPois] = useState<ScreenPoi[]>([]);
  const [sonarPulseAt, setSonarPulseAt] = useState<number | null>(null);
  const [sonarCooldownUntil, setSonarCooldownUntil] = useState(0);
  const [highlightedPoiIds, setHighlightedPoiIds] = useState<string[]>([]);
  const [telemetry, setTelemetry] = useState({ speed: 0, depth: 0 });
  const [sonarCooldownRemaining, setSonarCooldownRemaining] = useState(0);
  const marineAssets: MarineAsset[] = [
    {
      name: 'FishSchool',
      url: process.env.NEXT_PUBLIC_MARINE_FISH_URL || '',
      count: 32,
      baseScale: 0.6,
      materialTint: '#6ee7ff',
    },
    {
      name: 'CoralCluster',
      url: process.env.NEXT_PUBLIC_MARINE_CORAL_URL || '',
      count: 18,
      baseScale: 1.1,
      materialTint: '#7dd3fc',
    },
    {
      name: 'Anchor',
      url: process.env.NEXT_PUBLIC_MARINE_ANCHOR_URL || '',
      count: 6,
      baseScale: 1.6,
      materialTint: '#5a9bd8',
    },
    {
      name: 'Wreck',
      url: process.env.NEXT_PUBLIC_MARINE_WRECK_URL || '',
      count: 5,
      baseScale: 2.0,
      materialTint: '#4677a8',
    },
  ];

  const poiList: PointOfInterest[] = useMemo(
    () => [
      {
        id: 'coral-reef',
        title: 'Explore Coral Reef',
        description:
          'Vivid coral growth detected. Scan bio-luminescent patterns for navigation data.',
        position: [12, -1.6, -18],
      },
      {
        id: 'shipwreck',
        title: 'Investigate Shipwreck',
        description:
          'Residual energy signatures found. Stabilize the hull to extract archival logs.',
        position: [-20, -1.8, 22],
      },
      {
        id: 'anchor-site',
        title: 'Inspect Anchor Site',
        description:
          'Anchor chain embedded in the seabed. Potential salvage and waypoint data.',
        position: [26, -2.0, 8],
      },
    ],
    [],
  );

  const highlightedSet = useMemo(() => new Set(highlightedPoiIds), [highlightedPoiIds]);
  const sonarCooldownMs = 8000;
  const sonarRange = 12;

  const handleSonar = () => {
    const now = Date.now();
    if (now < sonarCooldownUntil) return;

    setSonarPulseAt(now);
    setSonarCooldownUntil(now + sonarCooldownMs);

    const nearby = poiList
      .filter((poi) => subPosition.distanceTo(new THREE.Vector3(...poi.position)) < sonarRange)
      .map((poi) => poi.id);
    setHighlightedPoiIds(nearby);

    window.setTimeout(() => setHighlightedPoiIds([]), 2000);
  };

  return (
    <div className="absolute inset-0">
      <LoadingScreen />
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2.2, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#02152f"]} />
        <fogExp2 attach="fog" args={["#03224a", 0.06]} />

        <ambientLight intensity={0.35} color="#7dd3fc" />
        <directionalLight
          position={[6, 10, 6]}
          intensity={1.1}
          color="#8be9ff"
          castShadow
        />
        <spotLight
          position={[-8, 12, -6]}
          intensity={0.7}
          angle={0.6}
          penumbra={0.8}
          color="#60a5fa"
        />

        <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.6}>
          <CausticLight />
        </Float>

        <Suspense fallback={null}>
          <Stars radius={80} depth={40} count={2000} factor={3} fade speed={0.6} />
          <OceanFloor />
          <MarineScatter assets={marineAssets} />
          <PoiMarkers pois={poiList} highlightedIds={highlightedSet} activePoiId={activePoiId} />

          <PoiProximityUpdater
            pois={poiList}
            subPosition={subPosition}
            onNearbyChange={setNearbyPoiId}
          />

          <PoiScreenProjector pois={poiList} onUpdate={setScreenPois} />

          <SonarPulse position={subPosition} triggeredAt={sonarPulseAt} />
          <SonarCooldownUpdater
            cooldownUntil={sonarCooldownUntil}
            onUpdate={setSonarCooldownRemaining}
          />

          <Physics gravity={[0, -0.25, 0]}>
            <RigidBody type="fixed" colliders={false} position={[0, -3.2, 0]}>
              <CuboidCollider args={[120, 0.5, 120]} restitution={0.1} />
            </RigidBody>

            <RigidBody type="fixed" colliders={false} position={[0, 14, 0]}>
              <CuboidCollider args={[120, 0.5, 120]} restitution={0.1} />
            </RigidBody>

            <RigidBody type="fixed" colliders={false} position={[0, 0, -120]}>
              <CuboidCollider args={[120, 20, 0.5]} restitution={0.1} />
            </RigidBody>
            <RigidBody type="fixed" colliders={false} position={[0, 0, 120]}>
              <CuboidCollider args={[120, 20, 0.5]} restitution={0.1} />
            </RigidBody>
            <RigidBody type="fixed" colliders={false} position={[-120, 0, 0]}>
              <CuboidCollider args={[0.5, 20, 120]} restitution={0.1} />
            </RigidBody>
            <RigidBody type="fixed" colliders={false} position={[120, 0, 0]}>
              <CuboidCollider args={[0.5, 20, 120]} restitution={0.1} />
            </RigidBody>

            <SubmarineController
              modelUrl={modelUrl}
              nearbyPoiId={nearbyPoiId}
              onInteract={(poiId) => setActivePoiId(poiId)}
              onPositionChange={setSubPosition}
              onSonar={handleSonar}
              onTelemetry={setTelemetry}
            />
          </Physics>
        </Suspense>

        <UnderseaLightShafts />

        <OrbitControls enablePan={false} enableZoom={false} enabled={false} />
      </Canvas>

        <PoiHud
          pois={poiList}
          activePoiId={activePoiId}
          nearbyPoiId={nearbyPoiId}
          screenPois={screenPois}
        />

        <div className="pointer-events-none absolute bottom-6 right-8 z-40 rounded-2xl border border-white/10 bg-[#020410]/70 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur">
          <div className="flex items-center justify-between gap-6">
            <span className="text-white/50">Speed</span>
            <span>{telemetry.speed.toFixed(1)} m/s</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-6">
            <span className="text-white/50">Depth</span>
            <span>{telemetry.depth.toFixed(1)} m</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-6">
            <span className="text-white/50">Sonar</span>
            <span>{sonarCooldownRemaining > 0 ? `${sonarCooldownRemaining.toFixed(1)}s` : 'Ready'}</span>
          </div>
        </div>
    </div>
  );
}
