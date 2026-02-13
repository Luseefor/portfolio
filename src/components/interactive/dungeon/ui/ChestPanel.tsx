'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ChestPOI } from '@/constants/dungeonLayout';
import { useDungeonUiTheme } from './useDungeonUiTheme';

interface ChestPanelProps {
  chest: ChestPOI | null;
  onClose: () => void;
}

export default function ChestPanel({ chest, onClose }: ChestPanelProps) {
  const theme = useDungeonUiTheme();

  const handleLootAction = () => {
    if (chest?.loot?.url) {
      window.open(chest.loot.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {chest && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,400px)] -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="overflow-hidden rounded-2xl border bg-gradient-to-br from-stone-900/98 to-stone-800/98 backdrop-blur-xl"
              style={{
                borderColor: theme.accentBorder,
                boxShadow: `0 0 60px ${theme.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              {/* Header glow */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.accentBorderStrong}, transparent)`,
                }}
              />

              {/* Chest icon */}
              <div className="flex justify-center pt-6">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-gradient-to-br shadow-[0_0_24px]"
                  style={{
                    borderColor: theme.accentBorder,
                    backgroundImage: `linear-gradient(135deg, ${theme.accentBgStrong}, ${theme.accentBgSoft})`,
                    boxShadow: `0 0 24px ${theme.accentGlow}`,
                  }}
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" style={{ color: theme.accent }}>
                    <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM10 4h4v2h-4V4z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4 text-center">
                {/* Loot type tag */}
                <div
                  className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1"
                  style={{ borderColor: theme.accentBorder, backgroundColor: theme.accentBgSoft }}
                >
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: theme.accent }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: theme.accentText }}>
                    {chest.loot?.type ?? 'Treasure'}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-2 text-2xl font-black tracking-tight" style={{ color: theme.accentText }}>
                  {chest.title}
                </h2>

                {/* Description */}
                <p className="mt-4 text-sm leading-relaxed text-stone-400">{chest.description}</p>

                {/* Divider */}
                <div
                  className="my-5 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${theme.accentBorder}, transparent)`,
                  }}
                />

                {/* Actions */}
                <div className="flex justify-center gap-3">
                  {chest.loot && (
                    <button
                      onClick={handleLootAction}
                      className="group relative flex items-center gap-2 overflow-hidden rounded-xl border px-5 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all"
                      style={{
                        borderColor: theme.accentBorderStrong,
                        backgroundImage: `linear-gradient(180deg, ${theme.accentBgStrong}, ${theme.accentBgSoft})`,
                        boxShadow: `0 0 20px ${theme.accentGlow}`,
                      }}
                    >
                      <span className="relative">{chest.loot.label}</span>
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl border border-stone-600/40 bg-stone-700/30 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-stone-400 transition-all hover:border-stone-500/50 hover:bg-stone-600/40 hover:text-stone-300"
                  >
                    <span>Close</span>
                    <kbd className="rounded border border-stone-600/50 bg-stone-700/50 px-1.5 py-0.5 text-[10px]">
                      ESC
                    </kbd>
                  </button>
                </div>
              </div>

              {/* Bottom decoration */}
              <div
                className="absolute inset-x-0 bottom-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.accentBorder}, transparent)`,
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
