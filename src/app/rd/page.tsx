'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Lock, Skull, ArrowLeft } from 'lucide-react';

export default function RDPage() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('konamiUnlocked');
    setUnlocked(stored === 'true');
  }, []);

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-black text-red-200 flex items-center justify-center px-6">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-[11px] uppercase tracking-[0.3em] font-terminal text-red-200 hover:border-red-400 transition"
        >
          <ArrowLeft size={12} />
          Back
        </Link>
        <div className="max-w-xl w-full border border-red-700/50 bg-black/70 backdrop-blur-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/60">
            <Lock size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">R&D Access Locked</h1>
          <p className="mt-3 text-sm text-red-300/70">
            Unauthorized. Enter the correct sequence to unlock this archive.
          </p>
          <div className="mt-6 text-[11px] font-terminal uppercase tracking-[0.35em] text-red-400/70">
            STATUS // DENIED
          </div>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-[11px] uppercase tracking-[0.3em] font-terminal text-red-200 hover:border-red-400 transition"
          >
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-red-100 px-6 py-16">
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-[11px] uppercase tracking-[0.3em] font-terminal text-red-200 hover:border-red-400 transition"
      >
        <ArrowLeft size={12} />
        Back
      </Link>
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-red-500/60 flex items-center justify-center">
            <Skull size={18} />
          </div>
          <div>
            <div className="text-xs font-terminal uppercase tracking-[0.4em] text-red-400/70">
              BLACKSITE
            </div>
            <h1 className="text-3xl font-black uppercase tracking-[0.2em]">R&D Archive</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-red-700/40 bg-gradient-to-br from-black via-[#120305] to-black p-6">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em]">Project // Redline</h2>
            <p className="mt-3 text-sm text-red-200/70">
              Experimental systems research, latency-reduction pipelines, and input prediction
              tests for real-time experiences.
            </p>
            <div className="mt-4 text-[11px] font-terminal uppercase tracking-[0.35em] text-red-400/70">
              STATUS // LIVE
            </div>
          </section>

          <section className="rounded-2xl border border-red-700/40 bg-gradient-to-br from-black via-[#120305] to-black p-6">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em]">Artifact // Proto-UI</h2>
            <p className="mt-3 text-sm text-red-200/70">
              Visual experiments and interface prototypes. Contact for access to the full archive.
            </p>
            <div className="mt-4 text-[11px] font-terminal uppercase tracking-[0.35em] text-red-400/70">
              STATUS // RESTRICTED
            </div>
          </section>
        </div>

        <div className="mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] font-terminal text-red-400/70">
          <AlertTriangle size={14} />
          UNAUTHORIZED DISTRIBUTION PROHIBITED
        </div>
      </div>
    </main>
  );
}
