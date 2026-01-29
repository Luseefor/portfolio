'use client';

import { Html, useGLTF, useProgress } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type GLTFResult = {
  scene: THREE.Group;
};

interface SubmarineModelProps {
  modelUrl?: string;
  scale?: number;
  position?: [number, number, number];
}

function SubmarineLoader() {
  const { progress } = useProgress();
  const percentage = Math.min(100, Math.round(progress));

  return (
    <Html center>
      <div className="rounded-2xl border border-cyan-400/30 bg-[#020410]/80 px-6 py-4 text-xs font-mono text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.25)] backdrop-blur">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300/70">
          Submarine Sync
        </div>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-cyan-300/70">
          {percentage}%
        </div>
      </div>
    </Html>
  );
}

function SubmarineGLTF({ modelUrl, scale = 0.9, position = [0, -1.2, 0] }: SubmarineModelProps) {
  const { scene } = useGLTF(modelUrl || '/car.glb') as GLTFResult;
  const model = useMemo(() => scene.clone(), [scene]);

  const groupRef = useRef<THREE.Group>(null!);
  const propellersRef = useRef<THREE.Object3D[]>([]);
  const baseYRef = useRef(position[1]);

  useEffect(() => {
    const propellers: THREE.Object3D[] = [];
    model.traverse((child) => {
      const name = child.name.toLowerCase();
      if (/(propeller|rotor|fan|blade)/.test(name)) {
        propellers.push(child);
      }
    });
    propellersRef.current = propellers;
  }, [model]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = baseYRef.current + Math.sin(t * 0.8) * 0.15;
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
    }

    propellersRef.current.forEach((prop) => {
      prop.rotation.z += delta * 6;
    });
  });

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={[0, Math.PI, 0]}>
      <primitive object={model} />
    </group>
  );
}

export default function SubmarineModel(props: SubmarineModelProps) {
  if (!props.modelUrl) {
    return (
      <group position={props.position ?? [0, -1.2, 0]} rotation={[0, Math.PI, 0]}>
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.5, 2.5, 12, 24]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.2, -1.4]}>
          <coneGeometry args={[0.25, 0.6, 16]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.2, 1.4]}>
          <boxGeometry args={[0.2, 0.6, 0.6]} />
          <meshStandardMaterial color="#7dd3fc" roughness={0.6} metalness={0.3} />
        </mesh>
      </group>
    );
  }

  return (
    <Suspense fallback={<SubmarineLoader />}>
      <SubmarineGLTF {...props} />
    </Suspense>
  );
}
