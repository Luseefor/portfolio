'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Monitor, Cpu, Terminal, ArrowRight, Grid3X3, Layers } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#020202] font-mono text-emerald-500 selection:bg-emerald-500/30">
      {/* --- TECH BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        {/* Digital Grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }}
        />

        {/* Glowing Orbs */}
        <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-emerald-900/20 blur-[150px]" />

        {/* Scanlines Overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20" />
      </div>

      {/* --- NAVIGATION / HEADER --- */}
      <nav className="relative z-50 flex items-center justify-between p-8 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-sm font-bold tracking-[0.4em] uppercase"
        >
          <Terminal size={18} className="text-emerald-400" />
          <span>Luseefor.sys</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden gap-8 text-[10px] sm:flex"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="opacity-50 uppercase tracking-[0.2em]">Core Active</span>
          </div>
        </motion.div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-20 flex min-h-[calc(100vh-100px)] flex-col items-center justify-center px-6">
        {/* Title Section */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative inline-block"
          >
            <h1 className="mb-4 text-6xl font-black italic tracking-tighter text-white sm:text-8xl md:text-9xl">
              PORTFOLIO
            </h1>
            {/* Subtitle with Glitch Effect */}
            <motion.p
              animate={{ x: [-1, 1, -1] }}
              transition={{ duration: 0.1, repeat: Infinity }}
              className="absolute -top-4 -right-4 text-xs font-bold tracking-[1em] text-emerald-400 mix-blend-difference uppercase"
            >
              V2.0_EXPLORER
            </motion.p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
            className="mx-auto max-w-xl text-xs font-medium tracking-[0.5em] uppercase"
          >
            Select your preferred visualization interface to proceed
          </motion.p>
        </div>

        {/* --- CHOICE CARDS --- */}
        <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">

          {/* Interactive 3D Card */}
          <Link href="/interactive" className="group">
            <motion.div
              whileHover={{ y: -10, borderColor: 'rgba(16,185,129,0.5)' }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative h-[400px] overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl transition-colors hover:bg-emerald-500/[0.03]"
            >
              <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100">
                <Cpu size={80} className="text-emerald-500" />
              </div>

              <div className="flex h-full flex-col justify-end">
                <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                  Immersive Mode
                </span>
                <h3 className="mb-4 text-4xl font-bold text-white">Interactive Drive</h3>
                <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/40">
                  Navigate through a futuristic motherboard landscape. Experience the 3D city as it reacts to your movements.
                </p>
                <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-emerald-500 group-hover:text-emerald-300">
                  <span>Initiate Protocol</span>
                  <ArrowRight size={18} className="translate-x-0 transition-transform group-hover:translate-x-2" />
                </div>
              </div>

              {/* Decorative Grid Lines */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          </Link>

          {/* Base Website Card */}
          <Link href="#" className="group pointer-events-none opacity-60"> {/* Disabled for now but styled */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="relative h-[400px] overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-colors"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Grid3X3 size={80} className="text-white" />
              </div>

              <div className="flex h-full flex-col justify-end">
                <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold tracking-widest text-white/40 uppercase">
                  Standard Interface
                </span>
                <h3 className="mb-4 text-4xl font-bold text-white">Classic Portfolio</h3>
                <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/40">
                  A high-performance, minimalist view of projects and professional milestones. Pure data, no distraction.
                </p>
                <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-white/20">
                  <span>System Offline</span>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-lg border border-white/20 px-6 py-2 text-xs font-bold tracking-[0.5em] uppercase">Coming Soon</span>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* --- FOOTER DECORATION --- */}
      <div className="absolute bottom-8 left-0 z-50 flex w-full justify-between border-t border-emerald-500/10 px-12 pt-8 text-[10px] font-bold tracking-[0.5em] text-emerald-500/20 uppercase">
        <div className="flex gap-12">
          <span>Lat: 34.0522 N</span>
          <span>Lon: 118.2437 W</span>
        </div>
        <div className="flex gap-12">
          <span>Protocol: 0x889</span>
          <span>Status: Decrypted</span>
        </div>
      </div>
    </main>
  );
}
