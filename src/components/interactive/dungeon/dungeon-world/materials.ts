import { MeshStandardMaterial } from 'three';

export const floorMaterial = new MeshStandardMaterial({ color: '#252825', roughness: 0.96, metalness: 0.02 });
export const corridorMaterial = new MeshStandardMaterial({ color: '#2e322e', roughness: 0.95, metalness: 0.02 });
export const spawnMaterial = new MeshStandardMaterial({ color: '#3f4c3d', roughness: 0.88, metalness: 0.03 });
export const floorUnderlayMaterial = new MeshStandardMaterial({ color: '#5b3a1f', roughness: 0.98, metalness: 0.01 });
export const ceilingFallbackMaterial = new MeshStandardMaterial({ color: '#6d6659', roughness: 0.92, metalness: 0.04 });
export const ceilingCapMaterial = new MeshStandardMaterial({ color: '#7c807f', roughness: 0.95, metalness: 0.02 });
export const wallFallbackMaterial = new MeshStandardMaterial({ color: '#5f655f', roughness: 0.9, metalness: 0.03 });
