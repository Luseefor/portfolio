'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InteractiveCanvas from '@/components/interactive/InteractiveCanvas';

export default function InteractivePage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#020410] text-white">
      <InteractiveCanvas />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.08),transparent_40%,rgba(129,140,248,0.1))]" />

      <div className="absolute left-6 top-6 z-20 flex items-center gap-4">
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white/70 transition hover:border-cyan-400/40 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
      </div>

      <div className="absolute bottom-10 left-8 z-20 max-w-md">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.4em] text-cyan-200">
          Interactive Core
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
          Abyssal 3D Environment
        </h1>
        <p className="mt-3 text-sm text-white/50">
          Fog layers active. Caustic light and volumetric scatter calibrated for deep-sea traversal.
        </p>
      </div>

      <div className="absolute right-8 top-8 z-20 hidden md:flex flex-col gap-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <div className="text-white/60">Node</div>
          <div className="mt-1 text-white">VISUAL_CORE</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <div className="text-white/60">Status</div>
          <div className="mt-1 text-cyan-300">SYNCED</div>
        </div>
      </div>
    </main>
  );
}
