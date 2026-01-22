'use client';

import { useState } from 'react';
import { ViewCanvas } from '@/components/ViewCanvas';
import { SidePanels } from '@/components/SidePanels';
import { WelcomePopup } from '@/components/WelcomePopup';
import { InteractionUI } from '@/components/InteractionUI';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <WelcomePopup isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
      <InteractionUI />

      <ViewCanvas />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <SidePanels />
      </div>
    </main>
  );
}
