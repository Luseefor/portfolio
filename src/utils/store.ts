import { create } from 'zustand';

interface AppState {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;

  // Theme State
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  isChatOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open }),

  // Theme Defaults
  currentTheme: 'emerald',
  setCurrentTheme: (currentTheme) => set({ currentTheme }),
  isDark: true,
  setIsDark: (isDark) => set({ isDark }),
}));
