import type { MutableRefObject, RefObject } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import { MathUtils, type Group } from 'three';
import { getDungeonVisualLiftAt } from '@/lib/dungeonVisualLift';
import {
  GROUND_RAY_LENGTH,
  GROUND_RAY_ORIGIN_OFFSET,
  MAX_GROUNDED_UP_VELOCITY,
  MIN_LAND_AIRBORNE_TIME,
  MIN_LAND_IMPACT_SPEED,
  PLAYER_LIFT_DOWN_SMOOTHING,
  PLAYER_LIFT_UP_SMOOTHING,
} from './constants';

type RayHit = {
  timeOfImpact: number;
};

type RayCasterWorld = {
  castRay: (...args: unknown[]) => RayHit | null;
};

type RapierApi = {
  Ray: new (origin: { x: number; y: number; z: number }, direction: { x: number; y: number; z: number }) => unknown;
};

type RuntimeGroundParams = {
  body: RapierRigidBody;
  rapier: RapierApi;
  world: RayCasterWorld;
  delta: number;
  visualLiftRef: MutableRefObject<number>;
  characterRootRef: RefObject<Group | null>;
  wasGroundedRef: MutableRefObject<boolean>;
  airborneTimeRef: MutableRefObject<number>;
  maxFallSpeedRef: MutableRefObject<number>;
  landAudioRef: MutableRefObject<HTMLAudioElement[]>;
  landAudioIndexRef: MutableRefObject<number>;
  jumpSoundLockedUntilLandRef: MutableRefObject<boolean>;
  groundedTimerRef: MutableRefObject<number>;
};

export function updateGroundRuntime({
  body,
  rapier,
  world,
  delta,
  visualLiftRef,
  characterRootRef,
  wasGroundedRef,
  airborneTimeRef,
  maxFallSpeedRef,
  landAudioRef,
  landAudioIndexRef,
  jumpSoundLockedUntilLandRef,
  groundedTimerRef,
}: RuntimeGroundParams) {
  const position = body.translation();
  const linvel = body.linvel();

  const groundRay = new rapier.Ray(
    { x: position.x, y: position.y + GROUND_RAY_ORIGIN_OFFSET, z: position.z },
    { x: 0, y: -1, z: 0 },
  );
  const groundHit = world.castRay(groundRay, GROUND_RAY_LENGTH, true, undefined, undefined, undefined, body);
  const grounded = Boolean(groundHit && Number.isFinite(groundHit.timeOfImpact)) && linvel.y <= MAX_GROUNDED_UP_VELOCITY;

  const targetVisualLift = grounded ? getDungeonVisualLiftAt(position.x, position.z) : 0;
  const liftSmoothing = targetVisualLift >= visualLiftRef.current ? PLAYER_LIFT_UP_SMOOTHING : PLAYER_LIFT_DOWN_SMOOTHING;
  const liftLerp = 1 - Math.exp(-liftSmoothing * delta);
  visualLiftRef.current = MathUtils.lerp(visualLiftRef.current, targetVisualLift, liftLerp);
  if (characterRootRef.current) {
    characterRootRef.current.position.y = visualLiftRef.current;
  }

  if (!grounded) {
    airborneTimeRef.current += delta;
    maxFallSpeedRef.current = Math.max(maxFallSpeedRef.current, -linvel.y);
  } else if (!wasGroundedRef.current) {
    const hasMeaningfulImpact =
      maxFallSpeedRef.current >= MIN_LAND_IMPACT_SPEED || airborneTimeRef.current >= MIN_LAND_AIRBORNE_TIME;
    if (hasMeaningfulImpact && landAudioRef.current.length > 0) {
      const landAudio = landAudioRef.current[landAudioIndexRef.current % landAudioRef.current.length];
      landAudioIndexRef.current += 1;
      landAudio.currentTime = 0;
      landAudio.playbackRate = 0.97 + Math.random() * 0.06;
      landAudio.play().catch(() => {});
      jumpSoundLockedUntilLandRef.current = false;
    }
    airborneTimeRef.current = 0;
    maxFallSpeedRef.current = 0;
  } else {
    airborneTimeRef.current = 0;
    maxFallSpeedRef.current = 0;
  }

  if (grounded) groundedTimerRef.current = 0;
  else groundedTimerRef.current += delta;

  return { grounded, linvel, position };
}
