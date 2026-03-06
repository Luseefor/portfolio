import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_THEME_ID } from '@/utils/themes';

const DEFAULT_THEME = DEFAULT_THEME_ID;

interface AppState {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentTheme: DEFAULT_THEME,
      setCurrentTheme: (currentTheme) => set({ currentTheme }),
      isDark: true,
      setIsDark: (isDark) => set({ isDark }),
    }),
    {
      name: 'portfolio-ui-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        isDark: state.isDark,
      }),
    },
  ),
);
