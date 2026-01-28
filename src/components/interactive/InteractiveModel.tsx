'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

type GLTFResult = {
  scene: THREE.Group;
};

interface InteractiveModelProps {
  modelUrl?: string;
}

const defaultModelUrl = '/car.glb';

export default function InteractiveModel({ modelUrl = defaultModelUrl }: InteractiveModelProps) {
  const { scene } = useGLTF(modelUrl) as GLTFResult;

  const model = useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={model}
      scale={0.9}
      position={[0, -1.2, 0]}
      rotation={[0, Math.PI, 0]}
    />
  );
}

useGLTF.preload(defaultModelUrl);
