'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChestPOI, CHEST_POIS } from '@/constants/dungeonLayout';
import { clampVolume, settingsActions, useSettings, type Settings } from '@/lib/settings';
import InteractionPrompt from './ui/InteractionPrompt';
import ChestPanel from './ui/ChestPanel';
import DungeonHUD from './ui/DungeonHUD';
import DungeonSettingsMenu from './ui/DungeonSettingsMenu';
import WelcomeOverlay from './ui/WelcomeOverlay';
import { useDungeonInput } from '@/lib/dungeonInput';

function safePauseAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return;
  try {
    audio.pause();
  } catch {
    // Ignore pause errors in non-browser test environments.
  }
}

function safePlayAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return;
  try {
    const maybePromise = audio.play();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => { });
    }
  } catch {
    // Ignore play errors in restricted/test environments.
  }
}

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
  isWelcomeOpen: boolean;
  onClosePanel: () => void;
  onCloseSettings: () => void;
  onCloseWelcome: () => void;
}

export function DungeonUI({
  openedChests,
  nearbyChestId,
  activePanel,
  isSettingsOpen,
  isWelcomeOpen,
  onClosePanel,
  onCloseSettings,
  onCloseWelcome,
}: DungeonUIProps) {
  const showInteractionPrompt = nearbyChestId !== null && !activePanel && !isSettingsOpen && !isWelcomeOpen;
  const isTouchDevice = useDungeonInput((state) => state.isTouchDevice);

  return (
    <>
      {/* HUD */}
      <DungeonHUD
        chestsOpened={openedChests.size}
        totalChests={CHEST_POIS.length}
        openedChestIds={openedChests}
      />

      {/* Interaction Prompt */}
      <InteractionPrompt visible={showInteractionPrompt} action="Open Chest" />

      {/* Chest Panel */}
      <ChestPanel chest={activePanel} onClose={onClosePanel} />

      {/* Settings Menu */}
      <DungeonSettingsMenu isOpen={isSettingsOpen} onClose={onCloseSettings} />

      {/* Intro Overlay */}
      <WelcomeOverlay isOpen={isWelcomeOpen} onClose={onCloseWelcome} isTouchDevice={isTouchDevice} />
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
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);

  const masterVolume = useSettings((s: Settings) => s.masterVolume);
  const uiOpenAudioRef = useRef<HTMLAudioElement | null>(null);
  const uiCloseAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousMasterVolumeRef = useRef(clampVolume(masterVolume) > 0.001 ? clampVolume(masterVolume) : 0.7);

  // Initialize UI audio
  useEffect(() => {
    uiOpenAudioRef.current = new Audio('/sounds/ui/ui_open.wav');
    uiCloseAudioRef.current = new Audio('/sounds/ui/ui_close.wav');
    const safeVolume = 0.35;
    uiOpenAudioRef.current.volume = safeVolume;
    uiCloseAudioRef.current.volume = safeVolume;
    return () => {
      if (uiOpenAudioRef.current) {
        safePauseAudio(uiOpenAudioRef.current);
        uiOpenAudioRef.current = null;
      }
      if (uiCloseAudioRef.current) {
        safePauseAudio(uiCloseAudioRef.current);
        uiCloseAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const safeVolume = clampVolume(masterVolume) * 0.5;
    if (clampVolume(masterVolume) > 0.001) {
      previousMasterVolumeRef.current = clampVolume(masterVolume);
    }
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
      safePlayAudio(uiOpenAudioRef.current);
    }
  }, []);

  const playUICloseSound = useCallback(() => {
    if (uiCloseAudioRef.current) {
      uiCloseAudioRef.current.currentTime = 0;
      safePlayAudio(uiCloseAudioRef.current);
    }
  }, []);

  const handleChestOpen = useCallback(
    (chest: ChestPOI) => {
      setOpenedChests((prev) => new Set([...prev, chest.id]));
      setActivePanel(chest);
    },
    [],
  );

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
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const isTypingTarget =
          target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (isTypingTarget) return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (isWelcomeOpen) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          handleCloseWelcome();
        }
        return;
      }

      if (isSettingsOpen || activePanel) {
        if (e.key === 'Escape') {
          if (activePanel) handleClosePanel();
          else handleCloseSettings();
        }
        return;
      }

      if ((e.key === 'e' || e.key === 'E') && nearbyChestId) {
        const chest = CHEST_POIS.find((c) => c.id === nearbyChestId);
        if (chest) {
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
    isWelcomeOpen,
    activePanel,
    handleChestOpen,
    handleCloseWelcome,
    handleClosePanel,
    handleOpenSettings,
    handleCloseSettings,
    handleToggleMute,
  ]);

  return {
    // State
    openedChests,
    nearbyChestId,
    activePanel,
    isSettingsOpen,
    isWelcomeOpen,
    // Handlers
    handleChestOpen,
    handleNearbyChange,
    handleClosePanel,
    handleOpenSettings,
    handleCloseSettings,
    handleCloseWelcome,
  };
}
