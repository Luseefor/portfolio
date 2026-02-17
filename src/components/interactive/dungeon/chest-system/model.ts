import * as THREE from 'three';

export function safePauseAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return;
  try {
    audio.pause();
  } catch {
    // Ignore pause errors in non-browser test environments.
  }
}

function sanitizeSize(value: number) {
  return Number.isFinite(value) && value > 0.0001 ? value : 1;
}

export function buildChestModel(
  sourceScene: THREE.Object3D,
  targetSize: { width: number; height: number; depth: number },
): THREE.Object3D | null {
  const clone = sourceScene.clone(true);
  clone.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  if (size.lengthSq() < 1e-8) return null;

  // Ground-align chest model so position.y always represents floor-contact point.
  clone.position.x -= center.x;
  clone.position.z -= center.z;
  clone.position.y -= bounds.min.y;

  const wrapper = new THREE.Group();
  wrapper.scale.set(
    targetSize.width / sanitizeSize(size.x),
    targetSize.height / sanitizeSize(size.y),
    targetSize.depth / sanitizeSize(size.z),
  );
  wrapper.add(clone);
  wrapper.updateMatrixWorld(true);
  return wrapper;
}
