'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Float } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, Noise, GodRays } from '@react-three/postprocessing';
import LoadingScreen from './LoadingScreen';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import SubmarineController from './SubmarineController';
import MarineScatter, { MarineAsset } from './MarineScatter';

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

export default function InteractiveCanvas() {
  const modelUrl = process.env.NEXT_PUBLIC_INTERACTIVE_MODEL_URL || '';
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

            <SubmarineController modelUrl={modelUrl} />
          </Physics>
        </Suspense>

        <UnderseaLightShafts />

        <OrbitControls enablePan={false} enableZoom={false} enabled={false} />
      </Canvas>
    </div>
  );
}
