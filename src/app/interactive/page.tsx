'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InteractiveCanvas from '@/components/interactive/InteractiveCanvas';

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
    <main className="relative h-screen w-screen overflow-hidden bg-[#0b0f1a] text-white">
      <Link
        href="/"
        className="absolute left-6 top-6 z-[30] inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white/80 backdrop-blur-md transition hover:border-white/30 hover:text-white"
      >
        <ArrowLeft size={12} />
        Back
      </Link>
      <InteractiveCanvas />
    </main>
  );
}
