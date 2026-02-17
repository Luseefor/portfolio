import { useCallback, useState } from 'react';
import { CHEST_POIS, type ChestPOI } from '@/constants/dungeonLayout';
import { clampVolume, settingsActions, useSettings, type Settings } from '@/lib/settings';
import { computeHintProgressUpdate } from '@/components/interactive/dungeon/ui/chest-content/hints';
import { KONAMI_HINT_FRAGMENTS } from '@/components/interactive/dungeon/ui/chest-content/registry';
import { useDungeonInteractionKeyboard } from './useDungeonInteractionKeyboard';
import { useDungeonUiAudio } from './useDungeonUiAudio';
import { useHintProgressState } from './useHintProgressState';

export function useDungeonInteraction() {
  const [openedChests, setOpenedChests] = useState<Set<string>>(new Set());
  const [nearbyChestId, setNearbyChestId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ChestPOI | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const { hintProgress, hintToast, setHintProgress, setHintToast, resetHints } = useHintProgressState();

  const masterVolume = useSettings((state: Settings) => state.masterVolume);
  const { playUIOpenSound, playUICloseSound, previousMasterVolumeRef } = useDungeonUiAudio(masterVolume);

  const handleChestOpen = useCallback((chest: ChestPOI) => {
    setOpenedChests((prev) => new Set([...prev, chest.id]));
    setActivePanel(chest);
    setHintProgress((prev) => {
      const update = computeHintProgressUpdate(prev, chest.id);
      if (update.completedNow) {
        setHintToast('All fragments recovered. Return to landing page.');
      } else if (update.unlockedStep !== null) {
        setHintToast(`Fragment ${update.unlockedStep}/${KONAMI_HINT_FRAGMENTS.length} recovered.`);
      }
      return update.next;
    });
  }, [setHintProgress, setHintToast]);

  const handleNearbyChange = useCallback((chestId: string | null) => {
    setNearbyChestId(chestId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
    playUIOpenSound();
  }, [playUIOpenSound]);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
    playUICloseSound();
  }, [playUICloseSound]);

  const handleCloseWelcome = useCallback(() => {
    setIsWelcomeOpen(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    const currentVolume = clampVolume(useSettings.getState().masterVolume);
    if (currentVolume <= 0.001) {
      const restoreVolume = clampVolume(previousMasterVolumeRef.current);
      settingsActions.setMasterVolume(restoreVolume > 0.001 ? restoreVolume : 0.7);
      return;
    }
    previousMasterVolumeRef.current = currentVolume;
    settingsActions.setMasterVolume(0);
  }, [previousMasterVolumeRef]);

  const handleOpenNearbyChest = useCallback((chestId: string) => {
    const chest = CHEST_POIS.find((entry) => entry.id === chestId);
    if (chest) handleChestOpen(chest);
  }, [handleChestOpen]);

  useDungeonInteractionKeyboard({
    nearbyChestId,
    isSettingsOpen,
    isWelcomeOpen,
    activePanel,
    onToggleMute: handleToggleMute,
    onOpenNearbyChest: handleOpenNearbyChest,
    onCloseWelcome: handleCloseWelcome,
    onClosePanel: handleClosePanel,
    onOpenSettings: handleOpenSettings,
    onCloseSettings: handleCloseSettings,
  });

  return {
    openedChests,
    nearbyChestId,
    activePanel,
    hintProgress,
    hintToast,
    isSettingsOpen,
    isWelcomeOpen,
    handleChestOpen,
    handleNearbyChange,
    handleClosePanel,
    handleOpenSettings,
    handleCloseSettings,
    handleCloseWelcome,
    handleResetHints: resetHints,
  };
}
