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

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
      setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(1, volume)) }),
      setMouseSensitivity: (sensitivity) =>
        set({ mouseSensitivity: Math.max(0.1, Math.min(3, sensitivity)) }),
      setExposure: (exposure) =>
        set({ exposure: Math.max(0.5, Math.min(2.0, exposure)) }),
    }),
    {
      name: 'dungeon-settings',
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
