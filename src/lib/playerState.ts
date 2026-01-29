import { create } from 'zustand';

export type Vec3 = { x: number; y: number; z: number };

export type PlayerState = {
  position: Vec3;
  forward: Vec3;
  speed: number;
  grounded: boolean;
  isMoving: boolean;
};

type PlayerStore = PlayerState & {
  setPlayerState: (next: Partial<PlayerState>) => void;
};

export const usePlayerState = create<PlayerStore>((set) => ({
  position: { x: 0, y: 0, z: 0 },
  forward: { x: 0, y: 0, z: 1 },
  speed: 0,
  grounded: false,
  isMoving: false,
  setPlayerState: (next) => set(next),
}));

export const playerStateSelectors = {
  position: (state: PlayerStore) => state.position,
  forward: (state: PlayerStore) => state.forward,
  speed: (state: PlayerStore) => state.speed,
  grounded: (state: PlayerStore) => state.grounded,
  isMoving: (state: PlayerStore) => state.isMoving,
};

export const subscribeToPlayerState = usePlayerState.subscribe;

/*
Usage example (Agent B):

import { usePlayerState, playerStateSelectors } from '@/lib/playerState';

const position = usePlayerState(playerStateSelectors.position);
const speed = usePlayerState(playerStateSelectors.speed);
*/
