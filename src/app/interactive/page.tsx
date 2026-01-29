'use client';

import { useEffect } from 'react';
import CanvasRoot from '@/components/CanvasRoot';

export default function InteractivePage() {
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
    <main className="relative h-screen w-screen overflow-hidden bg-[#020611] text-white">
      <CanvasRoot />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.15),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(56,189,248,0.1),transparent_45%,rgba(16,185,129,0.08))]" />
      <div className="pointer-events-none absolute bottom-8 left-8 z-10 max-w-sm text-xs uppercase tracking-[0.35em] text-cyan-200/70">
        Pilot the sub · click to lock mouse · press C to free-look
      </div>
    </main>
  );
}
