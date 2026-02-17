import { Box3, DoubleSide, Material, Mesh, Object3D, Vector3 } from 'three';
import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';
import {
  FLOOR_UNDERLAY_DROP,
  FLOOR_UNDERLAY_EXPAND,
  FLOOR_UNDERLAY_THICKNESS,
  SPAWN_UNDERLAY_DROP,
  SPAWN_UNDERLAY_EXPAND,
  SPAWN_UNDERLAY_THICKNESS,
  WALL_BORDER_Y,
} from './constants';
import { corridorMaterial, floorMaterial, spawnMaterial } from './materials';

function sanitizeSize(value: number) {
  return Number.isFinite(value) && value > 0.0001 ? value : 1;
}

function cloneMaterialDoubleSided(material: Material) {
  const cloned = material.clone();
  cloned.side = DoubleSide;
  return cloned;
}

export function topOverlayY() {
  // Use a single plane for all debug borders to avoid stacked stripe artifacts.
  return WALL_BORDER_Y;
}

export function materialForFloor(piece: DungeonBuildPiece) {
  if (piece.kind === 'spawn-platform') return spawnMaterial;
  if (piece.kind === 'corridor-floor') return corridorMaterial;
  return floorMaterial;
}

export function underlaySpecForFloor(piece: DungeonBuildPiece) {
  if (piece.kind === 'spawn-platform') {
    return { thickness: SPAWN_UNDERLAY_THICKNESS, expand: SPAWN_UNDERLAY_EXPAND, drop: SPAWN_UNDERLAY_DROP };
  }
  return { thickness: FLOOR_UNDERLAY_THICKNESS, expand: FLOOR_UNDERLAY_EXPAND, drop: FLOOR_UNDERLAY_DROP };
}

export function markFloorMeshForShadows(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.castShadow = false;
    child.receiveShadow = true;
  });
}

export function setObjectMaterialsDoubleSided(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => cloneMaterialDoubleSided(material));
    } else if (child.material) {
      child.material = cloneMaterialDoubleSided(child.material);
    }
  });
}

export function buildScaledFloorObject(
  sourceNode: Object3D,
  targetSize: [number, number, number],
): Object3D | null {
  const clone = sourceNode.clone(true);
  markFloorMeshForShadows(clone);
  clone.updateMatrixWorld(true);
  const box = new Box3().setFromObject(clone);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);
  if (size.lengthSq() < 1e-8) return null;

  clone.position.sub(center);
  const wrapper = new Object3D();
  wrapper.scale.set(targetSize[0] / sanitizeSize(size.x), targetSize[1] / sanitizeSize(size.y), targetSize[2] / sanitizeSize(size.z));
  wrapper.add(clone);
  wrapper.updateMatrixWorld(true);
  return wrapper;
}
