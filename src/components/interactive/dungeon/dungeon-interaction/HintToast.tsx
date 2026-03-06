'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useDungeonUiTheme } from '@/components/interactive/dungeon/ui/useDungeonUiTheme';

type HintToastProps = {
  message: string | null;
};

export function HintToast({ message }: HintToastProps) {
  const theme = useDungeonUiTheme();

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 font-terminal text-[11px] uppercase tracking-[0.2em]"
          style={{
            borderColor: theme.accentBorder,
            backgroundColor: theme.accentBgSoft,
            color: theme.accentText,
            boxShadow: `0 18px 42px ${theme.accentGlow}`,
          }}
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
