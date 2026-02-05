'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { Mesh, type Group } from 'three';

export type PlayerAnimation = 'idle' | 'walk' | 'run' | 'jump';

const CLIP_PATTERNS: Record<PlayerAnimation, RegExp[]> = {
  idle: [/idle/i, /breath/i, /stand/i],
  walk: [/walk/i, /walkforward/i, /walk_fwd/i],
  run: [/run/i, /sprint/i, /jog/i],
  jump: [/jump/i, /leap/i],
};

function pickClipName(names: string[], state: PlayerAnimation) {
  const lowered = names.map((name) => name.toLowerCase());
  const isAttackIdle = (name: string) => name.includes('attack') && name.includes('idle');

  const findByPatterns = (patterns: RegExp[], avoidAttackIdle = false) => {
    const idx = lowered.findIndex((name) =>
      patterns.some((pattern) => pattern.test(name)) &&
      (!avoidAttackIdle || !isAttackIdle(name)),
    );
    return idx >= 0 ? names[idx] : null;
  };

  if (state === 'jump') {
    const jumpClip = findByPatterns(CLIP_PATTERNS.jump);
    if (jumpClip) return jumpClip;
  }
  if (state === 'run') {
    const runClip = findByPatterns(CLIP_PATTERNS.run);
    if (runClip) return runClip;
  }
  if (state === 'walk') {
    const walkClip = findByPatterns(CLIP_PATTERNS.walk);
    if (walkClip) return walkClip;
  }

  const idleClip = findByPatterns(CLIP_PATTERNS.idle, true);
  if (idleClip) return idleClip;

  const attackIdle = findByPatterns([/attack.*idle/i]);
  if (attackIdle) return attackIdle;

  return names[0];
}

export default function PlayerCharacter({ animation = 'idle' }: { animation?: PlayerAnimation }) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF('/models/dungeon/character/character.glb');
  const { actions, names } = useAnimations(animations, group);

  const clipName = useMemo(() => pickClipName(names, animation), [names, animation]);

  useEffect(() => {
    if (names.length === 0) return;
    // Print available clips and current mapping decisions
    console.groupCollapsed('[PlayerCharacter] Animation clips');
    console.table(names.map((name) => ({ name })));
    (['idle', 'walk', 'run', 'jump'] as PlayerAnimation[]).forEach((state) => {
      console.log(`${state} ->`, pickClipName(names, state));
    });
    console.groupEnd();
  }, [names]);

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
