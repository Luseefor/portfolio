/**
 * DungeonLayout.ts - Agent B (B1)
 *
 * Defines exact placements for dungeon elements:
 * - Room A (Spawn Hall): Floor_Standard + Wall + Arch_Gothic doorway + 2 Columns + Flags
 * - Corridor 1: Floor_Standard_Half or Floor_Squares, Wall_Broken, torches
 * - Room B (Chest Room): Floor_Diamond center, 4 columns, candles, chest, window bars
 * - Corridor 2 (Turn): Wall_Overgrown, Wall_Hole, skull/pot props
 * - Room C (Showcase): Statue, rails, optional stairs
 *
 * Agent A will use these placements to render via instancing.
 *
 * IMPORTANT NODE KEY MAPPING (GLB nodes use underscores, case-sensitive):
 * Check console for "[DungeonLayout] Available mesh/group nodes" to verify.
 */

export interface DungeonPlacement {
  key: string;
  pos: [number, number, number];
  rotY?: number;
  scale?: number;
}

export const DUNGEON_SCALE = 4;

export interface ChestPOI {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  interactionRadius: number;
  loot?: {
    type: 'project' | 'artifact' | 'secret';
    label: string;
    url?: string;
  };
}

export const CHEST_POIS: ChestPOI[] = [
  {
    id: 'chest-main',
    title: 'Ancient Project Scroll',
    description:
      'A weathered scroll containing blueprints for a legendary web application. The craftsmanship is remarkable.',
    position: [0, 0, 24], // Room B (Chest Room) center
    rotation: [0, 0, 0],
    interactionRadius: 2.5,
    loot: {
      type: 'project',
      label: 'View Project',
      url: '/projects/web-app',
    },
  },
  {
    id: 'chest-2',
    title: 'Enchanted Code Tome',
    description:
      'This mystical tome contains powerful algorithms and arcane programming knowledge passed down through generations.',
    position: [18, 0.3, 42], // Room C (Showcase)
    rotation: [0, -Math.PI / 4, 0],
    interactionRadius: 2.5,
    loot: {
      type: 'artifact',
      label: 'View on GitHub',
      url: 'https://github.com',
    },
  },
  {
    id: 'chest-3',
    title: 'Hidden Treasure',
    description:
      'A secret cache of valuable experience points and rare skills. Few adventurers have discovered this trove.',
    position: [0, 0, -6], // Room A (Spawn Hall)
    rotation: [0, Math.PI, 0],
    interactionRadius: 2.5,
    loot: {
      type: 'secret',
      label: 'Discover Secret',
    },
  },
];

