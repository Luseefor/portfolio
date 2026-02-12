'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { active, progress } = useProgress();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const timer = window.setTimeout(() => setHidden(true), 200);
      return () => window.clearTimeout(timer);
    }
  }, [active, progress]);

  useEffect(() => {
    if (!active) return;
    const forceHideTimer = window.setTimeout(() => {
      setHidden(true);
    }, 9000);
    return () => window.clearTimeout(forceHideTimer);
  }, [active]);

  if (hidden) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#080b12]/85">
      <div className="w-[min(360px,80vw)] rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-center text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200/80">
          Loading Dungeon
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 transition-[width] duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-white/60">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
