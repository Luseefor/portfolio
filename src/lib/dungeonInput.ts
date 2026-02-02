import { create } from 'zustand';

type DungeonInputState = {
  hasFocus: boolean;
  isPointerLocked: boolean;
  freeCam: boolean;
  mouseDown: boolean;
  keys: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    run: boolean;
    jump: boolean;
  };
  lastEvent: string;
  setHasFocus: (hasFocus: boolean) => void;
  setPointerLocked: (isPointerLocked: boolean) => void;
  setFreeCam: (freeCam: boolean) => void;
  setMouseDown: (mouseDown: boolean) => void;
  setKeys: (next: Partial<DungeonInputState['keys']>) => void;
  addEvent: (event: string) => void;
  reset: () => void;
};

export const useDungeonInput = create<DungeonInputState>((set) => ({
  hasFocus: false,
  isPointerLocked: false,
  freeCam: false,
  mouseDown: false,
  keys: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
  },
  lastEvent: 'n/a',
  setHasFocus: (hasFocus) => set({ hasFocus }),
  setPointerLocked: (isPointerLocked) => set({ isPointerLocked }),
  setFreeCam: (freeCam) => set({ freeCam }),
  setMouseDown: (mouseDown) => set({ mouseDown }),
  setKeys: (next) => set((state) => ({ keys: { ...state.keys, ...next } })),
  addEvent: (event) => set({ lastEvent: event }),
  reset: () =>
    set({
      hasFocus: false,
      isPointerLocked: false,
      freeCam: false,
      mouseDown: false,
      keys: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
        jump: false,
      },
      lastEvent: 'reset',
    }),
}));