// ========================================
// MINIMAL LAYOUT - GUARANTEED TO RENDER
// Uses only core structural pieces that exist in most modular dungeon packs
// Player spawns at [0, 1.5, 0] so this layout centers around origin
// ========================================
export const DUNGEON_LAYOUT_MINIMAL: DungeonPlacement[] = [
  // === SPAWN ROOM FLOOR (3x3 grid centered at origin) ===
  { key: 'Floor_Standard', pos: [0, 0, 0] },
  { key: 'Floor_Standard', pos: [4, 0, 0] },
  { key: 'Floor_Standard', pos: [-4, 0, 0] },
  { key: 'Floor_Standard', pos: [0, 0, 4] },
  { key: 'Floor_Standard', pos: [4, 0, 4] },
  { key: 'Floor_Standard', pos: [-4, 0, 4] },
  { key: 'Floor_Standard', pos: [0, 0, -4] },
  { key: 'Floor_Standard', pos: [4, 0, -4] },
  { key: 'Floor_Standard', pos: [-4, 0, -4] },

  // === SPAWN ROOM WALLS ===
  // Back wall
  { key: 'Wall', pos: [-4, 0, -6], rotY: 0 },
  { key: 'Wall', pos: [0, 0, -6], rotY: 0 },
  { key: 'Wall', pos: [4, 0, -6], rotY: 0 },

  // Left wall
  { key: 'Wall', pos: [-6, 0, -4], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-6, 0, 0], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-6, 0, 4], rotY: Math.PI / 2 },

  // Right wall
  { key: 'Wall', pos: [6, 0, -4], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, 0], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, 4], rotY: -Math.PI / 2 },

  // Front wall with opening
  { key: 'Wall', pos: [-4, 0, 6], rotY: Math.PI },
  { key: 'Wall', pos: [4, 0, 6], rotY: Math.PI },

  // === CORRIDOR FLOOR ===
  { key: 'Floor_Standard', pos: [0, 0, 10] },
  { key: 'Floor_Standard', pos: [0, 0, 14] },

  // === CORRIDOR WALLS ===
  { key: 'Wall', pos: [-2, 0, 10], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-2, 0, 14], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [2, 0, 10], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [2, 0, 14], rotY: -Math.PI / 2 },

  // === CHEST ROOM FLOOR ===
  { key: 'Floor_Standard', pos: [-4, 0, 18] },
  { key: 'Floor_Standard', pos: [0, 0, 18] },
  { key: 'Floor_Standard', pos: [4, 0, 18] },
  { key: 'Floor_Standard', pos: [-4, 0, 22] },
  { key: 'Floor_Standard', pos: [0, 0, 22] },
  { key: 'Floor_Standard', pos: [4, 0, 22] },

  // === CHEST ROOM WALLS ===
  { key: 'Wall', pos: [-6, 0, 18], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-6, 0, 22], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, 18], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, 22], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [-4, 0, 24], rotY: Math.PI },
  { key: 'Wall', pos: [0, 0, 24], rotY: Math.PI },
  { key: 'Wall', pos: [4, 0, 24], rotY: Math.PI },

  // === COLUMNS (if available) ===
  { key: 'Column_Round', pos: [-3, 0, 19] },
  { key: 'Column_Round', pos: [3, 0, 19] },
  { key: 'Column_Round', pos: [-3, 0, 21] },
  { key: 'Column_Round', pos: [3, 0, 21] },
];

// ========================================
// ROOM A - SPAWN HALL (Player starts here)
// ========================================
export const ROOM_A_PLACEMENTS: DungeonPlacement[] = [
  // Floors (3x3 grid)
  { key: 'Floor_Standard', pos: [0, 0, 0] },
  { key: 'Floor_Standard', pos: [4, 0, 0] },
  { key: 'Floor_Standard', pos: [-4, 0, 0] },
  { key: 'Floor_Standard', pos: [0, 0, 4] },
  { key: 'Floor_Standard', pos: [4, 0, 4] },
  { key: 'Floor_Standard', pos: [-4, 0, 4] },
  { key: 'Floor_Standard', pos: [0, 0, -4] },
  { key: 'Floor_Standard', pos: [4, 0, -4] },
  { key: 'Floor_Standard', pos: [-4, 0, -4] },

  // Walls - back
  { key: 'Wall', pos: [-6, 0, -6], rotY: 0 },
  { key: 'Wall', pos: [-2, 0, -6], rotY: 0 },
  { key: 'Wall', pos: [2, 0, -6], rotY: 0 },
  { key: 'Wall', pos: [6, 0, -6], rotY: 0 },

  // Walls - sides
  { key: 'Wall', pos: [-6, 0, -2], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-6, 0, 2], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, -2], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, 2], rotY: -Math.PI / 2 },

  // Arch Gothic doorway to Corridor 1
  { key: 'Arch_Gothic', pos: [0, 0, 6], rotY: Math.PI },

  // Columns at spawn
  { key: 'Column_Round', pos: [-4, 0, -4] },
  { key: 'Column_Round', pos: [4, 0, -4] },

  // Flags on walls
  { key: 'Flag_Wall', pos: [-4, 2.5, -5.8], rotY: 0 },
  { key: 'Flag_Wall', pos: [4, 2.5, -5.8], rotY: 0 },
];

// ========================================
// CORRIDOR 1 - Connects Room A to Room B
// ========================================
export const CORRIDOR_1_PLACEMENTS: DungeonPlacement[] = [
  // Floors
  { key: 'Floor_Squares', pos: [0, 0, 10] },
  { key: 'Floor_Squares', pos: [0, 0, 14] },
  { key: 'Floor_Squares', pos: [0, 0, 18] },

  // Walls - one broken for variety
  { key: 'Wall', pos: [-3, 0, 10], rotY: Math.PI / 2 },
  { key: 'Wall_Broken', pos: [-3, 0, 14], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-3, 0, 18], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [3, 0, 10], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [3, 0, 14], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [3, 0, 18], rotY: -Math.PI / 2 },
];

