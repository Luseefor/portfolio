export const KINDS = ['wave', 'saddle', 'gaussian'] as const;
export type SurfaceKind = (typeof KINDS)[number];
export type Surface = {
  id: string;
  kind: SurfaceKind;
  amplitude: number;
  frequency: number;
  x: number;
  z: number;
};
export type BuildPlan = {
  operation: 'create' | 'update';
  kind: SurfaceKind;
  amplitude: number;
  frequency: number;
  automate: boolean;
  summary: string;
};
export type SweepSample = { frequency: number; minimum: number; maximum: number; mean: number };
export const MAX_OBJECTS = 9;
export const LABELS: Record<SurfaceKind, string> = {
  wave: 'Wave field',
  saddle: 'Saddle surface',
  gaussian: 'Gaussian hill',
};
export const EQUATIONS: Record<SurfaceKind, string> = {
  wave: 'y = A sin(ωx + t) cos(ωz)',
  saddle: 'y = A(x² − z²) / 6',
  gaussian: 'y = 2A exp(−ω(x² + z²) / 3)',
};
export function isKind(value: unknown): value is SurfaceKind {
  return KINDS.some((kind) => kind === value);
}
function inRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}
export function validPlan(value: unknown): value is BuildPlan {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return (
    (p.operation === 'create' || p.operation === 'update') &&
    isKind(p.kind) &&
    inRange(p.amplitude, 0.2, 2.5) &&
    inRange(p.frequency, 0.25, 3) &&
    typeof p.automate === 'boolean' &&
    !(p.kind === 'saddle' && p.automate) &&
    typeof p.summary === 'string' &&
    p.summary.length > 0 &&
    p.summary.length <= 180
  );
}
export function validSurface(value: unknown): value is Surface {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    s.id.trim().length > 0 &&
    s.id.length <= 60 &&
    isKind(s.kind) &&
    inRange(s.amplitude, 0.2, 2.5) &&
    inRange(s.frequency, 0.25, 3) &&
    inRange(s.x, -36, 36) &&
    inRange(s.z, -36, 36)
  );
}
export function heightAt(
  kind: SurfaceKind,
  x: number,
  z: number,
  amplitude: number,
  frequency: number,
  time = 0,
): number {
  if (kind === 'wave') return amplitude * Math.sin(frequency * x + time) * Math.cos(frequency * z);
  if (kind === 'saddle') return (amplitude * (x * x - z * z)) / 6;
  return 2 * amplitude * Math.exp((-frequency * (x * x + z * z)) / 3);
}
export function sampleSurface(
  surface: Pick<Surface, 'kind' | 'amplitude' | 'frequency'>,
): Omit<SweepSample, 'frequency'> {
  let minimum = Infinity,
    maximum = -Infinity,
    sum = 0;
  const intervals = 24;
  for (let i = 0; i <= intervals; i++)
    for (let j = 0; j <= intervals; j++) {
      const height = heightAt(
        surface.kind,
        -3 + i / 4,
        -3 + j / 4,
        surface.amplitude,
        surface.frequency,
        0,
      );
      minimum = Math.min(minimum, height);
      maximum = Math.max(maximum, height);
      sum += height;
    }
  return { minimum, maximum, mean: sum / (intervals + 1) ** 2 };
}
export function frequencySweep(surface: Surface): SweepSample[] {
  return [0.5, 1, 1.5, 2, 2.5, 3].map((frequency) => ({
    frequency,
    ...sampleSurface({ ...surface, frequency }),
  }));
}
const PLACEMENTS = [
  [-6, 1],
  [7, -10],
  [9, 4],
  [-7, -12],
  [-19, 0],
  [-19, -12],
  [-6, 14],
  [8, 17],
  [21, -8],
];
export function makeSurface(kind: SurfaceKind, index: number, id: string): Surface {
  const [x, z] = PLACEMENTS[index % PLACEMENTS.length];
  return { id, kind, amplitude: 1, frequency: 1, x, z };
}
export function freePlacement(objects: Surface[]): number {
  return PLACEMENTS.findIndex(([x, z]) =>
    objects.every((object) => Math.hypot(object.x - x, object.z - z) > 8),
  );
}
export const INITIAL_SURFACES: Surface[] = [
  { ...makeSurface('wave', 0, 'wave-01'), amplitude: 1.1 },
  { ...makeSurface('gaussian', 1, 'hill-02'), frequency: 0.75 },
];
