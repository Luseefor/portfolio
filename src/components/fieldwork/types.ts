import type { Point } from '@/lib/fieldwork/game';
export type SceneMetrics = {
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  frames: number;
};
export type GameBridge = {
  keys: Set<string>;
  position: Point;
  destination: Point | null;
  wake?: () => void;
  advance?: (ms: number) => void;
  resetView?: () => void;
  view?: { camera: Point & { y: number; zoom: number }; target: Point };
  manual: boolean;
  metrics: SceneMetrics;
};
