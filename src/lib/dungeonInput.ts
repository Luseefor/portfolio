import { create } from 'zustand';

type DungeonInputState = {
  hasFocus: boolean;
  isPointerLocked: boolean;
  setHasFocus: (hasFocus: boolean) => void;
  setPointerLocked: (isPointerLocked: boolean) => void;
  reset: () => void;
};

export const useDungeonInput = create<DungeonInputState>((set) => ({
  hasFocus: false,
  isPointerLocked: false,
  setHasFocus: (hasFocus) => set({ hasFocus }),
  setPointerLocked: (isPointerLocked) => set({ isPointerLocked }),
  reset: () => set({ hasFocus: false, isPointerLocked: false }),
}));
