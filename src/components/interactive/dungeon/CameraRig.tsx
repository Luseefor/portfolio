'use client';

import { useEffect, useRef } from 'react';
import { Vector3, MathUtils, Quaternion, Euler } from 'three';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { useDungeonInput } from '@/lib/dungeonInput';
import {
  CAMERA_DISTANCE,
  CAMERA_PITCH,
  CAMERA_SENSITIVITY,
  CAMERA_COLLISION,
} from '@/constants/camera';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import { clampPitch, clampCameraDistance } from './math/cameraMath';

/* ── tuning constants ── */
const PIVOT_LERP = 0.4; // Fast damping to hide physics jitter
const FPS_LERP = 0.8;
const WALL_BUF = 0.2;
const PIVOT_HEIGHT = 1.5; // Head/Chest height
const FPS_FORWARD_OFFSET = 0.45; // Clear face mesh
const SPHERE_RADIUS = 0.25;
const MIN_RAY_DIST = 0.5;
const ZOOM_RECOVERY_SPEED = 3.0; // Faster recovery for action feel

/* ── helpers ── */
function clampX(v: number) {
  return Math.min(DUNGEON_BOUNDS.maxX, Math.max(DUNGEON_BOUNDS.minX, v));
}
function clampZ(v: number) {
  return Math.min(DUNGEON_BOUNDS.maxZ, Math.max(DUNGEON_BOUNDS.minZ, v));
}

/* ── pre-allocated objects (avoid GC) ── */
const _targetPos = new Vector3();
const _pivot = new Vector3();
const _idealPos = new Vector3();
const _offset = new Vector3();
const _quat = new Quaternion();
const _euler = new Euler(0, 0, 0, 'YXZ');
const _rayDir = new Vector3();
const _origin = new Vector3();

/* ═══════════════════════════════════════════════════════════
   CameraRig — Standard Spring Arm (Boom) System
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

  /* ── Input Handling ── */
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

  /* ── Physics & Camera Loop ── */
  useFrame((_, dt) => {
    const body = targetBody?.current;
    if (!body) return;
    const pos = body.translation();
    _targetPos.set(pos.x, pos.y + PIVOT_HEIGHT, pos.z);

    // Initialization: snap to target
    if (!initDone.current) {
      _pivot.copy(_targetPos);
      collisionDistRef.current = distRef.current;
      initDone.current = true;
    }

    // 1. Damped Pivot Follow
    // Hides physics jitter while keeping camera responsive
    // Use faster lerp for FPS to reduce lag
    const lerpFactor = firstPerson.current ? FPS_LERP : PIVOT_LERP;
    const t = Math.min(1, lerpFactor * dt * 60);
    _pivot.lerp(_targetPos, t);

    // 2. Camera Rotation (Direct Control)
    // No smoothing here — eliminates "drunk" feel
    _euler.set(pitch.current, yaw.current, 0, 'YXZ');
    _quat.setFromEuler(_euler);
    camera.quaternion.copy(_quat);

    // 3. Boom Offset & Collision
    const isFP = firstPerson.current;
    let finalDist = 0;

    if (isFP) {
      // FPS: Shift pivot forward to clear face
      _offset.set(0, 0, -FPS_FORWARD_OFFSET).applyQuaternion(_quat);
      _idealPos.copy(_pivot).add(_offset);

      camera.position.copy(_idealPos);
    } else {
      // Third Person: Boom Arm

      // Calculate Ideal Position (ignoring walls)
      // Vector pointing BACK from pivot
      _offset.set(0, 0, distRef.current).applyQuaternion(_quat);
      _idealPos.copy(_pivot).add(_offset);

      // SphereCast for Boom Collision
      _rayDir.copy(_offset).normalize();
      const idealDist = distRef.current;
      let targetDist = idealDist;

      if (idealDist > MIN_RAY_DIST && sphereShape.current) {
        // Offset origin slightly to avoid self-collision with player capsule
        _origin.copy(_pivot).addScaledVector(_rayDir, MIN_RAY_DIST);
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

      // Smooth Recovery (Snap-in, Lerp-out)
      if (targetDist < collisionDistRef.current) {
        collisionDistRef.current = targetDist; // Snap
      } else {
        collisionDistRef.current = MathUtils.lerp(collisionDistRef.current, targetDist, dt * ZOOM_RECOVERY_SPEED);
      }

      // Apply Final Position
      _offset.set(0, 0, collisionDistRef.current).applyQuaternion(_quat);

      // Clamp bounds (floor/ceiling/walls)
      // We clamp the FINAL position, not just lookAt
      const finalPos = _idealPos.copy(_pivot).add(_offset);
      finalPos.x = clampX(finalPos.x);
      finalPos.z = clampZ(finalPos.z);
      if (finalPos.y > CAMERA_COLLISION.maxCameraY) finalPos.y = CAMERA_COLLISION.maxCameraY;
      // Floor clamp (optional, prevents going under map if no collision)
      if (finalPos.y < 0.2) finalPos.y = 0.2;

      camera.position.copy(finalPos);
    }
  });

  return null;
}
