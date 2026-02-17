import { Box3, Material, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { PROP_COLLIDER_INSET } from './constants';

export function groundAlignObjectToZeroY(object: Object3D) {
  object.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(object);
  if (!Number.isFinite(bounds.min.y)) return;
  object.position.y -= bounds.min.y;
  object.updateMatrixWorld(true);
}

export function colliderArgsFromSize(
  size: [number, number, number],
  widthInset = PROP_COLLIDER_INSET,
): [number, number, number] {
  return [
    Math.max(0.06, (size[0] * widthInset) * 0.5),
    Math.max(0.06, size[1] * 0.5),
    Math.max(0.06, (size[2] * widthInset) * 0.5),
  ];
}

export function setTorchGlowMaterial(object: Object3D) {
  const rootBox = new Box3().setFromObject(object);
  const rootSize = new Vector3();
  rootBox.getSize(rootSize);
  const flameThreshold = rootBox.min.y + rootSize.y * 0.72;

  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    const meshBox = new Box3().setFromObject(child);
    const meshCenter = new Vector3();
    meshBox.getCenter(meshCenter);
    const isFlameMesh = meshCenter.y >= flameThreshold;
    const applyGlow = (material: Material) => {
      if (!(material instanceof MeshStandardMaterial)) return;
      const next = material.clone();
      if (isFlameMesh) {
        next.emissive.set('#ff8f3a');
        next.emissiveIntensity = Math.max(next.emissiveIntensity, 0.95);
        next.roughness = Math.max(0.25, next.roughness * 0.6);
      } else {
        next.emissive.set('#000000');
        next.emissiveIntensity = 0;
      }
      return next;
    };

    if (Array.isArray(child.material)) child.material = child.material.map((material) => applyGlow(material) ?? material);
    else if (child.material) child.material = applyGlow(child.material) ?? child.material;
  });
}
