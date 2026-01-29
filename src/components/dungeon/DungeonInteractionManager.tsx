'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChestPOI, CHEST_POIS } from './ChestSystem';
import { clampVolume, useSettings, type Settings } from '@/lib/settings';
import InteractionPrompt from '@/ui/dungeon/InteractionPrompt';
import ChestPanel from '@/ui/dungeon/ChestPanel';
import DungeonHUD from '@/ui/dungeon/DungeonHUD';
import DungeonSettingsMenu from '@/ui/dungeon/DungeonSettingsMenu';

/**
 * DungeonUI
 * 
 * HTML overlay components for the dungeon experience.
 * This should be rendered OUTSIDE the Canvas as a sibling.
 */
interface DungeonUIProps {
  openedChests: Set<string>;
  nearbyChestId: string | null;
  activePanel: ChestPOI | null;
  isSettingsOpen: boolean;
  onChestOpen: (chest: ChestPOI) => void;
  onClosePanel: () => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
}

export function DungeonUI({
  openedChests,
  nearbyChestId,
  activePanel,
  isSettingsOpen,
  onClosePanel,
  onCloseSettings,
}: DungeonUIProps) {
  const showInteractionPrompt =
    nearbyChestId !== null && !openedChests.has(nearbyChestId) && !activePanel && !isSettingsOpen;

  return (
    <>
      {/* HUD */}
      <DungeonHUD
        roomLabel="Ancient Ruins"
        chestsOpened={openedChests.size}
        totalChests={CHEST_POIS.length}
      />

      {/* Interaction Prompt */}
      <InteractionPrompt visible={showInteractionPrompt} action="Open Chest" />

      {/* Chest Panel */}
      <ChestPanel chest={activePanel} onClose={onClosePanel} />

      {/* Settings Menu */}
      <DungeonSettingsMenu isOpen={isSettingsOpen} onClose={onCloseSettings} />
    </>
  );
}

/**
 * useDungeonInteraction hook
 * 
 * Provides all state and handlers for dungeon interaction.
 * Use this in the page component to manage state at the top level.
 */
export function useDungeonInteraction() {
  const [openedChests, setOpenedChests] = useState<Set<string>>(new Set());
  const [nearbyChestId, setNearbyChestId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ChestPOI | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const masterVolume = useSettings((s: Settings) => s.masterVolume);
  const uiOpenAudioRef = useRef<HTMLAudioElement | null>(null);
  const uiCloseAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize UI audio
  useEffect(() => {
    uiOpenAudioRef.current = new Audio('/sounds/ui/ui_open.wav');
    uiCloseAudioRef.current = new Audio('/sounds/ui/ui_close.wav');
    const safeVolume = clampVolume(masterVolume) * 0.5;
    uiOpenAudioRef.current.volume = safeVolume;
    uiCloseAudioRef.current.volume = safeVolume;
    return () => {
      if (uiOpenAudioRef.current) {
        uiOpenAudioRef.current.pause();
        uiOpenAudioRef.current = null;
      }
      if (uiCloseAudioRef.current) {
        uiCloseAudioRef.current.pause();
        uiCloseAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const safeVolume = clampVolume(masterVolume) * 0.5;
    if (uiOpenAudioRef.current) {
      uiOpenAudioRef.current.volume = safeVolume;
    }
    if (uiCloseAudioRef.current) {
      uiCloseAudioRef.current.volume = safeVolume;
    }
  }, [masterVolume]);

  const playUIOpenSound = useCallback(() => {
    if (uiOpenAudioRef.current) {
      uiOpenAudioRef.current.currentTime = 0;
      uiOpenAudioRef.current.play().catch(() => {});
    }
  }, []);

  const playUICloseSound = useCallback(() => {
    if (uiCloseAudioRef.current) {
      uiCloseAudioRef.current.currentTime = 0;
      uiCloseAudioRef.current.play().catch(() => {});
    }
  }, []);

  const handleChestOpen = useCallback((chest: ChestPOI) => {
    if (openedChests.has(chest.id)) return;
    setOpenedChests((prev) => new Set([...prev, chest.id]));
    setActivePanel(chest);
    playUIOpenSound();
  }, [openedChests, playUIOpenSound]);

  const handleNearbyChange = useCallback((chestId: string | null) => {
    setNearbyChestId(chestId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setActivePanel(null);
    playUICloseSound();
  }, [playUICloseSound]);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
    playUIOpenSound();
  }, [playUIOpenSound]);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
    playUICloseSound();
  }, [playUICloseSound]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen || activePanel) {
        if (e.key === 'Escape') {
          if (activePanel) handleClosePanel();
          else handleCloseSettings();
        }
        return;
      }

      if ((e.key === 'e' || e.key === 'E') && nearbyChestId) {
        const chest = CHEST_POIS.find((c) => c.id === nearbyChestId);
        if (chest && !openedChests.has(chest.id)) {
          handleChestOpen(chest);
        }
      }

      if (e.key === 'Escape') {
        handleOpenSettings();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    nearbyChestId,
    isSettingsOpen,
    activePanel,
    openedChests,
    handleChestOpen,
    handleClosePanel,
    handleOpenSettings,
    handleCloseSettings,
  ]);

  return {
    // State
    openedChests,
    nearbyChestId,
    activePanel,
    isSettingsOpen,
    // Handlers
    handleChestOpen,
    handleNearbyChange,
    handleClosePanel,
    handleOpenSettings,
    handleCloseSettings,
  };
}
