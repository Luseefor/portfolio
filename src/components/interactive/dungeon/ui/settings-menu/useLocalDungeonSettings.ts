import { useCallback, useEffect, useState } from 'react';
import { settingsActions, useSettings } from '@/lib/settings';

export function useLocalDungeonSettings() {
  const settings = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const setGraphicsQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    setLocalSettings((prev) => ({ ...prev, graphicsQuality: quality }));
    settingsActions.setGraphicsQuality(quality);
  }, []);

  const setMasterVolume = useCallback((value: number) => {
    setLocalSettings((prev) => ({ ...prev, masterVolume: value }));
    settingsActions.setMasterVolume(value);
  }, []);

  const setMouseSensitivity = useCallback((value: number) => {
    setLocalSettings((prev) => ({ ...prev, mouseSensitivity: value }));
    settingsActions.setMouseSensitivity(value);
  }, []);

  const setExposure = useCallback((value: number) => {
    setLocalSettings((prev) => ({ ...prev, exposure: value }));
    settingsActions.setExposure(value);
  }, []);

  return {
    localSettings,
    setGraphicsQuality,
    setMasterVolume,
    setMouseSensitivity,
    setExposure,
  };
}
