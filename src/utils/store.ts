import { create } from 'zustand';

interface AppState {
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
    lane: number; // -1 for left, 1 for right
    setLane: (lane: number) => void;
    focusedItem: { title: string; content: string } | null;
    setFocusedItem: (item: { title: string; content: string } | null) => void;
    isIntroPlaying: boolean;
    setIntroPlaying: (playing: boolean) => void;
    isWelcomeOpen: boolean;
    setWelcomeOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    activeSection: null,
    setActiveSection: (section) => set({ activeSection: section }),
    lane: 1,
    setLane: (lane) => set({ lane }),
    focusedItem: null,
    setFocusedItem: (item) => set({ focusedItem: item }),
    isIntroPlaying: false,
    setIntroPlaying: (playing) => set({ isIntroPlaying: playing }),
    isWelcomeOpen: true,
    setWelcomeOpen: (open) => set({ isWelcomeOpen: open }),
}));
