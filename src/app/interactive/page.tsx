'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InteractiveCanvas from '@/components/interactive/InteractiveCanvas';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

export default function InteractivePage() {
  const currentTheme = useStore((state) => state.currentTheme);
  const isDark = useStore((state) => state.isDark);
  const accent = getThemeColor(currentTheme, isDark);

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
      className="relative h-screen w-screen overflow-hidden text-white"
      style={{
        backgroundColor: '#070a12',
        backgroundImage: `radial-gradient(circle at 50% 18%, ${hexToRgba(accent, 0.18)} 0%, rgba(7,10,18,0.95) 42%, rgba(2,4,8,1) 100%)`,
      }}
    >
      <Link
        href="/"
        className="absolute left-6 top-6 z-[30] inline-flex items-center gap-2 rounded-full border bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white/90 backdrop-blur-md transition hover:text-white"
        style={{
          borderColor: hexToRgba(accent, 0.4),
          boxShadow: `0 0 20px ${hexToRgba(accent, 0.2)}`,
        }}
      >
        <ArrowLeft size={12} style={{ color: accent }} />
        Back
      </Link>
      <InteractiveCanvas />
    </main>
  );
}
