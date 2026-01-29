import { create } from 'zustand';

/**
 * PlayerState - Read-only state for Agent B components
 * 
 * This state is populated by Agent A's player controller.
 * Agent B components should ONLY read from this state, never write.
 * 
 * Usage:
 *   const position = usePlayerState(playerStateSelectors.position);
 *   const speed = usePlayerState(playerStateSelectors.speed);
 */

export interface PlayerState {
  position: { x: number; y: number; z: number };
  forward: { x: number; y: number; z: number };
  speed: number;
  grounded: boolean;
  isMoving: boolean;
}

interface PlayerStateStore extends PlayerState {
  // Internal setter - only used by Agent A's player controller
  _setPlayerState: (state: Partial<PlayerState>) => void;
}

const initialState: PlayerState = {
  position: { x: 0, y: 0, z: 0 },
  forward: { x: 0, y: 0, z: 1 },
  speed: 0,
  grounded: true,
  isMoving: false,
};

export const usePlayerState = create<PlayerStateStore>((set) => ({
  ...initialState,
  _setPlayerState: (state) => set(state),
}));

// Selectors for optimized subscriptions
export const playerStateSelectors = {
  position: (state: PlayerStateStore) => state.position,
  forward: (state: PlayerStateStore) => state.forward,
  speed: (state: PlayerStateStore) => state.speed,
  grounded: (state: PlayerStateStore) => state.grounded,
  isMoving: (state: PlayerStateStore) => state.isMoving,
};

// Subscribe function for non-React usage
export function subscribeToPlayerState(
  selector: (state: PlayerStateStore) => unknown,
  callback: (value: unknown) => void
) {
  return usePlayerState.subscribe((state) => {
    callback(selector(state));
  });
}
