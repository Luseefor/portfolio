'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Float } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  GodRays,
  ToneMapping,
  HueSaturation,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import LoadingScreen from './LoadingScreen';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import SubmarineController from './SubmarineController';
import MarineScatter, { MarineAsset } from './MarineScatter';
import { PointOfInterest, PoiMarkers, ScreenPoi } from './PoiSystem';
import ZoneManager from '@/components/ZoneManager';
import EnvironmentInstances from '@/components/EnvironmentInstances';
import { POI_LIST, POIData, POIMarkersEnhanced } from '@/components/POIMarker';
import POIPanel from '@/ui/POIPanel';
import HUD from '@/ui/HUD';
import SettingsMenu from '@/ui/SettingsMenu';
import OffscreenIndicators, { ScreenPOI } from '@/ui/OffscreenIndicators';
import MobileFallback from '@/ui/MobileFallback';
import { updatePlayerState } from '@/lib/playerState';
import { getSettings, subscribeSettings } from '@/lib/settings';

/* -------------------------------------------------------------------------- */
/*                          Floating Dust Particles                          */
/* -------------------------------------------------------------------------- */
const DUST_PARTICLE_COUNT = 200;

function FloatingDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(DUST_PARTICLE_COUNT * 3);
    const vel = new Float32Array(DUST_PARTICLE_COUNT * 3);
    const spread = 50;
    for (let i = 0; i < DUST_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * spread;
      pos[i3 + 1] = Math.random() * 14 - 2;
      pos[i3 + 2] = (Math.random() - 0.5) * spread;
      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = Math.random() * 0.008 + 0.002;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return [pos, vel];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    const time = state.clock.elapsedTime;
    for (let i = 0; i < DUST_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      arr[i3] += velocities[i3] + Math.sin(time * 0.5 + i) * 0.0015;
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2] + Math.cos(time * 0.3 + i) * 0.0015;

      // Respawn at bottom when rising too high
      if (arr[i3 + 1] > 12) {
        arr[i3 + 1] = -2;
        arr[i3] = (Math.random() - 0.5) * 50;
        arr[i3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#b8e0f8"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Volumetric Fog Layer                            */
/* -------------------------------------------------------------------------- */
function VolumetricFogLayer() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#03224a') },
      uDensity: { value: 0.4 },
    }),
    [],
  );

  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    void main() {
      vUv = uv;
      vElevation = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uDensity;
    varying vec2 vUv;
    varying float vElevation;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv * 4.0 + uTime * 0.04;
      float n = fbm(uv);
      float alpha = n * uDensity * (1.0 - abs(vUv.y - 0.5) * 1.8);
      alpha = clamp(alpha, 0.0, 0.35);
      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 120, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Caustic Light Projection                         */
/* -------------------------------------------------------------------------- */
function CausticProjection() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScale: { value: 8.0 },
      uSpeed: { value: 0.25 },
      uIntensity: { value: 0.5 },
      uColor: { value: new THREE.Color('#7dd3fc') },
    }),
    [],
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uScale;
    uniform float uSpeed;
    uniform float uIntensity;
    uniform vec3 uColor;
    varying vec2 vUv;

    float caustic(vec2 uv, float time) {
      float c = 0.0;
      for (int i = 1; i <= 3; i++) {
        float fi = float(i);
        vec2 p = uv * uScale * fi + time * uSpeed;
        c += sin(p.x + sin(p.y * 1.2 + time)) * 0.5 + 0.5;
        c += sin(p.y + sin(p.x * 0.9 + time * 1.1)) * 0.5 + 0.5;
      }
      return c / 6.0;
    }

    void main() {
      float c1 = caustic(vUv, uTime);
      float c2 = caustic(vUv + 0.3, uTime * 1.15);
      float c = (c1 + c2) * 0.5;
      c = pow(c, 1.6) * uIntensity;
      gl_FragColor = vec4(uColor * c, c * 0.8);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

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
      <mesh ref={sunRef} position={[-4, 8, -12]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color="#a5d8ff" />
      </mesh>

      <EffectComposer multisampling={0}>
        {/* God rays from surface light */}
        <GodRays
          sun={sunRef}
          blendFunction={THREE.AdditiveBlending}
          density={0.4}
          decay={0.92}
          weight={0.4}
          exposure={0.15}
          samples={24}
        />

        {/* Subtle bloom for glowing effects */}
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.6}
        />

        {/* Underwater color grading - blue-cyan tint */}
        <HueSaturation hue={0.05} saturation={0.1} />
        <BrightnessContrast brightness={-0.02} contrast={0.06} />

        {/* Tone mapping for cinematic look */}
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

        {/* Vignette for focus */}
        <Vignette eskil={false} offset={0.15} darkness={0.6} />

        {/* Film grain */}
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
  // Reuse projection vector to avoid GC
  const projVec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const next = poiVectors.map(({ id, position }) => {
      projVec.copy(position).project(camera);
      const isOffscreen = projVec.z < 0 || Math.abs(projVec.x) > 1 || Math.abs(projVec.y) > 1;

      const clampedX = THREE.MathUtils.clamp(projVec.x, -0.9, 0.9);
      const clampedY = THREE.MathUtils.clamp(projVec.y, -0.9, 0.9);

      const screenX = ((isOffscreen ? clampedX : projVec.x) * 0.5 + 0.5) * size.width;
      const screenY = (-(isOffscreen ? clampedY : projVec.y) * 0.5 + 0.5) * size.height;

      const angle = Math.atan2(projVec.y, projVec.x);
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
  const [screenPois, setScreenPois] = useState<ScreenPOI[]>([]);
  const [sonarPulseAt, setSonarPulseAt] = useState<number | null>(null);
  const [sonarCooldownUntil, setSonarCooldownUntil] = useState(0);
  const [highlightedPoiIds, setHighlightedPoiIds] = useState<string[]>([]);
  const [telemetry, setTelemetry] = useState({ speed: 0, depth: 0 });
  const [sonarCooldownRemaining, setSonarCooldownRemaining] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentObjective, setCurrentObjective] = useState<POIData | null>(POI_LIST[0] || null);

  // Sync player state for Agent B components
  useEffect(() => {
    updatePlayerState({
      position: { x: subPosition.x, y: subPosition.y, z: subPosition.z },
      speed: telemetry.speed,
      depth: telemetry.depth,
    });
  }, [subPosition, telemetry]);

  // ESC key handler for settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePoiId) {
          setActivePoiId(null);
        } else {
          setSettingsOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePoiId]);

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

  // Use enhanced POI data model
  const poiList = POI_LIST;

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

        {/* Caustic lighting from above */}
        <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.6}>
          <CausticLight />
        </Float>

        {/* Procedural caustics on ocean floor */}
        <CausticProjection />

        {/* Floating dust particles */}
        <FloatingDust />

        {/* Volumetric fog layer */}
        <VolumetricFogLayer />

        <Suspense fallback={null}>
          <Stars radius={80} depth={40} count={1200} factor={2.5} fade speed={0.4} />
          <OceanFloor />
          <MarineScatter assets={marineAssets} />
          
          {/* Zone streaming manager */}
          <ZoneManager playerPosition={{ x: subPosition.x, y: subPosition.y, z: subPosition.z }} />
          
          {/* Procedural environment instances (rocks, coral, seaweed) */}
          <EnvironmentInstances />
          
          {/* Enhanced POI markers */}
          <POIMarkersEnhanced
            pois={poiList}
            highlightedIds={highlightedSet}
            activePoiId={activePoiId}
            nearbyPoiId={nearbyPoiId}
          />

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

      {/* Mobile fallback */}
      <MobileFallback onPoiSelect={(poi) => setActivePoiId(poi.id)} />

      {/* Offscreen POI indicators */}
      <OffscreenIndicators screenPois={screenPois} activePoiId={activePoiId} />

      {/* Premium HUD */}
      <HUD
        speed={telemetry.speed}
        depth={telemetry.depth}
        sonarCooldown={sonarCooldownRemaining}
        currentObjective={currentObjective}
        nearbyPoi={nearbyPoiId ? poiList.find((p) => p.id === nearbyPoiId) || null : null}
      />

      {/* POI Detail Panel */}
      <POIPanel
        poi={activePoiId ? poiList.find((p) => p.id === activePoiId) || null : null}
        onClose={() => setActivePoiId(null)}
      />

      {/* Settings Menu */}
      <SettingsMenu isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
