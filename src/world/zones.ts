/**
 * Zone Configuration for Underwater World
 * Each zone contains a GLB model that loads/unloads based on player proximity
 */

export interface ZoneConfig {
  id: string;
  name: string;
  center: [number, number, number];
  loadRadius: number;
  unloadRadius: number;
  glbPath: string;
  scale?: number;
  rotation?: [number, number, number];
}

export const ZONES: ZoneConfig[] = [
  {
    id: 'reef',
    name: 'Coral Reef',
    center: [12, -1.6, -18],
    loadRadius: 35,
    unloadRadius: 45,
    glbPath: process.env.NEXT_PUBLIC_ZONE_REEF_URL || '/models/zones/reef.glb',
    scale: 1.2,
    rotation: [0, 0.3, 0],
  },
  {
    id: 'wreck',
    name: 'Shipwreck',
    center: [-20, -1.8, 22],
    loadRadius: 40,
    unloadRadius: 50,
    glbPath: process.env.NEXT_PUBLIC_ZONE_WRECK_URL || '/models/zones/wreck.glb',
    scale: 1.5,
    rotation: [0, -0.8, 0.1],
  },
  {
    id: 'base',
    name: 'Underwater Base',
    center: [26, -2.0, 8],
    loadRadius: 30,
    unloadRadius: 40,
    glbPath: process.env.NEXT_PUBLIC_ZONE_BASE_URL || '/models/zones/base.glb',
    scale: 1.0,
    rotation: [0, 1.2, 0],
  },
];

export function getDistanceToZone(
  playerPos: { x: number; y: number; z: number },
  zone: ZoneConfig,
): number {
  const dx = playerPos.x - zone.center[0];
  const dy = playerPos.y - zone.center[1];
  const dz = playerPos.z - zone.center[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
