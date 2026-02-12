'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { AudioListener, Color } from 'three';
import { Physics, type RapierRigidBody } from '@react-three/rapier';
import { useThree } from '@react-three/fiber';
import PlayerController from './PlayerController';
import CameraRig from './CameraRig';
import DungeonAmbience from './DungeonAmbience';
import DungeonWorld from './DungeonWorld';

const FOG_COLOR = new Color('#060810');

export default function DungeonScene() {
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const [playerBody, setPlayerBody] = useState<RapierRigidBody | null>(null);
  const { camera } = useThree();
  const listenerRef = useRef<AudioListener | null>(null);

  useEffect(() => {
    if (!listenerRef.current) {
      listenerRef.current = new AudioListener();
    }
    const listener = listenerRef.current;
    camera.add(listener);

    camera.far = 120;
    camera.near = 0.1;
    camera.updateProjectionMatrix();

    return () => {
      camera.remove(listener);
    };
  }, [camera]);

  /* ── Dev: Full Bright Mode (Toggle with 'L') ── */
  const [fullBright, setFullBright] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyL') setFullBright((prev: boolean) => !prev);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <group>
      <color attach="background" args={[fullBright ? '#111' : '#030406']} />
      <fogExp2 attach="fog" args={[FOG_COLOR, fullBright ? 0 : 0.035]} />

      {/* ── Global base light — dim vs full bright ── */}
      <ambientLight intensity={fullBright ? 0.8 : 0.08} color="#8899aa" />
      <hemisphereLight
        intensity={fullBright ? 1.0 : 0.12}
        color="#667788"
        groundColor="#111111"
      />

      {/* ── Key directional light — primary shadow caster ── */}
      <directionalLight
        position={[10, 18, 8]}
        intensity={0.35}
        color="#ddc8a0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={2}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.002}
      />

      {/* ── Fill light from opposite side — prevents total blackout ── */}
      <directionalLight
        position={[-8, 12, -6]}
        intensity={0.1}
        color="#6688aa"
        castShadow={false}
      />

      {/* ── Room anchor lights — warm pools at key positions ── */}
      <pointLight position={[0, 4, 0]} intensity={3.0} color="#ff9944" distance={18} decay={2} />
      <pointLight position={[0, 4, 56]} intensity={4.0} color="#ffaa55" distance={24} decay={2} />
      <pointLight position={[52, 4, 0]} intensity={2.5} color="#ff8833" distance={16} decay={2} />
      <pointLight position={[56, 4, 56]} intensity={2.0} color="#8899cc" distance={16} decay={2} />
      <pointLight position={[-50, 4, 56]} intensity={1.5} color="#99bbff" distance={14} decay={2} />

      {/* ── Corridor accent lights ── */}
      <pointLight position={[0, 3, 28]} intensity={1.8} color="#ff9944" distance={12} decay={2} />
      <pointLight position={[28, 3, 0]} intensity={1.5} color="#ff8833" distance={10} decay={2} />
      <pointLight position={[34, 3, 56]} intensity={1.5} color="#ff9944" distance={10} decay={2} />

      <Suspense fallback={null}>
        <DungeonAmbience />
      </Suspense>

      <Physics gravity={[0, -24, 0]}>
        <Suspense fallback={null}>
          <DungeonWorld />
        </Suspense>
        <CameraRig targetBody={playerBody ?? playerBodyRef} />
        <PlayerController
          bodyRef={playerBodyRef}
          onBodyReady={(body) => {
            if (playerBodyRef.current !== body) {
              playerBodyRef.current = body;
            }
            setPlayerBody(body);
          }}
        />
      </Physics>
    </group>
  );
}
