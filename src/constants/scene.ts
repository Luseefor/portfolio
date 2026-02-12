import { DUNGEON_SCALE } from './dungeonLayout';

export const sceneLighting = {
  // Fog - atmospheric depth, not too dense to maintain readability
  fogColor: '#1a1410',
  fogDensity: 0.02 / DUNGEON_SCALE, // Lighter fog for blockout readability

  // Ambient - soft base fill to prevent crushed blacks
  ambientIntensity: 0.68,
  ambientColor: '#f6e1c4',

  // Hemisphere - sky/ground color bleed for natural feel
  hemisphereIntensity: 0.65,
  hemisphereSky: '#f7ead4',
  hemisphereGround: '#241a14',

  // Fill directional - subtle key light from above-right
  fillDirectionalIntensity: 0.95,
  fillDirectionalColor: '#ffe9cf',
  fillDirectionalPosition: [6 * DUNGEON_SCALE, 12 * DUNGEON_SCALE, 6 * DUNGEON_SCALE] as const,

  // Static torch accent lights (provide stable base illumination)
  torchLights: [
    // Room A (Spawn Hall) center glow
    {
      position: [0, 4 * DUNGEON_SCALE, -8 * DUNGEON_SCALE],
      intensity: 1.8,
      color: '#ffb35c',
      distance: 18 * DUNGEON_SCALE
    },
    // Corridor 1 midpoint
    {
      position: [0, 3 * DUNGEON_SCALE, 8 * DUNGEON_SCALE],
      intensity: 1.5,
      color: '#ff9f5a',
      distance: 14 * DUNGEON_SCALE
    },
    // Room B (Chest Room) accent
    {
      position: [0, 4 * DUNGEON_SCALE, 24 * DUNGEON_SCALE],
      intensity: 2.0,
      color: '#ffbf75',
      distance: 20 * DUNGEON_SCALE
    },
    // Corridor 2 turn point
    {
      position: [10 * DUNGEON_SCALE, 3 * DUNGEON_SCALE, 34 * DUNGEON_SCALE],
      intensity: 1.4,
      color: '#ffb35c',
      distance: 14 * DUNGEON_SCALE
    },
    // Room C (Showcase) fill
    {
      position: [18 * DUNGEON_SCALE, 4 * DUNGEON_SCALE, 44 * DUNGEON_SCALE],
      intensity: 1.8,
      color: '#ffe0a0',
      distance: 18 * DUNGEON_SCALE
    },
  ] as const,
};

export const rendererToneMapping = {
  exposure: 1.35, // Higher for blockout readability
};
