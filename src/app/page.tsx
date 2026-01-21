import { ViewCanvas } from '@/components/ViewCanvas';
import { HUD } from '@/components/HUD';
import { SidePanels } from '@/components/SidePanels';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <ViewCanvas />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <HUD />
        <SidePanels />
      </div>
    </main>
  );
}
