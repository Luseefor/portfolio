import { Quaternion, Vector3 } from 'three';
import { DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';

export const WALK_SPEED = 2.4;
export const RUN_SPEED = 6.2;
export const SMOOTHING = 10;
export const JUMP_SPEED = 7.2;
export const GRAVITY = 24;

export const START_POSITION: [number, number, number] = [
  DUNGEON_LAYOUT_GRAPH.spawnPoint[0],
  DUNGEON_LAYOUT_GRAPH.spawnPoint[1],
  DUNGEON_LAYOUT_GRAPH.spawnPoint[2],
];

export const STEP_INTERVAL_WALK = 0.6;
export const PLAYER_LIFT_UP_SMOOTHING = 18;
export const PLAYER_LIFT_DOWN_SMOOTHING = 8;
export const DASH_DURATION = 0.2;
export const DASH_COOLDOWN = 0.95;
export const DASH_MAX_DISTANCE = 5.8;
export const DASH_MIN_DISTANCE = 1.6;
export const DASH_RAY_BUFFER = 0.45;
export const DASH_COLLISION_OFFSET = 0.4;
export const DASH_CAMERA_KICK = 2.25;
export const DASH_FOV_DAMPING = 14;
export const ROLL_DURATION = 0.62;
export const ROLL_SPEED = 8.4;
export const ROLL_COOLDOWN = 0.35;
export const ATTACK_DURATION = 0.38;
export const ATTACK_COOLDOWN = 0.24;
export const ATTACK_LUNGE_WINDOW = 0.14;
export const ATTACK_LUNGE_SPEED = 2.1;
export const RUN_LOOP_SPEED_THRESHOLD = WALK_SPEED * 1.35;
export const RUN_LOOP_START_OFFSET = 3;
export const RUN_LOOP_WRAP_EPSILON = 0.04;
export const MIN_LAND_IMPACT_SPEED = 2.5;
export const MIN_LAND_AIRBORNE_TIME = 0.14;
export const COYOTE_TIME = 0.24;
export const JUMP_BUFFER_TIME = 0.24;
export const GROUND_RAY_ORIGIN_OFFSET = 0.14;
export const GROUND_RAY_LENGTH = 0.62;
export const MAX_GROUNDED_UP_VELOCITY = 2.2;
export const MOVE_AXIS_DEADZONE = 0.08;
export const MOVE_AXIS_RUN_THRESHOLD = 0.78;
export const PLAYER_STATE_PUBLISH_INTERVAL = 1 / 20;
export const PLAYER_STATE_POS_EPSILON = 0.025;
export const PLAYER_STATE_SPEED_EPSILON = 0.1;
export const PLAYER_STATE_DIR_DOT_EPSILON = 0.998;
export const STEP_BASE_VOLUME = 0.35;
export const RUN_LOOP_BASE_VOLUME = 0.42;
export const JUMP_BASE_VOLUME = 0.42;
export const LAND_BASE_VOLUME = 0.48;

export const frameScratch = {
  forward: new Vector3(),
  right: new Vector3(),
  up: new Vector3(0, 1, 0),
  moveDir: new Vector3(),
  dashDirection: new Vector3(),
  rotation: new Quaternion(),
  bodyQuaternion: new Quaternion(),
  stateForward: new Vector3(),
};
