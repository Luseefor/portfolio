'use client';

import { KeyRound } from 'lucide-react';
import type { ChestContentDefinition } from '@/components/interactive/dungeon/ui/chest-content/registry';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type HintFragmentCardProps = {
  definition: ChestContentDefinition;
  expectedStep: number;
  discoveredCount: number;
  totalSteps: number;
  isHintUnlocked: boolean;
  isOutOfOrderChest: boolean;
  theme: DungeonUiThemePalette;
};

export function HintFragmentCard({
  definition,
  expectedStep,
  discoveredCount,
  totalSteps,
  isHintUnlocked,
  isOutOfOrderChest,
  theme,
}: HintFragmentCardProps) {
  return (
    <div className="mb-5 rounded-2xl border border-white/10 bg-black/35 p-4" style={{ boxShadow: `0 0 24px ${theme.accentGlow}` }}>
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
        <div
          className="mt-3 rounded-xl border px-3 py-2 text-sm"
          style={{
            borderColor: theme.accentBorder,
            backgroundColor: theme.accentBgSoft,
            color: theme.accentText,
          }}
        >
          Full code recovered. Return to landing page to execute the Konami sequence.
        </div>
      ) : null}
    </div>
  );
}
