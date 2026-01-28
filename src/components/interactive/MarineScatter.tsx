'use client';

import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

useGLTF.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

type GLTFResult = {
  scene: THREE.Group;
};

export interface MarineAsset {
  name: string;
  url: string;
  count: number;
  baseScale?: number;
  materialTint?: string;
}

interface Zone {
  center: THREE.Vector3;
  radius: number;
  minY: number;
  maxY: number;
}

const DEFAULT_ZONES: Zone[] = [
  { center: new THREE.Vector3(0, -1.6, 0), radius: 40, minY: -2.2, maxY: 1.4 },
  { center: new THREE.Vector3(-30, -1.4, -30), radius: 28, minY: -2.4, maxY: 0.6 },
  { center: new THREE.Vector3(26, -1.8, 24), radius: 24, minY: -2.6, maxY: 0.4 },
];

function randomPointInZone(zone: Zone) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * zone.radius;
  const x = zone.center.x + Math.cos(angle) * radius;
  const z = zone.center.z + Math.sin(angle) * radius;
  const y = THREE.MathUtils.lerp(zone.minY, zone.maxY, Math.random());
  return new THREE.Vector3(x, y, z);
}

function prepareMaterial(material: THREE.Material | THREE.Material[], tint?: string) {
  const target = Array.isArray(material) ? material[0] : material;
  if (target instanceof THREE.MeshStandardMaterial) {
    target.roughness = 0.9;
    target.metalness = 0.05;
    target.emissive = new THREE.Color('#0b2a4a');
    target.emissiveIntensity = 0.25;
    if (tint) {
      target.color = new THREE.Color(tint);
    }
    target.needsUpdate = true;
    return target;
  }

  return new THREE.MeshStandardMaterial({
    color: tint || '#4fc3f7',
    roughness: 0.9,
    metalness: 0.05,
    emissive: new THREE.Color('#0b2a4a'),
    emissiveIntensity: 0.25,
  });
}

function extractMesh(scene: THREE.Group) {
  let geometry: THREE.BufferGeometry | null = null;
  let material: THREE.Material | THREE.Material[] | null = null;

  scene.traverse((child) => {
    if (geometry || !(child instanceof THREE.Mesh)) return;
    geometry = child.geometry;
    material = child.material;
  });

  if (!geometry || !material) {
    geometry = new THREE.SphereGeometry(0.5, 16, 16);
    material = new THREE.MeshStandardMaterial({ color: '#4fc3f7' });
  }

  return { geometry: geometry.clone(), material };
}

function MarineInstancedAsset({ asset, zones }: { asset: MarineAsset; zones: Zone[] }) {
  const { scene } = useGLTF(asset.url) as GLTFResult;
  const { geometry, material } = useMemo(() => extractMesh(scene), [scene]);
  const instancedRef = useRef<THREE.InstancedMesh>(null);

  const transforms = useMemo(() => {
    const count = asset.count;
    return Array.from({ length: count }).map(() => {
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const position = randomPointInZone(zone);
      const rotation = new THREE.Euler(
        THREE.MathUtils.degToRad((Math.random() - 0.5) * 10),
        Math.random() * Math.PI * 2,
        THREE.MathUtils.degToRad((Math.random() - 0.5) * 10),
      );
      const scale = (asset.baseScale ?? 1) * THREE.MathUtils.lerp(0.6, 1.3, Math.random());
      return { position, rotation, scale };
    });
  }, [asset.baseScale, asset.count, zones]);

  useLayoutEffect(() => {
    if (!instancedRef.current) return;
    const dummy = new THREE.Object3D();
    transforms.forEach((transform, index) => {
      dummy.position.copy(transform.position);
      dummy.rotation.copy(transform.rotation);
      dummy.scale.setScalar(transform.scale);
      dummy.updateMatrix();
      instancedRef.current?.setMatrixAt(index, dummy.matrix);
    });
    instancedRef.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  const underwaterMaterial = useMemo(
    () => prepareMaterial(material, asset.materialTint),
    [material, asset.materialTint],
  );

  return (
    <instancedMesh
      ref={instancedRef}
      args={[geometry, underwaterMaterial, transforms.length]}
      castShadow
      receiveShadow
    />
  );
}

export default function MarineScatter({ assets = [], zones = DEFAULT_ZONES }: { assets?: MarineAsset[]; zones?: Zone[] }) {
  const validAssets = assets.filter((asset) => asset.url.trim().length > 0);

  if (validAssets.length === 0) return null;

  return (
    <group>
      {validAssets.map((asset) => (
        <MarineInstancedAsset key={asset.name} asset={asset} zones={zones} />
      ))}
    </group>
  );
}
