import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  graphicsQuality: 'low' | 'medium' | 'high';
  masterVolume: number;
  mouseSensitivity: number;
  exposure: number;
}

interface SettingsStore extends Settings {
  setGraphicsQuality: (quality: Settings['graphicsQuality']) => void;
  setMasterVolume: (volume: number) => void;
  setMouseSensitivity: (sensitivity: number) => void;
  setExposure: (exposure: number) => void;
}

const defaultSettings: Settings = {
  graphicsQuality: 'medium',
  masterVolume: 0.7,
  mouseSensitivity: 1.0,
  exposure: 1.0,
};

const clampNumber = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export const clampVolume = (value: number) =>
  clampNumber(value, 0, 1, defaultSettings.masterVolume);

const sanitizeSettings = (state: SettingsStore) => ({
  ...state,
  masterVolume: clampVolume(state.masterVolume),
  mouseSensitivity: clampNumber(state.mouseSensitivity, 0.1, 3, defaultSettings.mouseSensitivity),
  exposure: clampNumber(state.exposure, 0.5, 2.0, defaultSettings.exposure),
});

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
      setMasterVolume: (volume) => set({ masterVolume: clampVolume(volume) }),
      setMouseSensitivity: (sensitivity) =>
        set({
          mouseSensitivity: clampNumber(sensitivity, 0.1, 3, defaultSettings.mouseSensitivity),
        }),
      setExposure: (exposure) =>
        set({ exposure: clampNumber(exposure, 0.5, 2.0, defaultSettings.exposure) }),
    }),
    {
      name: 'dungeon-settings',
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(persistedState as SettingsStore),
        };
        return sanitizeSettings(merged as SettingsStore);
      },
    }
  )
);

// Direct actions for non-component usage
export const settingsActions = {
  setGraphicsQuality: (quality: Settings['graphicsQuality']) =>
    useSettings.getState().setGraphicsQuality(quality),
  setMasterVolume: (volume: number) => useSettings.getState().setMasterVolume(volume),
  setMouseSensitivity: (sensitivity: number) =>
    useSettings.getState().setMouseSensitivity(sensitivity),
  setExposure: (exposure: number) => useSettings.getState().setExposure(exposure),
  getSettings: () => {
    const { graphicsQuality, masterVolume, mouseSensitivity, exposure } = useSettings.getState();
    return { graphicsQuality, masterVolume, mouseSensitivity, exposure };
  },
};
