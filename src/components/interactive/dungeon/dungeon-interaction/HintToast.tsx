'use client';

import { AnimatePresence, motion } from 'framer-motion';

type HintToastProps = {
  message: string | null;
};

export function HintToast({ message }: HintToastProps) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-terminal text-emerald-200"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
