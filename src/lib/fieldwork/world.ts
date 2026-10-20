import type { Point } from './game';

export const LANDMARKS = [
  { id: 'wave', name: 'Wave table', number: '01', x: -8, z: -4, approach: { x: -8, z: 2.6 } },
  { id: 'motion', name: 'Pendulum court', number: '02', x: 26, z: -5, approach: { x: 26, z: 5 } },
  {
    id: 'optimization',
    name: 'Descent garden',
    number: '03',
    x: -27,
    z: 26,
    approach: { x: -27, z: 34 },
  },
  { id: 'signal', name: 'Signal grove', number: '04', x: 5, z: -34, approach: { x: 5, z: -26 } },
  {
    id: 'topology',
    name: 'Knot pavilion',
    number: '05',
    x: -31,
    z: -27,
    approach: { x: -31, z: -19 },
  },
] as const;
export type LandmarkId = (typeof LANDMARKS)[number]['id'];
export const nearestLandmark = (point: Point) =>
  LANDMARKS.find((l) => Math.hypot(point.x - l.approach.x, point.z - l.approach.z) < 5.5);
export const CELL_SIZE = 64;
export type SurveyProp = Point & { kind: 'tree' | 'rock' | 'arch'; scale: number; turn: number };
// Stable scenery with a fixed 7×7 render window; no growing world cache.
export function surveyCell(cx: number, cz: number): SurveyProp[] {
  const noise = (n: number) => {
    const f = Math.sin(cx * 127.1 + cz * 311.7 + n * 74.7) * 43758.5453;
    return f - Math.floor(f);
  };
  return Array.from({ length: 9 }, (_, i) => ({
    x: cx * CELL_SIZE + 8 + noise(i * 3) * 48,
    z: cz * CELL_SIZE + 8 + noise(i * 3 + 1) * 48,
    kind: (i < 6 ? 'tree' : i < 8 ? 'rock' : 'arch') as SurveyProp['kind'],
    scale: 0.8 + noise(i * 3 + 2) * 0.7,
    turn: noise(i + 41) * Math.PI,
  })).filter(
    (p) =>
      Math.hypot(p.x, p.z) > 52 &&
      Math.abs(p.x - p.z) > 10 &&
      Math.abs(p.z - (cz * CELL_SIZE + 9)) > 5,
  );
}
const footprints = [
  { x: 26, z: -5, rx: 7, rz: 4.7 },
  { x: -27, z: 26, rx: 6.5, rz: 6.5 },
  { x: 5, z: -34, rx: 9, rz: 3.7 },
  { x: -31, z: -27, rx: 5, rz: 5 },
  { x: 8.5, z: -10, rx: 4.2, rz: 1.4 },
];
export function worldBlocked(point: Point) {
  if (footprints.some((p) => Math.abs(point.x - p.x) < p.rx && Math.abs(point.z - p.z) < p.rz))
    return true;
  return surveyCell(Math.floor(point.x / CELL_SIZE), Math.floor(point.z / CELL_SIZE)).some(
    (p) => p.kind === 'tree' && Math.hypot(point.x - p.x, point.z - p.z) < 0.65 + p.scale * 0.3,
  );
}
export const pendulumPeriod = (length: number) => 2 * Math.PI * Math.sqrt(length / 9.81);
export const pendulumAngle = (length: number, time: number) =>
  0.4 * Math.cos(Math.sqrt(9.81 / length) * time);
export const descentStep = (point: Point): Point => ({ x: point.x * 0.7, z: point.z * 0.7 });
export function signalHeight(x: number, harmonics: number) {
  let y = 0;
  for (let k = 1; k <= harmonics * 2 - 1; k += 2) y += Math.sin(k * x) / k;
  return y;
}
