export type PlayerInputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  dash: boolean;
  jump: boolean;
  roll: boolean;
  attack: boolean;
};

export type DashRuntimeState = {
  active: boolean;
  timeLeft: number;
  speed: number;
  direction: {
    x: number;
    y: number;
    z: number;
    copy: (vector: { x: number; y: number; z: number }) => unknown;
  };
};

export function createEmptyInputState(): PlayerInputState {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    dash: false,
    jump: false,
    roll: false,
    attack: false,
  };
}
