'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { Mesh, type Group } from 'three';

export type PlayerAnimation = 'idle' | 'walk' | 'run';

function pickClipName(names: string[], state: PlayerAnimation) {
  const lowered = names.map((name) => name.toLowerCase());
  const idleIndex = lowered.findIndex((name) => name.includes('idle'));
  const walkIndex = lowered.findIndex((name) => name.includes('walk'));
  const runIndex = lowered.findIndex((name) => name.includes('run'));

  if (state === 'run' && runIndex >= 0) return names[runIndex];
  if (state === 'walk' && walkIndex >= 0) return names[walkIndex];
  if (idleIndex >= 0) return names[idleIndex];
  return names[0];
}

export default function PlayerCharacter({
  animation = 'idle',
}: {
  animation?: PlayerAnimation;
}) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF('/models/dungeon/character/character.glb');
  const { actions, names } = useAnimations(animations, group);

  const clipName = useMemo(() => pickClipName(names, animation), [names, animation]);

  useEffect(() => {
    const action = clipName ? actions[clipName] : undefined;
    if (!action) return;
    action.reset().fadeIn(0.2).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, clipName]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group ref={group} scale={1.1}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/dungeon/character/character.glb');
