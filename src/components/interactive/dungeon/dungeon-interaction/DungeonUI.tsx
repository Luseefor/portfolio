'use client';

import type { ChestPOI } from '@/constants/dungeonLayout';
import { CHEST_POIS } from '@/constants/dungeonLayout';
import { useDungeonInput } from '@/lib/dungeonInput';
import type { HintProgressState } from '@/components/interactive/dungeon/ui/chest-content/hints';
import InteractionPrompt from '../ui/InteractionPrompt';
import ChestPanel from '../ui/ChestPanel';
import DungeonHUD from '../ui/DungeonHUD';
import DungeonSettingsMenu from '../ui/DungeonSettingsMenu';
import WelcomeOverlay from '../ui/WelcomeOverlay';
import { HintToast } from './HintToast';

interface DungeonUIProps {
  openedChests: Set<string>;
  nearbyChestId: string | null;
  activePanel: ChestPOI | null;
  hintProgress: HintProgressState;
  hintToast: string | null;
  isSettingsOpen: boolean;
  isWelcomeOpen: boolean;
  onClosePanel: () => void;
  onCloseSettings: () => void;
  onCloseWelcome: () => void;
  onResetHints: () => void;
}

export function DungeonUI({
  openedChests,
  nearbyChestId,
  activePanel,
  hintProgress,
  hintToast,
  isSettingsOpen,
  isWelcomeOpen,
  onClosePanel,
  onCloseSettings,
  onCloseWelcome,
  onResetHints,
}: DungeonUIProps) {
  const showInteractionPrompt = nearbyChestId !== null && !activePanel && !isSettingsOpen && !isWelcomeOpen;
  const isTouchDevice = useDungeonInput((state) => state.isTouchDevice);

  return (
    <>
      <DungeonHUD chestsOpened={openedChests.size} totalChests={CHEST_POIS.length} openedChestIds={openedChests} />
      <InteractionPrompt visible={showInteractionPrompt} action="Open Chest" />
      <ChestPanel chest={activePanel} onClose={onClosePanel} hintProgress={hintProgress} onResetHints={onResetHints} />
      <DungeonSettingsMenu isOpen={isSettingsOpen} onClose={onCloseSettings} />
      <WelcomeOverlay isOpen={isWelcomeOpen} onClose={onCloseWelcome} isTouchDevice={isTouchDevice} />
      <HintToast message={hintToast} />
    </>
  );
}
