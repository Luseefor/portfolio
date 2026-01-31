'use client';

import { motion } from 'framer-motion';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';

interface DungeonHUDProps {
  roomLabel?: string;
  chestsOpened: number;
  totalChests: number;
}

export default function DungeonHUD({
  roomLabel = 'Ancient Ruins',
  chestsOpened,
  totalChests,
}: DungeonHUDProps) {
  const speed = usePlayerState(playerStateSelectors.speed);
  const grounded = usePlayerState(playerStateSelectors.grounded);
  const isMoving = usePlayerState(playerStateSelectors.isMoving);

  return (
    <>
      {/* Top-left: Room label */}
      <div className="pointer-events-none fixed left-6 top-6 z-30">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-stone-900/90 to-stone-800/90 px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
              <svg
                className="h-4 w-4 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400/70">
                Location
              </div>
              <div className="text-sm font-semibold text-amber-100">{roomLabel}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top-right: Progress */}
      <div className="pointer-events-none fixed right-6 top-6 z-30">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-stone-900/90 to-stone-800/90 px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
        >
          <div className="flex items-center gap-4">
            {/* Treasures found */}
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
              </svg>
              <span className="font-mono text-sm font-bold tabular-nums text-amber-100">
                {chestsOpened}/{totalChests}
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-amber-500/20" />

            {/* Speed */}
            <div className="text-right">
              <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-stone-500">
                Speed
              </div>
              <div className="font-mono text-sm font-bold tabular-nums text-stone-300">
                {speed.toFixed(1)}
                <span className="ml-1 text-[9px] text-stone-500">m/s</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom-left: Controls hint */}
      <div className="pointer-events-none fixed bottom-6 left-6 z-30">
        <div className="space-y-1.5 text-[10px] uppercase tracking-wider text-stone-500">
          <div className="flex items-center gap-2">
            <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
              WASD
            </span>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
              SHIFT
            </span>
            <span>Run</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
              SPACE
            </span>
            <span>Jump</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
              ESC
            </span>
            <span>Settings</span>
          </div>
        </div>
      </div>

      {/* Bottom-right: Status indicators */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-30">
        <div className="flex items-center gap-3">
          {/* Grounded indicator */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              grounded
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                grounded ? 'bg-emerald-400' : 'animate-pulse bg-amber-400'
              }`}
            />
            {grounded ? 'Grounded' : 'Airborne'}
          </div>

          {/* Moving indicator */}
          {isMoving && (
            <div className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
              Moving
            </div>
          )}
        </div>
      </div>
    </>
  );
}
