import { clampPlayerX, clampPlayerZ } from './helpers';

type BodyLike = {
  translation: () => { x: number; y: number; z: number };
  linvel: () => { x: number; y: number; z: number };
  setTranslation: (value: { x: number; y: number; z: number }, wakeUp: boolean) => void;
  setLinvel: (value: { x: number; y: number; z: number }, wakeUp: boolean) => void;
};

export function clampBodyToDungeonBounds(body: BodyLike) {
  const postStep = body.translation();
  const clampedX = clampPlayerX(postStep.x);
  const clampedZ = clampPlayerZ(postStep.z);
  if (Math.abs(clampedX - postStep.x) > 0.001 || Math.abs(clampedZ - postStep.z) > 0.001) {
    body.setTranslation({ x: clampedX, y: postStep.y, z: clampedZ }, true);
    const currentVel = body.linvel();
    body.setLinvel(
      {
        x: clampedX !== postStep.x ? 0 : currentVel.x,
        y: currentVel.y,
        z: clampedZ !== postStep.z ? 0 : currentVel.z,
      },
      true,
    );
  }
}
