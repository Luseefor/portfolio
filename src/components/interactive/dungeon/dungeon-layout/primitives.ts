import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three';
import {
  DUNGEON_COLUMN_HEIGHT,
  DUNGEON_COLUMN_RADIUS,
  DUNGEON_FLOOR_THICKNESS,
  DUNGEON_TILE_SIZE,
  DUNGEON_WALL_HEIGHT,
  DUNGEON_WALL_THICKNESS,
} from '@/constants/dungeonLayout';

const floorGeometry = new BoxGeometry(DUNGEON_TILE_SIZE, DUNGEON_FLOOR_THICKNESS, DUNGEON_TILE_SIZE);
const wallGeometry = new BoxGeometry(DUNGEON_TILE_SIZE, DUNGEON_WALL_HEIGHT, DUNGEON_WALL_THICKNESS);
export const ceilingGeometry = new BoxGeometry(DUNGEON_TILE_SIZE, DUNGEON_FLOOR_THICKNESS, DUNGEON_TILE_SIZE);
const columnGeometry = new CylinderGeometry(
  DUNGEON_COLUMN_RADIUS,
  DUNGEON_COLUMN_RADIUS,
  DUNGEON_COLUMN_HEIGHT,
  12,
);
const propGeometry = new BoxGeometry(
  DUNGEON_TILE_SIZE * 0.4,
  DUNGEON_TILE_SIZE * 0.5,
  DUNGEON_TILE_SIZE * 0.4,
);

const floorMaterial = new MeshStandardMaterial({ color: '#2a2b28', roughness: 0.95, metalness: 0.0 });
const wallMaterial = new MeshStandardMaterial({ color: '#3a332e', roughness: 0.9, metalness: 0.05 });
export const ceilingMaterial = new MeshStandardMaterial({ color: '#242320', roughness: 0.95, metalness: 0.0 });
const columnMaterial = new MeshStandardMaterial({ color: '#4a433a', roughness: 0.85, metalness: 0.05 });
const propMaterial = new MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.8, metalness: 0.05 });

function isFloorKey(key: string) {
  return key.startsWith('Floor');
}

function isWallKey(key: string) {
  return (
    key.startsWith('Wall') ||
    key.startsWith('Arch') ||
    key.startsWith('Doors') ||
    key.startsWith('Window')
  );
}

function isColumnKey(key: string) {
  return key.startsWith('Column') || key.startsWith('Pillar');
}

export function getPrimitiveSpec(key: string) {
  if (isFloorKey(key)) {
    return {
      geometry: floorGeometry,
      material: floorMaterial,
      yOffset: -DUNGEON_FLOOR_THICKNESS / 2,
      isFloor: true,
    };
  }
  if (isWallKey(key)) {
    return { geometry: wallGeometry, material: wallMaterial, yOffset: DUNGEON_WALL_HEIGHT / 2, isFloor: false };
  }
  if (isColumnKey(key)) {
    return {
      geometry: columnGeometry,
      material: columnMaterial,
      yOffset: DUNGEON_COLUMN_HEIGHT / 2,
      isFloor: false,
    };
  }
  return {
    geometry: propGeometry,
    material: propMaterial,
    yOffset: (DUNGEON_TILE_SIZE * 0.5) / 2,
    isFloor: false,
  };
}
