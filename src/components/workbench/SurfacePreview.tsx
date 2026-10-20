import { heightAt, LABELS, type Surface } from '@/lib/workbench/model';
export default function SurfacePreview({ surface }: { surface: Surface }) {
  const paths = [];
  for (let z = -3; z <= 3; z += 0.5) {
    const points = [];
    for (let x = -3; x <= 3.001; x += 0.15) {
      const h = heightAt(surface.kind, x, z, surface.amplitude, surface.frequency, 0);
      points.push(
        `${points.length ? 'L' : 'M'}${(150 + (x - z) * 18).toFixed(2)},${(85 + (x + z) * 7 - h * 17).toFixed(2)}`,
      );
    }
    paths.push(points.join(' '));
  }
  return (
    <svg
      viewBox="0 0 300 160"
      role="img"
      aria-label={`${LABELS[surface.kind]} sampled at time zero`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.65" />
      ))}
    </svg>
  );
}