// ========================================
// ROOM B - CHEST ROOM
// ========================================
export const ROOM_B_PLACEMENTS: DungeonPlacement[] = [
  // Floors - Diamond center tile
  { key: 'Floor_Standard', pos: [-4, 0, 24] },
  { key: 'Floor_Standard', pos: [4, 0, 24] },
  { key: 'Floor_Diamond', pos: [0, 0, 24] }, // Center floor (under chest)
  { key: 'Floor_Standard', pos: [-4, 0, 28] },
  { key: 'Floor_Standard', pos: [4, 0, 28] },
  { key: 'Floor_Standard', pos: [0, 0, 28] },
  { key: 'Floor_Standard', pos: [-4, 0, 20] },
  { key: 'Floor_Standard', pos: [4, 0, 20] },
  { key: 'Floor_Standard', pos: [0, 0, 20] },

  // Walls
  { key: 'Wall', pos: [-6, 0, 20], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-6, 0, 24], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-6, 0, 28], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, 20], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, 24], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [6, 0, 28], rotY: -Math.PI / 2 },

  // Back wall with window
  { key: 'Wall', pos: [-4, 0, 30], rotY: Math.PI },
  { key: 'Wall', pos: [4, 0, 30], rotY: Math.PI },
  { key: 'Window_Bars', pos: [0, 1.5, 30], rotY: Math.PI },

  // 4 columns framing the chest
  { key: 'Column_Square', pos: [-3, 0, 22] },
  { key: 'Column_Square', pos: [3, 0, 22] },
  { key: 'Column_Square', pos: [-3, 0, 26] },
  { key: 'Column_Square', pos: [3, 0, 26] },

  // Arch doorway to Corridor 2
  { key: 'Arch_Round', pos: [6, 0, 24], rotY: -Math.PI / 2 },
];

// ========================================
// CORRIDOR 2 - TURN (connects Room B to Room C)
// ========================================
export const CORRIDOR_2_PLACEMENTS: DungeonPlacement[] = [
  // Floors (L-shaped turn)
  { key: 'Floor_Standard_Half', pos: [10, 0, 24] },
  { key: 'Floor_Standard_Half', pos: [14, 0, 24] },
  { key: 'Floor_Standard_Half', pos: [14, 0, 20] },
  { key: 'Floor_Standard_Half', pos: [14, 0, 16] },

  // Walls with overgrown/damaged variants
  { key: 'Wall', pos: [10, 0, 27], rotY: Math.PI },
  { key: 'Wall_Overgrown', pos: [14, 0, 27], rotY: Math.PI },
  { key: 'Wall_Hole', pos: [17, 0, 24], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [17, 0, 20], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [17, 0, 16], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [10, 0, 21], rotY: Math.PI / 2 },
];

// ========================================
// ROOM C - SHOWCASE ROOM
// ========================================
export const ROOM_C_PLACEMENTS: DungeonPlacement[] = [
  // Floors
  { key: 'Floor_SquareLarge', pos: [14, 0, 10] },
  { key: 'Floor_Standard', pos: [10, 0, 10] },
  { key: 'Floor_Standard', pos: [18, 0, 10] },
  { key: 'Floor_Standard', pos: [10, 0, 6] },
  { key: 'Floor_Standard', pos: [14, 0, 6] },
  { key: 'Floor_Standard', pos: [18, 0, 6] },

  // Walls
  { key: 'Wall', pos: [8, 0, 10], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [8, 0, 6], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [20, 0, 10], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [20, 0, 6], rotY: -Math.PI / 2 },
  { key: 'Wall', pos: [10, 0, 4], rotY: 0 },
  { key: 'Wall', pos: [14, 0, 4], rotY: 0 },
  { key: 'Wall', pos: [18, 0, 4], rotY: 0 },

  // Statue as focal point
  { key: 'Statue_Stag', pos: [14, 0, 6], rotY: Math.PI },

  // Rails around statue
  { key: 'Rail_Straight', pos: [12, 0, 5], rotY: Math.PI / 2 },
  { key: 'Rail_Straight', pos: [16, 0, 5], rotY: -Math.PI / 2 },
  { key: 'Rail_Straight', pos: [14, 0, 7], rotY: Math.PI },

  // Small stairs for elevation change
  { key: 'Stairs', pos: [14, 0, 12], rotY: 0 },
];

