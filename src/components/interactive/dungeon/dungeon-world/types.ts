import type { Object3D } from 'three';
import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';

export type BorderSegment = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
};

export type UnitSegment = {
  orientation: 'h' | 'v';
  fixed: number;
  start: number;
  end: number;
  y: number;
};

export type FloorVisual = {
  piece: DungeonBuildPiece;
  object: Object3D | null;
};

export type CeilingVisual = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  object: Object3D | null;
};

export type WallPanel = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  axis: 'x' | 'z';
};

export type WallVisual = WallPanel & { object: Object3D | null };

export type WallBackerVisual = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  object: Object3D | null;
};

export type BushVisual = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
  object: Object3D | null;
};

export type TorchVisual = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
  object: Object3D | null;
  glowColor: string;
  baseIntensity: number;
  wallFillIntensity: number;
  wallGlowOpacity: number;
  distance: number;
  flickerSeed: number;
  lightTarget: Object3D;
};

export type PotVisual = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
  brokenHeight: number;
  intactObject: Object3D | null;
  brokenObject: Object3D | null;
};

export type AmbientPropVisual = {
  id: string;
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
  object: Object3D | null;
};

export type WallCollisionBox = {
  centerX: number;
  centerZ: number;
  halfX: number;
  halfZ: number;
};
