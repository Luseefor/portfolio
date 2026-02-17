import type { MutableRefObject } from 'react';
import type { RapierContext, RapierRigidBody } from '@react-three/rapier';

export type ThirdPersonCameraOptions = {
  targetBody?: MutableRefObject<RapierRigidBody | null>;
  yawRef?: MutableRefObject<number>;
  pitchRef?: MutableRefObject<number>;
};

export type PointerDragState = {
  active: boolean;
  x: number;
  y: number;
  hasPoint: boolean;
};

export type Vec3Like = {
  x: number;
  y: number;
  z: number;
};

export type RapierRayFactory = {
  Ray: RapierContext['rapier']['Ray'];
};

export type RapierWorld = RapierContext['world'];
