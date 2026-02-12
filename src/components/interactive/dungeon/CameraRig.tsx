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
const FPS_LERP = 0.8; // Faster, snappier follow for first-person
const WALL_BUF = 0.2;
/** First-person camera height above player pivot */
const FP_EYE_HEIGHT = 1.65;
/** Forward offset for FPS camera relative to body center (clears face) */
const FP_FORWARD_OFFSET = 0.45;

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

  // Memoize collision shape
  const sphereShape = useRef<any>(null);
  useEffect(() => {
    if (!rapier) return;
    sphereShape.current = new rapier.Ball(SPHERE_RADIUS);
    return () => {
      sphereShape.current = null;
    };
  }, [rapier]);

  const _yaw = useRef(0);
  const _pitch = useRef(CAMERA_PITCH.initial);
  const distRef = useRef<number>(CAMERA_DISTANCE.default);
  const collisionDistRef = useRef<number>(CAMERA_DISTANCE.default);

  const lastClient = useRef<{ x: number; y: number } | null>(null);
  const initDone = useRef(false);
  const firstPerson = useRef(false);

  const yaw = yawRef ?? _yaw;
  const pitch = pitchRef ?? _pitch;

  useEffect(() => { lastClient.current = null; }, [isPointerLocked]);

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
      if (Math.abs(e.deltaY) > 0.01) {
        const newDist = distRef.current + Math.sign(e.deltaY) * CAMERA_DISTANCE.scrollStep;
        distRef.current = clampCameraDistance(newDist);

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

  useFrame((_, dt) => {
    const body = targetBody?.current;
    if (!body) return;
    const pos = body.translation();
    _target.set(pos.x, pos.y, pos.z);

    if (!initDone.current) {
      _smoothTarget.copy(_target);
      _lookAt.set(_target.x, _target.y + CAMERA_OFFSET.lookAtHeight, _target.z);
      _smoothLookAt.copy(_lookAt);
      collisionDistRef.current = distRef.current;
      initDone.current = true;
    }

    const isFP = firstPerson.current;

    /* ── FIRST-PERSON MODE ── */
    if (isFP) {
      // Snappier follow for FPS (reduced lag)
      const t = Math.min(1, FPS_LERP * dt * 60);
      _smoothTarget.lerp(_target, t);

      // Offset camera forward relative to view direction to clear face mesh
      // View direction (XZ projection) is opposite to yaw angle?
      // If yaw=0, camera is at +Z looking at -Z. Forward is (0, -1).
      // sin(0)=0. cos(0)=1. 
      // viewX = -sin(yaw), viewZ = -cos(yaw).
      const viewX = -Math.sin(yaw.current);
      const viewZ = -Math.cos(yaw.current);

      _desired.set(
        _smoothTarget.x + viewX * FP_FORWARD_OFFSET,
        _smoothTarget.y + FP_EYE_HEIGHT,
        _smoothTarget.z + viewZ * FP_FORWARD_OFFSET
      );

      // Bounds clamping
      _desired.x = clampX(_desired.x);
      _desired.z = clampZ(_desired.z);
      if (_desired.y > CAMERA_COLLISION.maxCameraY) _desired.y = CAMERA_COLLISION.maxCameraY;

      // Apply INSTANTLY to camera position (no secondary lerp) to prevent "drunk" lag
      camera.position.copy(_desired);

      // Calculate look target based on pitch
      const lookDist = 10;
      // Note: cos(pitch) scales X/Z components based on vertical angle
      const fpLookX = _desired.x + viewX * Math.cos(pitch.current) * lookDist;
      const fpLookY = _desired.y - Math.sin(pitch.current) * lookDist;
      const fpLookZ = _desired.z + viewZ * Math.cos(pitch.current) * lookDist;

      // Apply lookAt instantly 
      camera.lookAt(fpLookX, fpLookY, fpLookZ);
      // Sync smooth lookAt vector so it's ready when switching back
      _smoothLookAt.set(fpLookX, fpLookY, fpLookZ);

      /* ── THIRD-PERSON MODE ── */
    } else {
      // Smoother follow for cinematic feel
      const t = Math.min(1, FOLLOW_LERP * dt * 60);
      _smoothTarget.lerp(_target, t);

      // 1. Compute ideal position (ignoring walls)
      // Pass pivotHeight=1.5 explicitly
      const ideal = computeCameraDesired(
        { x: _smoothTarget.x, y: _smoothTarget.y, z: _smoothTarget.z },
        yaw.current, pitch.current, distRef.current, CAMERA_OFFSET,
        1.5
      );
      _desired.set(ideal.x, ideal.y, ideal.z);

      // 2. SphereCast Collision
      _rayDir.copy(_desired).sub(_smoothTarget);
      const idealDist = _rayDir.length();
      let targetDist = idealDist;

      if (idealDist > MIN_RAY_DIST && sphereShape.current) {
        _origin.copy(_smoothTarget).addScaledVector(_rayDir.normalize(), MIN_RAY_DIST);
        const maxToi = idealDist - MIN_RAY_DIST + WALL_BUF;

        const hit = (world as any).castShape(
          _origin,
          { w: 1, x: 0, y: 0, z: 0 },
          _rayDir,
          sphereShape.current,
          maxToi,
          true,
          undefined,
          undefined,
          undefined
        );

        if (hit) {
          const toi = (hit as any).timeOfImpact ?? (hit as any).toi;
          if (typeof toi === 'number') {
            const hitDist = toi - WALL_BUF;
            targetDist = Math.max(CAMERA_COLLISION.minCameraDistance, MIN_RAY_DIST + hitDist);
          }
        }
      }

      // 3. Smooth Recovery
      if (targetDist < collisionDistRef.current) {
        collisionDistRef.current = targetDist; // Snap IN
      } else {
        collisionDistRef.current = MathUtils.lerp(collisionDistRef.current, targetDist, dt * ZOOM_RECOVERY_SPEED); // Lerp OUT
      }

      // 4. Final Position
      _rayDir.copy(_desired).sub(_smoothTarget).normalize();
      _desired.copy(_smoothTarget).addScaledVector(_rayDir, collisionDistRef.current);

      // 5. Clamping & Apply
      _desired.x = clampX(_desired.x);
      _desired.z = clampZ(_desired.z);
      if (_desired.y > CAMERA_COLLISION.maxCameraY) _desired.y = CAMERA_COLLISION.maxCameraY;

      camera.position.lerp(_desired, t);

      // LookAt Target smoothing
      _lookAt.set(_target.x, _target.y + CAMERA_OFFSET.lookAtHeight, _target.z);
      _smoothLookAt.lerp(_lookAt, t);
      camera.lookAt(_smoothLookAt);
    }
  });

  return null;
}
