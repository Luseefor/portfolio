'use client';

import { useEffect, useRef } from 'react';
import { Vector3, MathUtils } from 'three';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { useDungeonInput } from '@/lib/dungeonInput';
import {
  CAMERA_DISTANCE,
  CAMERA_OFFSET,
  CAMERA_PITCH,
  CAMERA_SENSITIVITY,
  CAMERA_COLLISION,
} from '@/constants/camera';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import { clampPitch, computeCameraDesired, clampCameraDistance } from './math/cameraMath';

/* ── tuning constants ── */
const FOLLOW_LERP = 0.15;
const WALL_BUF = 0.2; // Smaller buffer since SphereCast has radius
/** First-person camera height above player pivot */
const FP_EYE_HEIGHT = 1.65;
/** Sphere radius for camera collision probe */
const SPHERE_RADIUS = 0.25;
/** Minimum distance to prevent self-collision */
const MIN_RAY_DIST = 0.6;
/** Lerp factor for expanding zoom (recovering from collision) */
const ZOOM_RECOVERY_SPEED = 2.0;

/* ── helpers ── */
function clampX(v: number) {
  return Math.min(DUNGEON_BOUNDS.maxX, Math.max(DUNGEON_BOUNDS.minX, v));
}
function clampZ(v: number) {
  return Math.min(DUNGEON_BOUNDS.maxZ, Math.max(DUNGEON_BOUNDS.minZ, v));
}

/* ── pre-allocated vectors (avoid GC) ── */
const _target = new Vector3();
const _smoothTarget = new Vector3();
const _desired = new Vector3();
const _lookAt = new Vector3();
const _smoothLookAt = new Vector3();
const _rayDir = new Vector3();
const _origin = new Vector3();

/* ═══════════════════════════════════════════════════════════
   CameraRig — MMORPG third-person + first-person toggle (V)
   ═══════════════════════════════════════════════════════════ */
