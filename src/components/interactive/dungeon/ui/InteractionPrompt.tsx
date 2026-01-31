'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface InteractionPromptProps {
  visible: boolean;
  action?: string;
}

export default function InteractionPrompt({ visible, action = 'Open' }: InteractionPromptProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-none fixed bottom-28 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-stone-900/95 to-stone-800/95 px-5 py-3 shadow-[0_0_30px_rgba(251,191,36,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
            {/* Key indicator */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/50 bg-gradient-to-b from-amber-400/20 to-amber-500/10 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
              <span className="text-base font-black text-amber-300">E</span>
            </div>

            {/* Action text */}
            <span className="text-sm font-semibold uppercase tracking-wider text-amber-100">
              {action}
            </span>

            {/* Decorative glow */}
            <div className="absolute -inset-1 -z-10 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 blur-xl" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
