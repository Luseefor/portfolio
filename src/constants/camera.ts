/**
 * Camera Tuning Constants - Agent B (B3)
 *
 * Recommended values for third-person camera rig in dungeon exploration.
 * These values are tuned for readability while maintaining atmosphere.
 */

import { MathUtils } from 'three';

// ========================================
// DISTANCE SETTINGS
// ========================================
export const CAMERA_DISTANCE = {
  /** Default camera distance from player */
  default: 12,
  /** Minimum zoom distance */
  min: 5,
  /** Maximum zoom distance */
  max: 18,
  /** Zoom step per scroll wheel tick */
  scrollStep: 0.6,
} as const;

// ========================================
// OFFSET SETTINGS
// ========================================
export const CAMERA_OFFSET = {
  /** Height above player pivot (eye level offset) */
  height: 0.0,
  /** Horizontal offset for over-shoulder view (0 = centered) */
  side: 0.6,
  /** Additional backward bias to keep the head in frame */
  back: 1.0,
  /** Look-at height offset (where camera points at on player) */
  lookAtHeight: 1.5,
} as const;

// ========================================
// SMOOTHING / FOLLOW SETTINGS
// ========================================
export const CAMERA_FOLLOW = {
  /**
   * Smoothing factor for camera position lerp.
   * Lower = smoother/slower, Higher = snappier
   * Formula: lerp(current, target, 1 - pow(smoothing, delta))
   */
  smoothing: 0.0004,

  /**
   * Alternative: Direct lerp factor per frame (0.08-0.15 range)
   * Use this if not using exponential smoothing
   */
  lerpFactor: 0.12,
} as const;

// ========================================
// MOUSE LOOK SETTINGS
// ========================================
export const CAMERA_SENSITIVITY = {
  /** Horizontal (yaw) mouse sensitivity */
  yaw: 0.0028,
  /** Vertical (pitch) mouse sensitivity */
  pitch: 0.0024,
} as const;

// ========================================
// PITCH CLAMP (in degrees, converted to radians)
// ========================================
export const CAMERA_PITCH = {
  /** Minimum pitch angle (looking up) in radians */
  min: MathUtils.degToRad(-15),
  /** Maximum pitch angle (looking down) in radians */
  max: MathUtils.degToRad(55),
  /** Default starting pitch */
  initial: MathUtils.degToRad(15),
} as const;

// ========================================
// COLLISION AVOIDANCE
// ========================================
export const CAMERA_COLLISION = {
  /** Minimum distance from collision surface */
  minDistanceFromWall: 0.6,
  /** Minimum allowed camera distance when colliding */
  minCameraDistance: 2.0,
  /** Maximum camera Y (ceiling clearance) — 3.5m is just below wall height (4m) */
  maxCameraY: 3.5,
} as const;

// ========================================
// COMBINED PRESET (for easy import)
// ========================================
export const CAMERA_CONFIG = {
  distance: CAMERA_DISTANCE,
  offset: CAMERA_OFFSET,
  follow: CAMERA_FOLLOW,
  sensitivity: CAMERA_SENSITIVITY,
  pitch: CAMERA_PITCH,
  collision: CAMERA_COLLISION,
} as const;
