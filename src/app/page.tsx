'use client';

import { useState } from 'react';
import { ViewCanvas } from '@/components/ViewCanvas';
import { SidePanels } from '@/components/SidePanels';
import { WelcomePopup } from '@/components/WelcomePopup';
import { InteractionUI } from '@/components/InteractionUI';
import { useStore } from '@/utils/store';

export default function Home() {
  const isWelcomeOpen = useStore((state) => state.isWelcomeOpen);
  const setWelcomeOpen = useStore((state) => state.setWelcomeOpen);
  const setIntroPlaying = useStore((state) => state.setIntroPlaying);

  const handleStart = () => {
    setWelcomeOpen(false);
    setIntroPlaying(true);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <WelcomePopup isOpen={isWelcomeOpen} onClose={handleStart} />
      <InteractionUI />

      <ViewCanvas />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <SidePanels />
      </div>
    </main>
  );
}
