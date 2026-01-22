import { create } from 'zustand';

interface AppState {
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
    lane: number; // -1 for left, 1 for right
    setLane: (lane: number) => void;
}

export const useStore = create<AppState>((set) => ({
    activeSection: null,
    setActiveSection: (section) => set({ activeSection: section }),
    lane: 1,
    setLane: (lane) => set({ lane }),
}));
