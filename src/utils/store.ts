import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const DEFAULT_THEME = 'emerald';
const KONAMI_THEME = 'crimson';

interface AppState {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;

  // Theme State
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  savedTheme: string;
  savedIsDark: boolean;
  konamiUnlocked: boolean;
  konamiEnabled: boolean;
  unlockKonami: () => void;
  setKonamiEnabled: (enabled: boolean) => void;
  resetKonami: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isChatOpen: false,
      setChatOpen: (open) => set({ isChatOpen: open }),

      // Theme Defaults
      currentTheme: DEFAULT_THEME,
      setCurrentTheme: (currentTheme) =>
        set((state) => {
          if (state.konamiEnabled) return {};
          return { currentTheme, savedTheme: currentTheme };
        }),
      isDark: true,
      setIsDark: (isDark) =>
        set((state) => {
          if (state.konamiEnabled) return {};
          return { isDark, savedIsDark: isDark };
        }),
      savedTheme: DEFAULT_THEME,
      savedIsDark: true,
      konamiUnlocked: false,
      konamiEnabled: false,
      unlockKonami: () =>
        set((state) => ({
          konamiUnlocked: true,
          konamiEnabled: true,
          savedTheme: state.konamiEnabled ? state.savedTheme : state.currentTheme,
          savedIsDark: state.konamiEnabled ? state.savedIsDark : state.isDark,
          currentTheme: KONAMI_THEME,
          isDark: true,
        })),
      setKonamiEnabled: (enabled) =>
        set((state) => {
          if (!state.konamiUnlocked) return {};
          if (enabled) {
            return {
              konamiEnabled: true,
              savedTheme: state.konamiEnabled ? state.savedTheme : state.currentTheme,
              savedIsDark: state.konamiEnabled ? state.savedIsDark : state.isDark,
              currentTheme: KONAMI_THEME,
              isDark: true,
            };
          }
          return {
            konamiEnabled: false,
            currentTheme: state.savedTheme,
            isDark: state.savedIsDark,
          };
        }),
      resetKonami: () =>
        set((state) => ({
          konamiUnlocked: false,
          konamiEnabled: false,
          currentTheme: state.savedTheme,
          isDark: state.savedIsDark,
        })),
    }),
    {
      name: 'portfolio-ui-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        isDark: state.isDark,
        savedTheme: state.savedTheme,
        savedIsDark: state.savedIsDark,
        konamiUnlocked: state.konamiUnlocked,
        konamiEnabled: state.konamiEnabled,
      }),
    },
  ),
);
