'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, type RefObject } from 'react';
import { Quaternion, Vector3, type Group } from 'three';

const targetPosition = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const desiredPosition = new Vector3();
const offset = new Vector3(0.8, 2.6, 5.8);
const rotation = new Quaternion();

export default function CameraRig({
  target,
}: {
  target: RefObject<Group>;
}) {
  const { camera } = useThree();
  const up = useMemo(() => new Vector3(0, 1, 0), []);

  useFrame((_, delta) => {
    const targetGroup = target.current;
    if (!targetGroup) return;

    targetGroup.getWorldPosition(targetPosition);
    targetGroup.getWorldQuaternion(rotation);

    forward.set(0, 0, 1).applyQuaternion(rotation).normalize();
    right.set(1, 0, 0).applyQuaternion(rotation).normalize();

    desiredPosition
      .copy(targetPosition)
      .add(forward.clone().multiplyScalar(-offset.z))
      .add(right.clone().multiplyScalar(offset.x))
      .add(up.clone().multiplyScalar(offset.y));

    camera.position.lerp(desiredPosition, 1 - Math.pow(0.001, delta));
    camera.lookAt(targetPosition.x, targetPosition.y + 1.2, targetPosition.z);

    if (camera.position.y < targetPosition.y + 1) {
      camera.position.y = targetPosition.y + 1;
    }
  });

  return null;
}
