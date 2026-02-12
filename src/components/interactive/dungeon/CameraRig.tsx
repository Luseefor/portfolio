'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useDungeonInput } from '@/lib/dungeonInput';
import {
  CAMERA_DISTANCE,
  CAMERA_OFFSET,
  CAMERA_PITCH,
  CAMERA_SENSITIVITY,
  CAMERA_COLLISION,
} from '@/constants/camera';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import { applyMouseDelta, clampCameraDistance, computeCameraDesired, computeSmoothingFactor } from './math/cameraMath';

/* ── reusable vectors (avoiding per-frame allocations) ── */
const _target = new Vector3();
const _smoothTarget = new Vector3();
const _lookAt = new Vector3();
const _smoothLookAt = new Vector3();
const _desired = new Vector3();
const _rayDir = new Vector3();
const _rayOrigin = new Vector3();
const _probeRight = new Vector3();

/* ── tuning constants ── */
/** How fast the camera chases the player (0→1, higher = snappier) */
const FOLLOW_LERP = 0.12;
/** Side-probe offset for multi-ray wall check */
const PROBE_OFFSET = 0.5;
/** Floor probe origin height above player */
const FLOOR_PROBE_H = 3.0;
/** Floor probe max downward distance */
const FLOOR_PROBE_D = 12;
/** Minimum camera clearance above floor */
const FLOOR_CLEARANCE = 0.5;
/** Minimum absolute Y for camera */
const MIN_Y = 0.4;
/** Wall collision buffer */
const WALL_BUF = 1.2;

/* ── helpers ── */
function clampX(v: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxX - DUNGEON_BOUNDS.cameraPadding,
    Math.max(DUNGEON_BOUNDS.minX + DUNGEON_BOUNDS.cameraPadding, v),
  );
}
function clampZ(v: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxZ - DUNGEON_BOUNDS.cameraPadding,
    Math.max(DUNGEON_BOUNDS.minZ + DUNGEON_BOUNDS.cameraPadding, v),
  );
}

/* ═══════════════════════════════════════════════════════════
   CameraRig  —  third-person MMORPG camera
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

  const yaw = yawRef ?? _yaw;
  const pitch = pitchRef ?? _pitch;

  /* ── reset client ref on pointer state change ── */
  useEffect(() => { lastClient.current = null; }, [isPointerLocked]);

  /* ── mouse & wheel listeners ── */
  useEffect(() => {
    const apply = (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) return;
      const r = applyMouseDelta(yaw.current, pitch.current, dx, dy, CAMERA_SENSITIVITY, CAMERA_PITCH);
      yaw.current = r.yaw;
      pitch.current = r.pitch;
    };

    const onMove = (e: MouseEvent) => {
      if (!isPointerLocked && !mouseDown) return;
      const rx = e.movementX || 0;
      const ry = e.movementY || 0;
      if (rx === 0 && ry === 0 && isPointerLocked) {
        if (lastClient.current) {
          apply(e.clientX - lastClient.current.x, e.clientY - lastClient.current.y);
        }
        lastClient.current = { x: e.clientX, y: e.clientY };
        return;
      }
      lastClient.current = { x: e.clientX, y: e.clientY };
      apply(rx, ry);
    };

    const onRaw = (e: PointerEvent) => {
      if (!isPointerLocked && !mouseDown) return;
      apply(e.movementX || 0, e.movementY || 0);
    };

    const onWheel = (e: WheelEvent) => {
      // Scroll always controls zoom — MMORPG convention
      if (Math.abs(e.deltaY) > 0.01) {
        distRef.current = clampCameraDistance(
          distRef.current + Math.sign(e.deltaY) * CAMERA_DISTANCE.scrollStep,
        );
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('pointerrawupdate', onRaw as EventListener);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerrawupdate', onRaw as EventListener);
      window.removeEventListener('wheel', onWheel);
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

    // Smooth follow — use simple lerp at FOLLOW_LERP per frame (frame-rate adaptive)
    const t = Math.min(1, FOLLOW_LERP * dt * 60); // ~0.08 at 60 fps
    _smoothTarget.lerp(_target, t);
    _lookAt.set(_target.x, _target.y + CAMERA_OFFSET.lookAtHeight, _target.z);
    _smoothLookAt.lerp(_lookAt, t);

    // Compute desired camera position from player + yaw/pitch/distance
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
    let safeDist = rayLen;

    if (rayLen > 0.05) {
      _rayDir.normalize();
      // Perpendicular horizontal offset for side probes
      _probeRight.set(_rayDir.z, 0, -_rayDir.x).normalize();

      const offsets = [
        { x: 0, z: 0 },
        { x: _probeRight.x * PROBE_OFFSET, z: _probeRight.z * PROBE_OFFSET },
        { x: -_probeRight.x * PROBE_OFFSET, z: -_probeRight.z * PROBE_OFFSET },
      ];

      for (const off of offsets) {
        _rayOrigin.set(
          _smoothTarget.x + off.x,
          _smoothTarget.y,
          _smoothTarget.z + off.z,
        );
        const ray = new rapier.Ray(
          { x: _rayOrigin.x, y: _rayOrigin.y, z: _rayOrigin.z },
          { x: _rayDir.x, y: _rayDir.y, z: _rayDir.z },
        );
        const hit = world.castRay(ray, rayLen, true);
        if (hit) {
          const s = Math.max(
            CAMERA_COLLISION.minCameraDistance,
            hit.timeOfImpact - WALL_BUF,
          );
          safeDist = Math.min(safeDist, s);
        }
      }

      if (safeDist < rayLen) {
        _desired.copy(_smoothTarget).add(_rayDir.multiplyScalar(safeDist));
        _desired.x = clampX(_desired.x);
        _desired.z = clampZ(_desired.z);
        if (_desired.y > CAMERA_COLLISION.maxCameraY) _desired.y = CAMERA_COLLISION.maxCameraY;
      }
    }

    // Floor clearance probe
    const probeY = _smoothTarget.y + FLOOR_PROBE_H;
    const floorAt = (x: number, z: number) => {
      const r = new rapier.Ray({ x, y: probeY, z }, { x: 0, y: -1, z: 0 });
      const h = world.castRay(r, FLOOR_PROBE_D, true);
      return h ? probeY - h.timeOfImpact : null;
    };
    const fD = floorAt(_desired.x, _desired.z);
    const fT = floorAt(_smoothTarget.x, _smoothTarget.z);
    const floorY = fD != null && fT != null ? Math.max(fD, fT) : (fD ?? fT ?? _smoothTarget.y);
    const minY = Math.max(MIN_Y, floorY + FLOOR_CLEARANCE);
    if (_desired.y < minY) _desired.y = minY;

    // Apply — lerp camera toward desired
    camera.position.lerp(_desired, t);
    if (camera.position.y < minY) camera.position.y = minY;
    if (camera.position.y > CAMERA_COLLISION.maxCameraY) camera.position.y = CAMERA_COLLISION.maxCameraY;
    camera.position.x = clampX(camera.position.x);
    camera.position.z = clampZ(camera.position.z);
    camera.lookAt(_smoothLookAt);
  });

  return null;
}
