'use client';

import type { MutableRefObject } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import { useThirdPersonCamera } from './useThirdPersonCamera';

export type CameraControllerProps = {
  targetBody?: MutableRefObject<RapierRigidBody | null>;
  yawRef?: MutableRefObject<number>;
  pitchRef?: MutableRefObject<number>;
};

export default function CameraController({ targetBody, yawRef, pitchRef }: CameraControllerProps) {
  useThirdPersonCamera({ targetBody, yawRef, pitchRef });
  return null;
}
