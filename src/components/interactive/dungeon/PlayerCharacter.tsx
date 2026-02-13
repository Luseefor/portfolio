'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { LoopOnce, LoopRepeat, Mesh, type Group } from 'three';

export type PlayerAnimation = 'idle' | 'walk' | 'run' | 'jump' | 'roll' | 'dash' | 'attack';

const CLIP_PATTERNS: Record<PlayerAnimation, RegExp[]> = {
  idle: [/idle/i, /breath/i, /stand/i],
  walk: [/walk/i, /walkforward/i, /walk_fwd/i],
  run: [/run/i, /sprint/i, /jog/i],
  jump: [/jump/i, /leap/i, /recievehit/i, /receivehit/i],
  roll: [/roll/i, /dodge/i],
  dash: [/dash/i, /quick/i, /quickstep/i, /slide/i],
  attack: [/dagger[_\s]?attack2/i, /dagger[_\s]?attack/i, /punch/i, /attack/i],
};

function pickClipName(names: string[], state: PlayerAnimation) {
  const lowered = names.map((name) => name.toLowerCase());
  const isAttackIdle = (name: string) => name.includes('attack') && name.includes('idle');

  const findByPatterns = (patterns: RegExp[], avoidAttackIdle = false) => {
    const match = (name: string) =>
      patterns.some((pattern) => pattern.test(name)) &&
      (!avoidAttackIdle || !isAttackIdle(name));

    const armatureIdx = lowered.findIndex(
      (name) => name.includes('characterarmature|') && match(name),
    );
    if (armatureIdx >= 0) return names[armatureIdx];

    const idx = lowered.findIndex(match);
    return idx >= 0 ? names[idx] : null;
  };

  if (state === 'jump') {
    const jumpClip = findByPatterns(CLIP_PATTERNS.jump);
    if (jumpClip) return jumpClip;
  }
  if (state === 'roll') {
    const rollClip = findByPatterns(CLIP_PATTERNS.roll);
    if (rollClip) return rollClip;
  }
  if (state === 'dash') {
    const dashClip = findByPatterns(CLIP_PATTERNS.dash);
    if (dashClip) return dashClip;
    const runClip = findByPatterns(CLIP_PATTERNS.run);
    if (runClip) return runClip;
    const rollClip = findByPatterns(CLIP_PATTERNS.roll);
    if (rollClip) return rollClip;
  }
  if (state === 'attack') {
    const attackClip = findByPatterns(CLIP_PATTERNS.attack, true);
    if (attackClip) return attackClip;
    const punchClip = findByPatterns([/punch/i], true);
    if (punchClip) return punchClip;
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
  const loggedAnimationsRef = useRef(false);

  const clipName = useMemo(() => pickClipName(names, animation), [names, animation]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (loggedAnimationsRef.current) return;
    if (!names.length) return;
    loggedAnimationsRef.current = true;
    console.info('[PlayerCharacter] animation clips', names);
  }, [names]);

  useEffect(() => {
    const action = clipName ? actions[clipName] : undefined;
    if (!action) return;
    const isOneShot = animation === 'jump' || animation === 'roll' || animation === 'dash' || animation === 'attack';
    Object.values(actions).forEach((other) => {
      if (other && other !== action) {
        other.fadeOut(0.15);
      }
    });
    action.clampWhenFinished = isOneShot;
    action.setLoop(isOneShot ? LoopOnce : LoopRepeat, isOneShot ? 1 : Infinity);
    action.reset().fadeIn(0.15).play();
    if (animation === 'dash') action.timeScale = 1.45;
    else if (animation === 'attack') action.timeScale = 1.2;
    else if (animation === 'roll') action.timeScale = 1.2;
    else if (animation === 'run') action.timeScale = 1.25;
    else if (animation === 'walk') action.timeScale = 1.05;
    else action.timeScale = 1.0;
    return () => {
      action.fadeOut(0.15);
    };
  }, [actions, animation, clipName]);

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