// ========================================
// PROPS - scattered decorations
// ========================================
export const PROP_PLACEMENTS: DungeonPlacement[] = [
  // Corridor 1 - subtle dressing
  { key: 'Barrel', pos: [2, 0, 12], rotY: 0.3 },
  { key: 'Crate', pos: [-2, 0, 16], rotY: -0.2 },

  // Corridor 2 - decay hints
  { key: 'Skull', pos: [12, 0.1, 24], rotY: 1.2 },
  { key: 'Pot1', pos: [15, 0, 22], rotY: 0 },
  { key: 'Pot2_Broken', pos: [16, 0, 18], rotY: 0.5 },

  // Room B - candles near chest
  { key: 'Candles_1', pos: [-1.5, 0, 24] },
  { key: 'Candles_2', pos: [1.5, 0, 24] },

  // Room C - additional dressing
  { key: 'Pot3', pos: [10, 0, 8], rotY: 0 },
  { key: 'Barrel', pos: [18, 0, 8], rotY: -0.4 },

  // Room A - subtle props
  { key: 'Crate', pos: [-5, 0, -3], rotY: 0.1 },
];

// ========================================
// TORCH PLACEMENTS (for Agent B TorchSystem)
// Aligned with DUNGEON_LAYOUT_MINIMAL coordinates
// ========================================
export const TORCH_PLACEMENTS: Array<{
  position: [number, number, number];
  rotation?: [number, number, number];
}> = [
    // Room A - spawn hall (4 torches on walls)
    { position: [-5.8, 2.2, -2], rotation: [0, Math.PI / 2, 0] },
    { position: [5.8, 2.2, -2], rotation: [0, -Math.PI / 2, 0] },
    { position: [-5.8, 2.2, 2], rotation: [0, Math.PI / 2, 0] },
    { position: [5.8, 2.2, 2], rotation: [0, -Math.PI / 2, 0] },

    // Corridor (2 torches)
    { position: [-1.8, 2.2, 12], rotation: [0, Math.PI / 2, 0] },
    { position: [1.8, 2.2, 12], rotation: [0, -Math.PI / 2, 0] },

    // Room B - chest room (4 torches for dramatic lighting)
    { position: [-5.8, 2.2, 19], rotation: [0, Math.PI / 2, 0] },
    { position: [5.8, 2.2, 19], rotation: [0, -Math.PI / 2, 0] },
    { position: [-5.8, 2.2, 21], rotation: [0, Math.PI / 2, 0] },
    { position: [5.8, 2.2, 21], rotation: [0, -Math.PI / 2, 0] },
  ];

// ========================================
// WARM POINT LIGHTS (companion to torches)
// For use in scene lighting - place near each torch
// ========================================
export const TORCH_LIGHT_CONFIG = {
  color: '#ff9040',
  intensity: 2.5,
  distance: 12,
  decay: 2,
} as const;

// ========================================
// FOG RECOMMENDATION
// ========================================
export const FOG_CONFIG = {
  color: '#1a1410',
  density: 0.025, // Soft density for readability
} as const;

// ========================================
// COMBINED LAYOUT (for Agent A to consume)
// ========================================
export const DUNGEON_LAYOUT: DungeonPlacement[] = [
  ...ROOM_A_PLACEMENTS,
  ...CORRIDOR_1_PLACEMENTS,
  ...ROOM_B_PLACEMENTS,
  ...CORRIDOR_2_PLACEMENTS,
  ...ROOM_C_PLACEMENTS,
  ...PROP_PLACEMENTS,
];

// Summary counts for debugging
export const LAYOUT_SUMMARY = {
  totalPlacements: DUNGEON_LAYOUT.length,
  rooms: 3,
  corridors: 2,
  torches: TORCH_PLACEMENTS.length,
  props: PROP_PLACEMENTS.length,
};
