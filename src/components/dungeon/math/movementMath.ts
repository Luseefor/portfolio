export type MoveKeys = {
  forward?: boolean;
  backward?: boolean;
  left?: boolean;
  right?: boolean;
};

type Vec3 = { x: number; y: number; z: number };

export function computeMoveVector(keys: MoveKeys, yaw: number): Vec3 {
  const forwardX = Math.sin(yaw);
  const forwardZ = Math.cos(yaw);
  const rightX = forwardZ;
  const rightZ = -forwardX;

  let x = 0;
  let z = 0;

  if (keys.forward) {
    x += forwardX;
    z += forwardZ;
  }
  if (keys.backward) {
    x -= forwardX;
    z -= forwardZ;
  }
  if (keys.left) {
    x -= rightX;
    z -= rightZ;
  }
  if (keys.right) {
    x += rightX;
    z += rightZ;
  }

  const length = Math.hypot(x, z);
  if (!Number.isFinite(length) || length < 1e-5) {
    return { x: 0, y: 0, z: 0 };
  }

  return { x: x / length, y: 0, z: z / length };
}