export default function CameraRig({
  targetBody,
  yawRef,
  pitchRef,
}: {
  targetBody?: MutableRefObject<RapierRigidBody | null>;
  yawRef?: MutableRefObject<number>;
  pitchRef?: MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const { rapier, world } = useRapier();
  const isPointerLocked = useDungeonInput((s) => s.isPointerLocked);
  const mouseDown = useDungeonInput((s) => s.mouseDown);

  // Memoize collision shape to prevent memory churn
  const sphereShape = useRef<any>(null);
  useEffect(() => {
    if (!rapier) return;
    sphereShape.current = new rapier.Ball(SPHERE_RADIUS);
    return () => {
      // Rapier JS shapes are GC'd, but good habit to clear ref
      sphereShape.current = null;
    };
  }, [rapier]);

  const _yaw = useRef(0);
  const _pitch = useRef(CAMERA_PITCH.initial);
  const distRef = useRef<number>(CAMERA_DISTANCE.default);
  // Current collision-constrained distance (smoothed)
  const collisionDistRef = useRef<number>(CAMERA_DISTANCE.default);

  const lastClient = useRef<{ x: number; y: number } | null>(null);
  const initDone = useRef(false);
  /** false = third-person, true = first-person */
  const firstPerson = useRef(false);

  const yaw = yawRef ?? _yaw;
  const pitch = pitchRef ?? _pitch;

  /* ── reset client ref on pointer state change ── */
  useEffect(() => { lastClient.current = null; }, [isPointerLocked]);

  /* ── mouse & wheel listeners ── */
  useEffect(() => {
    const apply = (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) return;
      yaw.current -= dx * CAMERA_SENSITIVITY.yaw;
      const nextPitch = pitch.current - dy * CAMERA_SENSITIVITY.pitch;
      pitch.current = clampPitch(nextPitch);
    };

    const onMove = (e: PointerEvent) => {
      if (!isPointerLocked && !mouseDown) return;
      if (isPointerLocked) {
        apply(e.movementX || 0, e.movementY || 0);
      } else if (mouseDown && e.buttons > 0) {
        if (lastClient.current) {
          apply(e.clientX - lastClient.current.x, e.clientY - lastClient.current.y);
        }
        lastClient.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onRaw = (e: Event) => {
      if (!isPointerLocked) return;
      const pe = e as PointerEvent;
      apply(pe.movementX || 0, pe.movementY || 0);
    };

    const onWheel = (e: WheelEvent) => {
      // Scroll always controls zoom — MMORPG convention
      if (Math.abs(e.deltaY) > 0.01) {
        const newDist = distRef.current + Math.sign(e.deltaY) * CAMERA_DISTANCE.scrollStep;
        distRef.current = clampCameraDistance(newDist);

        // Auto-switch to first-person when zoomed all the way in
        if (distRef.current <= CAMERA_DISTANCE.min) {
          firstPerson.current = true;
        } else {
          firstPerson.current = false;
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyV' && !e.repeat) {
        firstPerson.current = !firstPerson.current;
        if (firstPerson.current) {
          distRef.current = CAMERA_DISTANCE.min;
        } else {
          distRef.current = Math.max(CAMERA_DISTANCE.default, distRef.current);
          // Reset collision distance to current to restart smoothing
          collisionDistRef.current = CAMERA_DISTANCE.min;
        }
      }
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerrawupdate', onRaw as EventListener);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerrawupdate', onRaw as EventListener);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isPointerLocked, mouseDown, pitch, yaw]);

  /* ── per-frame update ── */
  useFrame((_, dt) => {
    const body = targetBody?.current;
    if (!body) return;
    const pos = body.translation();
    _target.set(pos.x, pos.y, pos.z);

    // First frame: snap
    if (!initDone.current) {
      _smoothTarget.copy(_target);
      _lookAt.set(_target.x, _target.y + CAMERA_OFFSET.lookAtHeight, _target.z);
      _smoothLookAt.copy(_lookAt);
      collisionDistRef.current = distRef.current;
      initDone.current = true;
    }

    // Smooth follow target
    const t = Math.min(1, FOLLOW_LERP * dt * 60);
    _smoothTarget.lerp(_target, t);
    _lookAt.set(_target.x, _target.y + CAMERA_OFFSET.lookAtHeight, _target.z);
    _smoothLookAt.lerp(_lookAt, t);

    const isFP = firstPerson.current;

    if (isFP) {
      /* ── FIRST-PERSON MODE ── */
      _desired.set(
        _smoothTarget.x,
        _smoothTarget.y + FP_EYE_HEIGHT,
        _smoothTarget.z,
      );
      _desired.x = clampX(_desired.x);
      _desired.z = clampZ(_desired.z);

      // Look direction from yaw/pitch
      const lookDist = 10;
      const fpLookX = _desired.x + Math.sin(yaw.current) * Math.cos(pitch.current) * lookDist;
      const fpLookY = _desired.y - Math.sin(pitch.current) * lookDist;
      const fpLookZ = _desired.z + Math.cos(yaw.current) * Math.cos(pitch.current) * lookDist;

      camera.position.lerp(_desired, Math.min(1, t * 2));
      _smoothLookAt.set(fpLookX, fpLookY, fpLookZ);
      camera.lookAt(_smoothLookAt);

    } else {
      /* ── THIRD-PERSON MODE ── */

      // 1. Compute ideal position (ignoring walls)
      // Pass pivotHeight=1.5 explicitly to ensure orbit center is correct
      const ideal = computeCameraDesired(
        { x: _smoothTarget.x, y: _smoothTarget.y, z: _smoothTarget.z },
        yaw.current, pitch.current, distRef.current, CAMERA_OFFSET,
        1.5
      );
      _desired.set(ideal.x, ideal.y, ideal.z);

      // 2. Perform SphereCast collision check
      // Cast from (Target + Offset) towards Camera
      _rayDir.copy(_desired).sub(_smoothTarget);
      const idealDist = _rayDir.length();
      let targetDist = idealDist;

      if (idealDist > MIN_RAY_DIST && sphereShape.current) {
        // Offset origin to clear player collider
        _origin.copy(_smoothTarget).addScaledVector(_rayDir.normalize(), MIN_RAY_DIST);

        // ShapeCast checks volume (radius 0.25)
        // Max TOI is the remaining distance after offset
        const maxToi = idealDist - MIN_RAY_DIST + WALL_BUF;

        const hit = (world as any).castShape(
          _origin,
          { w: 1, x: 0, y: 0, z: 0 },
          _rayDir, // normalized direction
          sphereShape.current,
          maxToi,
          true,
          undefined, // groups
          undefined, // filter
          undefined  // filterData
        );

        if (hit) {
          // Check for timeOfImpact property
          const toi = (hit as any).timeOfImpact ?? (hit as any).toi;
          if (typeof toi === 'number') {
            const hitDist = toi - WALL_BUF;
            targetDist = Math.max(CAMERA_COLLISION.minCameraDistance, MIN_RAY_DIST + hitDist);
          }
        }
      }

      // 3. Smooth Collision Recovery (MMORPG zoom behavior)
      // Instant snap IN (when blocked), Smooth lerp OUT (when looking away from wall)
      if (targetDist < collisionDistRef.current) {
        collisionDistRef.current = targetDist; // Snap
      } else {
        // Recover slowly
        collisionDistRef.current = MathUtils.lerp(collisionDistRef.current, targetDist, dt * ZOOM_RECOVERY_SPEED);
      }

      // 4. Final Position
      // Re-project `_desired` along the ray direction using the smoothed distance
      _rayDir.copy(_desired).sub(_smoothTarget).normalize();
      _desired.copy(_smoothTarget).addScaledVector(_rayDir, collisionDistRef.current);

      // 5. Bounds Clamping
      _desired.x = clampX(_desired.x);
      _desired.z = clampZ(_desired.z);
      // Ceiling clamp
      if (_desired.y > CAMERA_COLLISION.maxCameraY) _desired.y = CAMERA_COLLISION.maxCameraY;

      // Apply to camera
      camera.position.lerp(_desired, t);
      camera.lookAt(_smoothLookAt);
    }
  });

  return null;
}
