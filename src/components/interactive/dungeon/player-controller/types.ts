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
