'use client';

import { ViewCanvas } from '@/components/ViewCanvas';
import { SidePanels } from '@/components/SidePanels';
import { WelcomePopup } from '@/components/WelcomePopup';
import { InteractionUI } from '@/components/InteractionUI';
import { NPCDialogue } from '@/components/NPCDialogue';
import { useStore } from '@/utils/store';

export default function InteractivePage() {
    const isWelcomeOpen = useStore((state) => state.isWelcomeOpen);
    const setWelcomeOpen = useStore((state) => state.setWelcomeOpen);

    const handleStart = () => {
        setWelcomeOpen(false);
    };

    return (
        <main className="relative w-full h-screen overflow-hidden bg-black">
            <WelcomePopup isOpen={isWelcomeOpen} onClose={handleStart} />
            <NPCDialogue />
            <InteractionUI />

            <ViewCanvas />

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                <SidePanels />
            </div>
        </main>
    );
}
