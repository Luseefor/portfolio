'use client';

import { Color, Vector3 } from 'three';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import CameraRig from '@/components/CameraRig';
import PhysicsWorld from '@/components/PhysicsWorld';
import SubmarineController from '@/components/SubmarineController';
import WorldBounds from '@/components/WorldBounds';
import { defaultQuality } from '@/constants/quality';
import ParticlesField from '@/effects/ParticlesField';

const fogColor = new Color('#0b2a39');
const waterColor = new Color('#031724');

export default function Scene() {
  return (
    <>
      <color attach="background" args={[waterColor]} />
      <fogExp2 attach="fog" args={[fogColor, 0.035]} />

      <ambientLight intensity={0.55} color="#7de3ff" />
      <directionalLight
        position={[12, 18, 8]}
        intensity={1.1}
        color="#bff3ff"
        castShadow={false}
      />
      <directionalLight position={[-14, -6, -6]} intensity={0.25} color="#0d6c85" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -18, 0]}>
        <planeGeometry args={[400, 400, 1, 1]} />
        <meshStandardMaterial color="#052a36" roughness={0.9} metalness={0} />
      </mesh>

      <ParticlesField quality={defaultQuality} />

      <PhysicsWorld>
        <WorldBounds />
        <SubmarineController quality={defaultQuality} />
      </PhysicsWorld>

      <CameraRig targetOffset={new Vector3(0, 1.5, 0)} />

      <EffectComposer multisampling={0}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Bloom intensity={0.18} luminanceThreshold={0.5} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.15} darkness={0.7} />
      </EffectComposer>
    </>
  );
}
