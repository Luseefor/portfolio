'use client';

import { useRef, type MutableRefObject } from 'react';
import { useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Suspense } from 'react';
import PlayerCharacter from './PlayerCharacter';
import { START_POSITION } from './player-controller/constants';
import { usePlayerControllerFrame } from './player-controller/usePlayerControllerFrame';
import { usePlayerControllerRuntimeState } from './player-controller/usePlayerControllerRuntimeState';
import { usePlayerState } from '@/lib/playerState';
import { useSettings } from '@/lib/settings';

export default function PlayerController({
  bodyRef,
  cameraYawRef,
}: {
  bodyRef?: MutableRefObject<RapierRigidBody | null>;
  cameraYawRef?: MutableRefObject<number>;
}) {
  const internalBodyRef = useRef<RapierRigidBody | null>(null);
  const rigidBodyRef = bodyRef ?? internalBodyRef;
  const { camera } = useThree();
  const { rapier, world } = useRapier();
  const setPlayerState = usePlayerState((state) => state._setPlayerState);
  const masterVolume = useSettings((state) => state.masterVolume);
  const runtime = usePlayerControllerRuntimeState(camera, masterVolume);
  const { animation, characterRootRef } = runtime;

  usePlayerControllerFrame({
    rigidBodyRef,
    camera,
    cameraYawRef,
    rapier,
    world,
    masterVolume,
    setPlayerState,
    runtime,
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={START_POSITION}
      colliders={false}
      ccd
      enabledRotations={[false, false, false]}
      linearDamping={0.2}
      angularDamping={0.2}
    >
      <CapsuleCollider args={[0.8, 0.35]} position={[0, 1.1, 0]} />
      <group ref={characterRootRef}>
        <Suspense
          fallback={
            <mesh position={[0, 1.1, 0]}>
              <capsuleGeometry args={[0.35, 1.6, 6, 12]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          }
        >
          <PlayerCharacter animation={animation} />
        </Suspense>
      </group>
    </RigidBody>
  );
}
