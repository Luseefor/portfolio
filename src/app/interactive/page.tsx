'use client';

import { useEffect } from 'react';
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
      <InteractiveCanvas />
    </main>
  );
}
