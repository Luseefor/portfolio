'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InteractiveCanvas from '@/components/interactive/InteractiveCanvas';
import RouteThemeControl from '@/components/shared/RouteThemeControl';
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
      className={`relative h-screen w-screen overflow-hidden ${isDark ? 'text-white' : 'text-slate-900'}`}
      style={{
        backgroundColor: isDark ? '#070a12' : '#f6f8fc',
        backgroundImage: isDark
          ? `radial-gradient(circle at 50% 18%, ${hexToRgba(accent, 0.18)} 0%, rgba(7,10,18,0.95) 42%, rgba(2,4,8,1) 100%)`
          : `radial-gradient(circle at 50% 18%, ${hexToRgba(accent, 0.2)} 0%, rgba(246,248,252,0.9) 42%, rgba(255,255,255,1) 100%)`,
      }}
    >
      <Link
        href="/"
        className={`absolute left-6 top-6 z-[30] inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-md transition ${
          isDark ? 'bg-white/5 text-white/90 hover:text-white' : 'bg-white/85 text-slate-800 hover:text-slate-950'
        }`}
        style={{
          borderColor: hexToRgba(accent, 0.4),
          boxShadow: `0 0 20px ${hexToRgba(accent, 0.2)}`,
        }}
      >
        <ArrowLeft size={12} style={{ color: accent }} />
        Back
      </Link>

      <RouteThemeControl className="absolute right-6 top-6 z-[30]" />

      <InteractiveCanvas />
    </main>
  );
}
