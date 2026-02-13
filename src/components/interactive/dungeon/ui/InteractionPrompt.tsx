'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDungeonUiTheme } from './useDungeonUiTheme';

interface InteractionPromptProps {
  visible: boolean;
  action?: string;
}

export default function InteractionPrompt({ visible, action = 'Open' }: InteractionPromptProps) {
  const theme = useDungeonUiTheme();

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
          <div
            className="flex items-center gap-3 rounded-xl border bg-gradient-to-r from-stone-900/95 to-stone-800/95 px-5 py-3 backdrop-blur-md"
            style={{
              borderColor: theme.accentBorderStrong,
              boxShadow: `0 0 30px ${theme.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            {/* Key indicator */}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg border bg-gradient-to-b shadow-[0_0_12px]"
              style={{
                borderColor: theme.accentBorderStrong,
                backgroundImage: `linear-gradient(180deg, ${theme.accentBgStrong}, ${theme.accentBgSoft})`,
                boxShadow: `0 0 12px ${theme.accentGlowStrong}`,
              }}
            >
              <span className="text-base font-black" style={{ color: theme.accentText }}>
                E
              </span>
            </div>

            {/* Action text */}
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.accentText }}>
              {action}
            </span>

            {/* Decorative glow */}
            <div
              className="absolute -inset-1 -z-10 rounded-xl blur-xl"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.accentBgStrong}, transparent)`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
