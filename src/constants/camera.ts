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
  default: 5.4,
  /** Minimum zoom distance */
  min: 2.2,
  /** Maximum zoom distance */
  max: 9,
  /** Zoom step per scroll wheel tick */
  scrollStep: 0.45,
} as const;

// ========================================
// OFFSET SETTINGS
// ========================================
export const CAMERA_OFFSET = {
  /** Height above player pivot (legacy offset used by helper math) */
  height: 2.25,
  /** Horizontal offset for over-shoulder view */
  side: 0.42,
  /** Additional backward bias to keep the head in frame */
  back: 0.3,
  /** Look-at height offset (where camera points at on player) */
  lookAtHeight: 1.35,
  /** Stable orbit pivot height for MMO camera feel */
  pivotHeight: 1.5,
  /** Shoulder offset for slight asymmetric framing */
  shoulder: 0.42,
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
  smoothing: 0.0008,

  /**
   * Alternative: Direct lerp factor per frame (0.08-0.15 range)
   * Use this if not using exponential smoothing
   */
  lerpFactor: 0.14,
} as const;

export const CAMERA_DAMPING = {
  rotation: 16,
  pitch: 16,
  pivot: 12,
  lookAt: 14,
  position: 15,
  zoom: 10,
  collisionRecovery: 8,
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
  min: MathUtils.degToRad(-30),
  /** Maximum pitch angle (looking down) in radians */
  max: MathUtils.degToRad(35),
  /** Default starting pitch */
  initial: MathUtils.degToRad(-8),
} as const;

// ========================================
// COLLISION AVOIDANCE
// ========================================
export const CAMERA_COLLISION = {
  /** Minimum distance from collision surface */
  minDistanceFromWall: 0.32,
  /** Minimum allowed camera distance when colliding */
  minCameraDistance: 1.05,
  /** Hard vertical ceiling for camera world-space Y */
  maxCameraY: 28,
  /** Approximate camera body radius for multi-ray collision probing */
  radius: 0.35,
  /** Keep camera above floor/steps by this amount */
  minGroundClearance: 0.7,
  /** Additional map-border padding for camera clamp */
  boundsPadding: 2,
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
