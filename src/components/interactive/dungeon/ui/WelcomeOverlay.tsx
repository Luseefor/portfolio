'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useDungeonUiTheme } from './useDungeonUiTheme';

interface WelcomeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isTouchDevice: boolean;
}

const DESKTOP_CONTROLS: Array<{ key: string; action: string }> = [
  { key: 'W / A / S / D', action: 'Move' },
  { key: 'Mouse', action: 'Look Around' },
  { key: 'Left Click', action: 'Lock Pointer / Focus View' },
  { key: 'Right Click', action: 'Unlock Pointer' },
  { key: 'Shift', action: 'Run' },
  { key: 'Space', action: 'Jump' },
  { key: 'Q', action: 'Dash' },
  { key: 'C', action: 'Roll' },
  { key: 'R', action: 'Attack' },
  { key: 'E', action: 'Interact / Open Chest' },
  { key: 'ESC', action: 'Open / Close Settings' },
  { key: 'M', action: 'Mute / Unmute Audio' },
];

const MOBILE_CONTROLS: Array<{ key: string; action: string }> = [
  { key: 'Left Joystick', action: 'Move (auto-run on full push)' },
  { key: 'Right Drag Pad', action: 'Look Around' },
  { key: 'Jump / Roll / Dash / Attack', action: 'Combat + Movement Actions' },
  { key: 'Interact', action: 'Open Nearby Chest' },
  { key: 'Top-Right Settings', action: 'Open Settings Menu' },
  { key: 'M', action: 'Mute / Unmute Audio' },
];

export default function WelcomeOverlay({ isOpen, onClose, isTouchDevice }: WelcomeOverlayProps) {
  const theme = useDungeonUiTheme();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const controls = isTouchDevice ? MOBILE_CONTROLS : DESKTOP_CONTROLS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="fixed left-1/2 top-1/2 z-[80] w-[min(96vw,880px)] -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="overflow-hidden rounded-2xl border bg-gradient-to-b from-stone-950/95 to-stone-900/95 backdrop-blur-xl"
              style={{
                borderColor: theme.accentBorderStrong,
                boxShadow: `0 0 0 1px ${theme.accentBorder}, 0 0 56px ${theme.accentGlowStrong}, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
            >
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
              />

              <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-7">
                <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                  Welcome to the Dungeon
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-300 sm:text-[15px]">
                  Explore the ruins, locate hidden chests, and open them to discover a concise, professional
                  overview of my projects, experience, and technical strengths.
                </p>

                <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4 sm:p-5">
                  <div
                    className="mb-3 text-[11px] font-black uppercase tracking-[0.28em]"
                    style={{ color: theme.accentText }}
                  >
                    Controls
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-2">
                    {controls.map((entry) => (
                      <div
                        key={`${entry.key}-${entry.action}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                      >
                        <span
                          className="shrink-0 rounded border bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
                          style={{ borderColor: theme.accentBorder, color: theme.accentText }}
                        >
                          {entry.key}
                        </span>
                        <span className="text-right text-xs font-medium text-stone-300 sm:text-[13px]">
                          {entry.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                    Press Enter to begin
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] text-white transition"
                    style={{
                      borderColor: theme.accentBorderStrong,
                      background: `linear-gradient(180deg, ${theme.accentBgStrong}, ${theme.accentBgSoft})`,
                      boxShadow: `0 0 24px ${theme.accentGlow}`,
                    }}
                  >
                    Enter Dungeon
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
