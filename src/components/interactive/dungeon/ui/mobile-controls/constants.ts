export type ActionKey = 'jump' | 'roll' | 'dash' | 'attack';

export const JOYSTICK_RADIUS = 46;
export const JOYSTICK_DEADZONE = 0.14;
export const LOOK_DRAG_MIN_DELTA = 0.25;
export const ACTION_PULSE_MS = 115;

export const ACTION_BUTTONS: Array<{ key: ActionKey; label: string; testId: string }> = [
  { key: 'jump', label: 'Jump', testId: 'mobile-action-jump' },
  { key: 'roll', label: 'Roll', testId: 'mobile-action-roll' },
  { key: 'dash', label: 'Dash', testId: 'mobile-action-dash' },
  { key: 'attack', label: 'Attack', testId: 'mobile-action-attack' },
];
