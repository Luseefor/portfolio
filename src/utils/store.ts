import { create } from 'zustand';

interface AppState {
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
    activeSection: null,
    setActiveSection: (section) => set({ activeSection: section }),
}));
