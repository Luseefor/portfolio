import { create } from 'zustand';

interface AppState {
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
    lane: number; // -1 for left, 1 for right
    setLane: (lane: number) => void;
    focusedItem: { title: string; content: string } | null;
    setFocusedItem: (item: { title: string; content: string } | null) => void;
    isWelcomeOpen: boolean;
    setWelcomeOpen: (open: boolean) => void;
    isChatOpen: boolean;
    setChatOpen: (open: boolean) => void;
    npcDialogue: { title: string; content: string } | null;
    setNpcDialogue: (npc: { title: string; content: string } | null) => void;

    // Theme State
    currentTheme: string;
    setCurrentTheme: (theme: string) => void;
    isDark: boolean;
    setIsDark: (isDark: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    activeSection: null,
    setActiveSection: (section) => set({ activeSection: section }),
    lane: 1,
    setLane: (lane) => set({ lane }),
    focusedItem: null,
    setFocusedItem: (item) => set({ focusedItem: item }),
    isWelcomeOpen: true,
    setWelcomeOpen: (open) => set({ isWelcomeOpen: open }),
    isChatOpen: false,
    setChatOpen: (open) => set({ isChatOpen: open }),
    npcDialogue: null,
    setNpcDialogue: (npc) => set({ npcDialogue: npc }),

    // Theme Defaults
    currentTheme: 'emerald',
    setCurrentTheme: (currentTheme) => set({ currentTheme }),
    isDark: true,
    setIsDark: (isDark) => set({ isDark }),
}));
