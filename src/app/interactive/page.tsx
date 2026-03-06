'use client';

import { useEffect } from 'react';
import InteractiveCanvas from '@/components/interactive/InteractiveCanvas';
import { useStore } from '@/utils/store';
import { getSurfacePalette } from '@/utils/themes';

export default function InteractivePage() {
  const isDark = useStore((state) => state.isDark);
  const palette = getSurfacePalette(isDark);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousMargin = document.body.style.margin;
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.margin = previousMargin;
    };
  }, []);

  return (
    <main
      className={`relative h-screen w-full overflow-hidden ${isDark ? 'text-white' : 'text-slate-900'}`}
      style={{
        backgroundColor: palette.base,
      }}
    >
      <InteractiveCanvas />
    </main>
  );
}
