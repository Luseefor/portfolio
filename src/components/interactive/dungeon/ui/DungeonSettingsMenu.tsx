'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useDungeonUiTheme } from './useDungeonUiTheme';
import { SettingsHeader } from './settings-menu/SettingsHeader';
import { SettingsPanelContent } from './settings-menu/SettingsPanelContent';
import { useLocalDungeonSettings } from './settings-menu/useLocalDungeonSettings';

interface DungeonSettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DungeonSettingsMenu({ isOpen, onClose }: DungeonSettingsMenuProps) {
  const theme = useDungeonUiTheme();
  const { localSettings, setGraphicsQuality, setMasterVolume, setMouseSensitivity, setExposure } =
    useLocalDungeonSettings();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="overflow-hidden rounded-2xl border bg-gradient-to-b from-stone-900/98 to-stone-950/98 backdrop-blur-xl"
              style={{
                borderColor: theme.accentBorder,
                boxShadow: `0 0 80px rgba(0,0,0,0.5), 0 0 40px ${theme.accentGlow}`,
              }}
            >
              <SettingsHeader theme={theme} onClose={onClose} />
              <SettingsPanelContent
                localSettings={localSettings}
                theme={theme}
                onQualityChange={setGraphicsQuality}
                onVolumeChange={setMasterVolume}
                onSensitivityChange={setMouseSensitivity}
                onExposureChange={setExposure}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
