'use client';

import { useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  const { progress, active, loaded, total } = useProgress();

  if (!active) return null;

  const percentage = Math.min(100, Math.round(progress));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020410]/95 backdrop-blur-xl">
      <div className="relative w-[90vw] max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_80px_rgba(0,255,255,0.15)]">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px]" />

        <div className="mb-6 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300/80">
            System Boot
          </p>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            Initializing Interactive Core
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Loading assets & rendering pipeline…
          </p>
        </div>

        <div className="space-y-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Assets: {loaded}/{total}</span>
            <span className="font-bold text-cyan-300">{percentage}%</span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
          <span className="h-px w-12 bg-white/10" />
          <span>Neural Sync</span>
          <span className="h-px w-12 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
