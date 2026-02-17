import { useEffect } from 'react';
import type { ChestPOI } from '@/constants/dungeonLayout';

type UseDungeonInteractionKeyboardParams = {
  nearbyChestId: string | null;
  isSettingsOpen: boolean;
  isWelcomeOpen: boolean;
  activePanel: ChestPOI | null;
  onToggleMute: () => void;
  onOpenNearbyChest: (chestId: string) => void;
  onCloseWelcome: () => void;
  onClosePanel: () => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
};

export function useDungeonInteractionKeyboard({
  nearbyChestId,
  isSettingsOpen,
  isWelcomeOpen,
  activePanel,
  onToggleMute,
  onOpenNearbyChest,
  onCloseWelcome,
  onClosePanel,
  onOpenSettings,
  onCloseSettings,
}: UseDungeonInteractionKeyboardParams) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target) {
        const isTypingTarget =
          target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (isTypingTarget) return;
      }

      if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        onToggleMute();
        return;
      }

      if (isWelcomeOpen) {
        if (event.key === 'Escape' || event.key === 'Enter') {
          event.preventDefault();
          onCloseWelcome();
        }
        return;
      }

      if (isSettingsOpen || activePanel) {
        if (event.key === 'Escape') {
          if (activePanel) onClosePanel();
          else onCloseSettings();
        }
        return;
      }

      if ((event.key === 'e' || event.key === 'E') && nearbyChestId) {
        onOpenNearbyChest(nearbyChestId);
      }

      if (event.key === 'Escape') {
        onOpenSettings();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    nearbyChestId,
    isSettingsOpen,
    isWelcomeOpen,
    activePanel,
    onToggleMute,
    onOpenNearbyChest,
    onCloseWelcome,
    onClosePanel,
    onOpenSettings,
    onCloseSettings,
  ]);
}
