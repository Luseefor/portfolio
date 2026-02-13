import { create } from 'zustand';

type Vec2 = { x: number; y: number };

type DungeonInputState = {
  hasFocus: boolean;
  isPointerLocked: boolean;
  freeCam: boolean;
  mouseDown: boolean;
  isTouchDevice: boolean;
  moveAxis: Vec2;
  lookDelta: Vec2;
  keys: {
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
  lastEvent: string;
  setHasFocus: (hasFocus: boolean) => void;
  setPointerLocked: (isPointerLocked: boolean) => void;
  setFreeCam: (freeCam: boolean) => void;
  setMouseDown: (mouseDown: boolean) => void;
  setTouchDevice: (isTouchDevice: boolean) => void;
  setMoveAxis: (moveAxis: Vec2) => void;
  addLookDelta: (delta: Vec2) => void;
  consumeLookDelta: () => Vec2;
  setKeys: (next: Partial<DungeonInputState['keys']>) => void;
  addEvent: (event: string) => void;
  reset: () => void;
};

const ZERO_VEC2: Vec2 = { x: 0, y: 0 };

function clampAxis(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

export const useDungeonInput = create<DungeonInputState>((set, get) => ({
  hasFocus: false,
  isPointerLocked: false,
  freeCam: false,
  mouseDown: false,
  isTouchDevice: false,
  moveAxis: ZERO_VEC2,
  lookDelta: ZERO_VEC2,
  keys: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    dash: false,
    jump: false,
    roll: false,
    attack: false,
  },
  lastEvent: 'n/a',
  setHasFocus: (hasFocus) => set({ hasFocus }),
  setPointerLocked: (isPointerLocked) => set({ isPointerLocked }),
  setFreeCam: (freeCam) => set({ freeCam }),
  setMouseDown: (mouseDown) => set({ mouseDown }),
  setTouchDevice: (isTouchDevice) => set({ isTouchDevice }),
  setMoveAxis: (moveAxis) =>
    set({
      moveAxis: {
        x: clampAxis(moveAxis.x),
        y: clampAxis(moveAxis.y),
      },
    }),
  addLookDelta: (delta) =>
    set((state) => ({
      lookDelta: {
        x: state.lookDelta.x + (Number.isFinite(delta.x) ? delta.x : 0),
        y: state.lookDelta.y + (Number.isFinite(delta.y) ? delta.y : 0),
      },
    })),
  consumeLookDelta: () => {
    const current = get().lookDelta;
    if (current.x === 0 && current.y === 0) return ZERO_VEC2;
    set({ lookDelta: ZERO_VEC2 });
    return current;
  },
  setKeys: (next) => set((state) => ({ keys: { ...state.keys, ...next } })),
  addEvent: (event) => set({ lastEvent: event }),
  reset: () =>
    set({
      hasFocus: false,
      isPointerLocked: false,
      freeCam: false,
      mouseDown: false,
      isTouchDevice: false,
      moveAxis: ZERO_VEC2,
      lookDelta: ZERO_VEC2,
      keys: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
        dash: false,
        jump: false,
        roll: false,
        attack: false,
      },
      lastEvent: 'reset',
    }),
}));
