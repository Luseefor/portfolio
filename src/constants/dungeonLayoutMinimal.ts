import type { DungeonLayoutGraph, DungeonPlacement } from './dungeonLayout';

export const DUNGEON_LAYOUT_MINIMAL: DungeonPlacement[] = [
  { key: 'Floor_SquareLarge', pos: [0, 0, 0] },
  { key: 'Wall', pos: [0, 0, 5], rotY: 0 },
  { key: 'Wall', pos: [0, 0, -5], rotY: Math.PI },
  { key: 'Wall', pos: [5, 0, 0], rotY: Math.PI / 2 },
  { key: 'Wall', pos: [-5, 0, 0], rotY: -Math.PI / 2 },

  { key: 'Floor_Standard', pos: [0, 0, 8] },
  { key: 'Floor_Standard', pos: [0, 0, 12] },
  { key: 'Floor_Standard', pos: [0, 0, 16] },
  { key: 'Floor_Standard', pos: [0, 0, 20] },
  { key: 'Wall_Half', pos: [4, 0, 12], rotY: Math.PI / 2 },
  { key: 'Wall_Half', pos: [-4, 0, 12], rotY: -Math.PI / 2 },
  { key: 'Wall_Half', pos: [4, 0, 16], rotY: Math.PI / 2 },
  { key: 'Wall_Half', pos: [-4, 0, 16], rotY: -Math.PI / 2 },

  { key: 'Floor_Squares', pos: [0, 0, 28] },
  { key: 'Arch_Gothic', pos: [0, 0, 23], rotY: 0 },
  { key: 'Wall_ArchRound', pos: [0, 0, 33], rotY: Math.PI },
  { key: 'Column_Round', pos: [4.5, 0, 23.5] },
  { key: 'Column_Round', pos: [-4.5, 0, 23.5] },
  { key: 'Column_Square', pos: [4.5, 0, 32.5] },
  { key: 'Column_Square', pos: [-4.5, 0, 32.5] },
];

export const DUNGEON_LAYOUT_GRAPH_MINIMAL: DungeonLayoutGraph = {
  seed: 11,
  gridSize: 2,
  spawnRoomId: 'spawn-room',
  spawnPoint: [0, 3.2, -2],
  spawnPlatform: {
    center: [0, 0.45, -2],
    size: { width: 8, depth: 8, height: 0.9 },
    landmarkTorches: [
      [-3.8, 2.3, -5.4],
      [3.8, 2.3, -5.4],
      [-3.8, 2.3, 1.4],
      [3.8, 2.3, 1.4],
    ],
  },
  rooms: [
    {
      id: 'spawn-room',
      center: [0, 0, 0],
      size: { width: 12, depth: 12, height: 8.8 },
      theme: 'spawn',
      props: [
        { key: 'Torch', offset: [-4.8, 2.3, -2], rotationY: Math.PI / 2 },
        { key: 'Torch', offset: [4.8, 2.3, -2], rotationY: -Math.PI / 2 },
      ],
    },
    {
      id: 'chest-room',
      center: [0, 0, 28],
      size: { width: 14, depth: 14, height: 9 },
      theme: 'treasury',
      props: [{ key: 'Torch', offset: [0, 2.3, -5], rotationY: Math.PI }],
    },
  ],
  routes: [
    {
      id: 'spawn-to-chest',
      fromRoomId: 'spawn-room',
      toRoomId: 'chest-room',
      kind: 'main',
      width: 6,
      waypoints: [[0, 14]],
    },
  ],
};
