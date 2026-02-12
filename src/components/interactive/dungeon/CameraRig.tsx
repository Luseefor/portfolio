'use client';

import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
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
import { Ray as RapierRay } from '@dimforge/rapier3d-compat';

/* ── tuning constants ── */
const FOLLOW_LERP = 0.12;
const PROBE_OFFSET = 0.5;
const FLOOR_PROBE_HEIGHT = 1.5;
const FLOOR_CLEARANCE = 0.6;
const MIN_Y = 0.4;
const WALL_BUF = 1.2;
/** First-person camera height above player pivot */
const FP_EYE_HEIGHT = 1.65;

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
const _probeSide = new Vector3();

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

  const _yaw = useRef(0);
  const _pitch = useRef(CAMERA_PITCH.initial);
  const distRef = useRef<number>(CAMERA_DISTANCE.default);
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
          distRef.current = CAMERA_DISTANCE.default;
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
      initDone.current = true;
    }

    // Smooth follow
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
      if (_desired.y > CAMERA_COLLISION.maxCameraY) _desired.y = CAMERA_COLLISION.maxCameraY;

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
      const d = computeCameraDesired(
        { x: _smoothTarget.x, y: _smoothTarget.y, z: _smoothTarget.z },
        yaw.current, pitch.current, distRef.current, CAMERA_OFFSET,
      );
      _desired.set(d.x, d.y, d.z);
      _desired.x = clampX(_desired.x);
      _desired.z = clampZ(_desired.z);

      // Ceiling clamp
      if (_desired.y > CAMERA_COLLISION.maxCameraY) _desired.y = CAMERA_COLLISION.maxCameraY;

      // ── Wall collision: 3-ray probe (center + left + right) ──
      _rayDir.copy(_desired).sub(_smoothTarget);
      const rayLen = _rayDir.length();
      if (rayLen > 0.001) {
        _rayDir.divideScalar(rayLen);
        const maxTOI = rayLen + WALL_BUF;

        // Center ray
        const rCenter = new RapierRay(
          { x: _smoothTarget.x, y: _smoothTarget.y, z: _smoothTarget.z },
          { x: _rayDir.x, y: _rayDir.y, z: _rayDir.z },
        );
        const hitCenter = world.castRay(rCenter, maxTOI, true);

        // Left/right side probes
        _probeSide.set(-_rayDir.z, 0, _rayDir.x).normalize().multiplyScalar(PROBE_OFFSET);
        const rLeft = new RapierRay(
          { x: _smoothTarget.x + _probeSide.x, y: _smoothTarget.y, z: _smoothTarget.z + _probeSide.z },
          { x: _rayDir.x, y: _rayDir.y, z: _rayDir.z },
        );
        const hitLeft = world.castRay(rLeft, maxTOI, true);

        _probeSide.negate();
        const rRight = new RapierRay(
          { x: _smoothTarget.x + _probeSide.x, y: _smoothTarget.y, z: _smoothTarget.z + _probeSide.z },
          { x: _rayDir.x, y: _rayDir.y, z: _rayDir.z },
        );
        const hitRight = world.castRay(rRight, maxTOI, true);

        let nearest = rayLen;
        if (hitCenter) nearest = Math.min(nearest, hitCenter.timeOfImpact - WALL_BUF);
        if (hitLeft) nearest = Math.min(nearest, hitLeft.timeOfImpact - WALL_BUF);
        if (hitRight) nearest = Math.min(nearest, hitRight.timeOfImpact - WALL_BUF);
        nearest = Math.max(CAMERA_COLLISION.minDistanceFromWall, nearest);

        if (nearest < rayLen) {
          _desired.copy(_smoothTarget).addScaledVector(_rayDir, nearest);
        }
      }

      // Floor clearance probe
      const floorRay = new RapierRay(
        { x: _desired.x, y: _desired.y + FLOOR_PROBE_HEIGHT, z: _desired.z },
        { x: 0, y: -1, z: 0 },
      );
      const floorHit = world.castRay(floorRay, FLOOR_PROBE_HEIGHT + 10, true);
      if (floorHit) {
        const groundY = _desired.y + FLOOR_PROBE_HEIGHT - floorHit.timeOfImpact;
        const minY = Math.max(MIN_Y, groundY + FLOOR_CLEARANCE);
        if (_desired.y < minY) _desired.y = minY;
      }

      // Apply — lerp camera toward desired
      camera.position.lerp(_desired, t);
      camera.lookAt(_smoothLookAt);
    }
  });

  return null;
}
