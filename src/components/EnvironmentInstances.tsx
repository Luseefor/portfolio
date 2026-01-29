'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { getSettings, QualityLevel, getQualityConfig } from '@/lib/settings';

interface InstancedPropsConfig {
  type: 'rock' | 'coral' | 'seaweed';
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  spreadRadius: number;
  minY: number;
  maxY: number;
  baseScale: number;
  scaleVariance: number;
}

// Seeded random for stable transforms
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateTransforms(
  config: InstancedPropsConfig,
  seed: number,
  densityMultiplier: number,
): THREE.Matrix4[] {
  const count = Math.floor(config.count * densityMultiplier);
  const matrices: THREE.Matrix4[] = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const s = seed + i * 1337;
    const angle = seededRandom(s) * Math.PI * 2;
    const radius = Math.sqrt(seededRandom(s + 1)) * config.spreadRadius;
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = THREE.MathUtils.lerp(config.minY, config.maxY, seededRandom(s + 2));
    
    const rotY = seededRandom(s + 3) * Math.PI * 2;
    const rotX = (seededRandom(s + 4) - 0.5) * 0.3;
    const rotZ = (seededRandom(s + 5) - 0.5) * 0.3;
    
    const scale = config.baseScale + (seededRandom(s + 6) - 0.5) * config.scaleVariance;

    dummy.position.set(x, y, z);
    dummy.rotation.set(rotX, rotY, rotZ);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    matrices.push(dummy.matrix.clone());
  }

  return matrices;
}

function RockInstances({ quality }: { quality: QualityLevel }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const densityMultiplier = getQualityConfig(quality).instanceDensity;

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: '#2a4a5a',
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });
    return { geometry: geo, material: mat };
  }, []);

  const matrices = useMemo(() => {
    return generateTransforms(
      {
        type: 'rock',
        count: 80,
        geometry,
        material,
        spreadRadius: 60,
        minY: -2.5,
        maxY: -2.0,
        baseScale: 0.8,
        scaleVariance: 0.6,
      },
      42,
      densityMultiplier,
    );
  }, [geometry, material, densityMultiplier]);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((matrix, i) => {
      meshRef.current?.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, matrices.length]}
      castShadow
      receiveShadow
    />
  );
}

function CoralInstances({ quality }: { quality: QualityLevel }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const densityMultiplier = getQualityConfig(quality).instanceDensity;

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.3, 1.2, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: '#e85d75',
      roughness: 0.85,
      metalness: 0.0,
      emissive: '#4a1a2a',
      emissiveIntensity: 0.15,
    });
    return { geometry: geo, material: mat };
  }, []);

  const matrices = useMemo(() => {
    return generateTransforms(
      {
        type: 'coral',
        count: 50,
        geometry,
        material,
        spreadRadius: 45,
        minY: -2.4,
        maxY: -1.8,
        baseScale: 0.6,
        scaleVariance: 0.4,
      },
      1234,
      densityMultiplier,
    );
  }, [geometry, material, densityMultiplier]);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((matrix, i) => {
      meshRef.current?.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, matrices.length]}
      castShadow
      receiveShadow
    />
  );
}

function SeaweedInstances({ quality }: { quality: QualityLevel }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const densityMultiplier = getQualityConfig(quality).instanceDensity;

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.05, 0.08, 1.5, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: '#2d5a3d',
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    return { geometry: geo, material: mat };
  }, []);

  const matrices = useMemo(() => {
    return generateTransforms(
      {
        type: 'seaweed',
        count: 100,
        geometry,
        material,
        spreadRadius: 50,
        minY: -2.4,
        maxY: -1.6,
        baseScale: 1.0,
        scaleVariance: 0.5,
      },
      9999,
      densityMultiplier,
    );
  }, [geometry, material, densityMultiplier]);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((matrix, i) => {
      meshRef.current?.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, matrices.length]}
      castShadow
      receiveShadow
    />
  );
}

export default function EnvironmentInstances() {
  const [quality, setQuality] = useState<QualityLevel>('medium');

  useEffect(() => {
    setQuality(getSettings().quality);
  }, []);

  return (
    <group name="environment-instances">
      <RockInstances quality={quality} />
      <CoralInstances quality={quality} />
      <SeaweedInstances quality={quality} />
    </group>
  );
}
