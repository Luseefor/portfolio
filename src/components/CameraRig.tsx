'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { movementTuning } from '@/constants/movement';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';

const tempPosition = new Vector3();
const tempForward = new Vector3();

export default function CameraRig({
  targetOffset = new Vector3(0, 0, 0),
}: {
  targetOffset?: Vector3;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<ReturnType<typeof OrbitControls> | null>(null);
  const [freeLook, setFreeLook] = useState(false);
  const playerPosition = usePlayerState(playerStateSelectors.position);
  const playerForward = usePlayerState(playerStateSelectors.forward);

  const followOffset = useMemo(
    () => new Vector3(0, movementTuning.followHeight, movementTuning.followDistance),
    []
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === 'KeyC') {
        setFreeLook((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useFrame((_, delta) => {
    tempPosition.set(playerPosition.x, playerPosition.y, playerPosition.z);
    tempForward.set(playerForward.x, playerForward.y, playerForward.z).normalize();

    const desired = tempPosition
      .clone()
      .add(targetOffset)
      .add(tempForward.clone().multiplyScalar(-followOffset.z))
      .add(new Vector3(0, followOffset.y, 0));

    if (!freeLook) {
      camera.position.lerp(desired, 1 - Math.pow(0.001, delta));
      camera.lookAt(tempPosition.clone().add(targetOffset));
    } else if (controlsRef.current) {
      controlsRef.current.target.copy(tempPosition.clone().add(targetOffset));
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={freeLook}
      enablePan={false}
      enableZoom={false}
      rotateSpeed={0.6}
    />
  );
}
