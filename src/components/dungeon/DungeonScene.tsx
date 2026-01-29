'use client';

import { useGLTF } from '@react-three/drei';
import { MeshCollider, Physics, RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import { Color, type Group } from 'three';
import PlayerController from '@/components/dungeon/PlayerController';
import CameraRig from '@/components/dungeon/CameraRig';
import DungeonAmbience from '@/components/dungeon/DungeonAmbience';

const FOG_COLOR = new Color('#1b1410');

export default function DungeonScene() {
  const { scene } = useGLTF('/models/dungeon/structure/Modular Ruins Pack.glb');
  const playerRef = useRef<Group>(null);

  return (
    <group>
      <color attach="background" args={['#0b0908']} />
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.045]} />

      <ambientLight intensity={0.25} color="#f2d5a6" />
      <directionalLight position={[8, 12, 6]} intensity={0.5} color="#ffe4b5" />

      <pointLight position={[4, 3, -2]} intensity={2.2} color="#ffb35c" distance={18} />
      <pointLight position={[-5, 3, 4]} intensity={1.8} color="#ff9f5a" distance={16} />
      <pointLight position={[0, 3, 8]} intensity={1.6} color="#ffbf75" distance={16} />
      <DungeonAmbience />

      <Physics gravity={[0, -25, 0]}>
        <RigidBody type="fixed" colliders={false}>
          <MeshCollider type="trimesh">
            <primitive object={scene} position={[0, -1.5, 0]} />
          </MeshCollider>
        </RigidBody>

        <RigidBody type="fixed" colliders="cuboid">
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#2a1f19" roughness={0.95} />
          </mesh>
        </RigidBody>

        <PlayerController playerRef={playerRef} />
      </Physics>

      <CameraRig target={playerRef} />
    </group>
  );
}

useGLTF.preload('/models/dungeon/structure/Modular Ruins Pack.glb');
