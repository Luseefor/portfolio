'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, RotateCcw, ScrollText } from 'lucide-react';
import type { ChestPOI } from '@/constants/dungeonLayout';
import ChestContentRenderer from '@/components/interactive/dungeon/ui/chest-content/ChestContentRenderer';
import {
  KONAMI_HINT_FRAGMENTS,
  getChestContentDefinition,
} from '@/components/interactive/dungeon/ui/chest-content/registry';
import type { HintProgressState } from '@/components/interactive/dungeon/ui/chest-content/hints';
import { useDungeonUiTheme } from './useDungeonUiTheme';

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
  const isOutOfOrderChest =
    definition && !isHintUnlocked ? definition.hint.step !== expectedStep : false;

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
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.accentBorderStrong}, transparent)`,
                }}
              />

              <div className="max-h-[88vh] overflow-y-auto p-6">
                <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: theme.accentBorder,
                        backgroundImage: `linear-gradient(135deg, ${theme.accentBgStrong}, ${theme.accentBgSoft})`,
                        boxShadow: `0 0 24px ${theme.accentGlow}`,
                      }}
                    >
                      <ScrollText size={20} style={{ color: theme.accent }} />
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.28em] font-terminal"
                        style={{ color: theme.accentMuted }}
                      >
                        {definition.subtitle}
                      </p>
                      <h2 className="mt-1 text-2xl font-black tracking-tight" style={{ color: theme.accentText }}>
                        {definition.title}
                      </h2>
                      <p className="mt-1 text-sm text-stone-400">{chest.description}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-terminal text-stone-400">
                      Fragments Recovered
                    </p>
                    <p className="text-lg font-black" style={{ color: theme.accentText }}>
                      {discoveredCount}/{totalSteps}
                    </p>
                  </div>
                </div>

                <div
                  className="mb-5 rounded-2xl border border-white/10 bg-black/35 p-4"
                  style={{ boxShadow: `0 0 24px ${theme.accentGlow}` }}
                >
                  <div className="mb-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] font-terminal" style={{ color: theme.accentMuted }}>
                    <KeyRound size={12} />
                    Cipher Fragment
                  </div>

                  {isHintUnlocked ? (
                    <p className="text-base font-black" style={{ color: theme.accentText }}>
                      Sequence {definition.hint.step}: {definition.hint.key}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-stone-300">Encrypted. Recover prior fragment first.</p>
                      {isOutOfOrderChest ? (
                        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] font-terminal text-amber-300/80">
                          Required next fragment: Sequence {expectedStep}
                        </p>
                      ) : null}
                    </>
                  )}

                  {discoveredCount === totalSteps ? (
                    <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                      Full code recovered. Return to landing page to execute the Konami sequence.
                    </div>
                  ) : null}
                </div>

                <ChestContentRenderer chest={chest} definition={definition} theme={theme} />

                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
                  <button
                    onClick={onResetHints}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-terminal text-stone-300 transition hover:border-white/30"
                  >
                    <RotateCcw size={12} />
                    Reset Clues
                  </button>

                  <div className="flex items-center gap-3">
                    {discoveredCount === totalSteps ? (
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-terminal"
                        style={{ borderColor: theme.accentBorderStrong, color: theme.accentText }}
                      >
                        Go to Landing
                      </Link>
                    ) : null}
                    <button
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-600/40 bg-stone-700/30 px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-terminal text-stone-300 transition hover:border-stone-500/50 hover:bg-stone-600/40"
                    >
                      Close
                      <kbd className="rounded border border-stone-600/50 bg-stone-700/50 px-1.5 py-0.5 text-[10px]">
                        ESC
                      </kbd>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
