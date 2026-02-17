import { Box3, Object3D, Vector3 } from 'three';

export function snapValue(value: number, step: number) {
  if (!Number.isFinite(value) || step <= 0) return value;
  return Math.round(value / step) * step;
}

export function snapVec3(
  value: [number, number, number],
  step: number,
): [number, number, number] {
  return [
    snapValue(value[0], step),
    snapValue(value[1], step),
    snapValue(value[2], step),
  ];
}

export type SafeNodeResolver = (
  preferred: string,
  fallbacks: readonly string[],
  context: string,
) => Object3D | null;

export function createSafeNodeResolver(nodes: Record<string, Object3D>): SafeNodeResolver {
  const warned = new Set<string>();
  const keys = Object.keys(nodes);

  return (preferred: string, fallbacks: readonly string[], context: string) => {
    const candidates = [preferred, ...fallbacks];
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      if (candidate && nodes[candidate]) {
        return nodes[candidate];
      }
    }

    const warningKey = preferred;
    if (!warned.has(warningKey)) {
      warned.add(warningKey);
      console.warn('Missing node:', preferred, keys, `context=${context}`, `fallbacks=${fallbacks.join(',')}`);
    }

    return null;
  };
}

type NodeMeasurement = {
  size: Vector3;
  center: Vector3;
};

export function createNodeMeasurementCache() {
  const cache = new Map<string, NodeMeasurement>();
  const box = new Box3();

  return (node: Object3D, rotationX: number) => {
    const key = `${node.uuid}:${rotationX.toFixed(4)}`;
    const cached = cache.get(key);
    if (cached) {
      return {
        size: cached.size.clone(),
        center: cached.center.clone(),
      };
    }

    const probe = node.clone(true);
    probe.position.set(0, 0, 0);
    probe.rotation.set(rotationX, 0, 0);
    probe.scale.set(1, 1, 1);
    probe.updateMatrixWorld(true);

    box.setFromObject(probe);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const measurement: NodeMeasurement = { size, center };
    cache.set(key, measurement);

    return {
      size: size.clone(),
      center: center.clone(),
    };
  };
}
