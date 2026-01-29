'use client';

import { motion } from 'framer-motion';
import { POIData } from '@/components/POIMarker';

interface HUDProps {
  speed: number;
  depth: number;
  sonarCooldown: number;
  currentObjective: POIData | null;
  nearbyPoi: POIData | null;
  onSelectObjective?: (poiId: string) => void;
}

export default function HUD({
  speed,
  depth,
  sonarCooldown,
  currentObjective,
  nearbyPoi,
}: HUDProps) {
  return (
    <>
      {/* Bottom-right telemetry panel */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-40">
        <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#020410]/85 to-[#0a1628]/85 px-5 py-4 shadow-[0_0_30px_rgba(34,211,238,0.1)] backdrop-blur-md">
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-cyan-300/70">
              Telemetry
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid gap-2.5">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Speed
              </span>
              <span className="font-mono text-sm font-bold tabular-nums text-cyan-200">
                {speed.toFixed(1)}
                <span className="ml-1 text-[9px] text-cyan-400/60">m/s</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Depth
              </span>
              <span className="font-mono text-sm font-bold tabular-nums text-cyan-200">
                {depth.toFixed(1)}
                <span className="ml-1 text-[9px] text-cyan-400/60">m</span>
              </span>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Sonar
              </span>
              {sonarCooldown > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="h-1 w-12 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full bg-cyan-400"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(1 - sonarCooldown / 8) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <span className="font-mono text-[10px] tabular-nums text-cyan-400/60">
                    {sonarCooldown.toFixed(1)}s
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top-left objective panel */}
      {currentObjective && (
        <div className="pointer-events-none fixed left-6 top-6 z-40">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#020410]/85 to-[#0a1628]/85 px-5 py-4 shadow-[0_0_30px_rgba(34,211,238,0.1)] backdrop-blur-md"
          >
            <div className="mb-2 flex items-center gap-2">
              <svg
                className="h-3 w-3 text-cyan-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-cyan-300/70">
                Current Objective
              </span>
            </div>
            <p className="max-w-[200px] text-sm font-semibold text-white">
              {currentObjective.title}
            </p>
          </motion.div>
        </div>
      )}

      {/* Bottom-center interaction prompt */}
      {nearbyPoi && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-full border border-cyan-400/30 bg-[#020410]/90 px-5 py-3 shadow-[0_0_40px_rgba(34,211,238,0.2)] backdrop-blur-md">
            <kbd className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-sm font-bold text-cyan-300">
              E
            </kbd>
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              {nearbyPoi.title}
            </span>
          </div>
        </motion.div>
      )}

      {/* Controls hint (bottom-left) */}
      <div className="pointer-events-none fixed bottom-6 left-6 z-30">
        <div className="flex flex-col gap-1 text-[9px] uppercase tracking-wider text-white/30">
          <div className="flex items-center gap-2">
            <span className="rounded border border-white/20 px-1.5 py-0.5">WASD</span>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-white/20 px-1.5 py-0.5">Q/E</span>
            <span>Descend / Ascend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-white/20 px-1.5 py-0.5">Space</span>
            <span>Sonar Pulse</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-white/20 px-1.5 py-0.5">ESC</span>
            <span>Settings</span>
          </div>
        </div>
      </div>
    </>
  );
}
