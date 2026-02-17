'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ChestPOI } from '@/constants/dungeonLayout';
import ChestContentRenderer from '@/components/interactive/dungeon/ui/chest-content/ChestContentRenderer';
import { KONAMI_HINT_FRAGMENTS, getChestContentDefinition } from '@/components/interactive/dungeon/ui/chest-content/registry';
import type { HintProgressState } from '@/components/interactive/dungeon/ui/chest-content/hints';
import { useDungeonUiTheme } from './useDungeonUiTheme';
import { ChestPanelFooter } from './chest-panel/ChestPanelFooter';
import { ChestPanelHeader } from './chest-panel/ChestPanelHeader';
import { HintFragmentCard } from './chest-panel/HintFragmentCard';

interface ChestPanelProps {
  chest: ChestPOI | null;
  onClose: () => void;
  hintProgress: HintProgressState;
  onResetHints: () => void;
}

export default function ChestPanel({ chest, onClose, hintProgress, onResetHints }: ChestPanelProps) {
  const theme = useDungeonUiTheme();
  const definition = chest ? getChestContentDefinition(chest.id) : null;
  const totalSteps = KONAMI_HINT_FRAGMENTS.length;
  const discoveredCount = hintProgress.discoveredSteps.length;
  const expectedStep = hintProgress.nextStep;
  const isHintUnlocked = chest ? hintProgress.discoveredChestIds.includes(chest.id) : false;
  const isOutOfOrderChest = definition && !isHintUnlocked ? definition.hint.step !== expectedStep : false;

  return (
    <AnimatePresence>
      {chest && definition && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,860px)] -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-stone-950/98 to-stone-900/98 backdrop-blur-xl"
              style={{
                borderColor: theme.accentBorder,
                boxShadow: `0 0 70px ${theme.accentGlowStrong}, inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${theme.accentBorderStrong}, transparent)` }}
              />
              <div className="max-h-[88vh] overflow-y-auto p-6">
                <ChestPanelHeader
                  chest={chest}
                  definition={definition}
                  discoveredCount={discoveredCount}
                  totalSteps={totalSteps}
                  theme={theme}
                />
                <HintFragmentCard
                  definition={definition}
                  expectedStep={expectedStep}
                  discoveredCount={discoveredCount}
                  totalSteps={totalSteps}
                  isHintUnlocked={isHintUnlocked}
                  isOutOfOrderChest={isOutOfOrderChest}
                  theme={theme}
                />
                <ChestContentRenderer chest={chest} definition={definition} theme={theme} />
                <ChestPanelFooter
                  discoveredCount={discoveredCount}
                  totalSteps={totalSteps}
                  onResetHints={onResetHints}
                  onClose={onClose}
                  theme={theme}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
