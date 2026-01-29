'use client';

import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { MutableRefObject } from 'react';
import { useMemo, useRef } from 'react';
import { Group, Mesh } from 'three';

export default function Submarine({
  speed = 0,
  speedRef,
}: {
  speed?: number;
  speedRef?: MutableRefObject<number>;
}) {
  const groupRef = useRef<Group>(null);
  const floatRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/submarine.glb');

  const propeller = useMemo(() => {
    let prop: Mesh | null = null;
    scene.traverse((child) => {
      if (child instanceof Mesh && /prop|propeller|rotor/i.test(child.name)) {
        prop = child;
      }
    });
    return prop;
  }, [scene]);

  useFrame(({ clock }, delta) => {
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.08;
      floatRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.02;
    }

    const spinSpeed = speedRef?.current ?? speed;
    if (propeller) {
      propeller.rotation.z += delta * (2.5 + Math.abs(spinSpeed) * 0.6);
    }
  });

  return (
    <group ref={groupRef} scale={0.9}>
      <group ref={floatRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.preload('/models/submarine.glb');
