'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal, ArrowRight, Grid3X3, ShieldCheck, Activity, Globe } from 'lucide-react';

const GlitchBackground = () => {
  const [glitchLines, setGlitchLines] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const lines = Array.from({ length: 3 }, () => Math.random() * 100);
      setGlitchLines(lines);
      setTimeout(() => setGlitchLines([]), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020202]">
      {/* Liquid Glow Base */}
      <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="absolute -bottom-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-emerald-900/10 blur-[120px]" />

      {/* Depth Grid */}
      <motion.div
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
          backgroundSize: '120px 120px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)'
        }}
      />

      {/* Active Data Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              y: [0, -100],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute h-[1px] w-[1px] bg-emerald-400"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: '0 0 8px #34d399'
            }}
          />
        ))}
      </div>

      {/* Interference Strips */}
      <AnimatePresence>
        {glitchLines.map((top, i) => (
          <motion.div
            key={`${top}-${i}`}
            initial={{ opacity: 0, x: '-10%' }}
            animate={{ opacity: [0, 1, 0], x: '10%' }}
            transition={{ duration: 0.3 }}
            className="absolute h-[2px] w-full bg-emerald-500/10 backdrop-blur-sm"
            style={{ top: `${top}%` }}
          />
        ))}
      </AnimatePresence>

      {/* Scanline Jitter */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.9)_100%)]" />
    </div>
  );
};

const GlassCard = ({ children, delay = 0, href = "#", title, description, badge, icon: Icon, active = true }: any) => {
  return (
    <Link href={href} className={`group relative block ${!active && 'pointer-events-none cursor-default'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="relative h-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-10 shadow-2xl backdrop-blur-[80px] transition-all duration-500 group-hover:border-emerald-500/30 group-hover:from-white/[0.12]"
      >
        {/* Liquid Sheen Effect */}
        <motion.div
          initial={{ x: '-150%', skewX: -45 }}
          whileHover={{ x: '150%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-8 flex justify-between items-start">
            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-white/30'}`}>
              {badge}
            </span>
            <div className={`transition-all duration-500 ${active ? 'text-emerald-500 group-hover:scale-110 group-hover:text-emerald-400' : 'text-white/10'}`}>
              <Icon size={48} strokeWidth={1.5} />
            </div>
          </div>

          <h3 className={`mb-4 text-4xl font-black tracking-tight ${active ? 'text-white' : 'text-white/20'}`}>
            {title}
          </h3>
          <p className={`mb-10 max-w-sm text-sm leading-relaxed font-sans ${active ? 'text-white/40' : 'text-white/10'}`}>
            {description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className={`flex items-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 ${active ? 'text-emerald-500 group-hover:text-emerald-300' : 'text-white/10'}`}>
              <span>{active ? 'Initialize Interface' : 'Node Offline'}</span>
              {active && <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />}
            </div>
            {active && (
              <div className="h-1 w-12 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  animate={{ x: [-48, 48] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full bg-emerald-500/40"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function Home() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').slice(0, 19));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden font-mono text-emerald-500/60 selection:bg-emerald-500/30">
      <GlitchBackground />

      {/* --- HEADER --- */}
      <header className="relative z-50 flex items-center justify-between px-10 py-8 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
            <Terminal size={20} className="text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-[0.4em] text-white uppercase">Portfolio.SYS</span>
            <span className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">Public_Interface</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <div className="flex items-center gap-3">
            <Activity size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-white/60">Connection: SECURE</span>
          </div>
          <div className="hidden lg:flex items-center gap-3 border-l border-white/10 pl-10">
            <Globe size={14} className="text-white/20" />
            <span className="text-white/20">Uptime: 99.99%</span>
          </div>
        </motion.div>
      </header>

      {/* --- MAIN DASHBOARD --- */}
      <div className="relative z-20 flex min-h-[calc(100vh-160px)] flex-col items-center justify-center px-10">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2 backdrop-blur-md"
          >
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Access_Verified</span>
          </motion.div>

          <h1 className="mb-6 text-7xl font-black tracking-tighter text-white sm:text-8xl md:text-[10rem] leading-[0.8]">
            PORTFOLIO<span className="text-emerald-500 opacity-20">.</span>OS
          </h1>
        </div>

        <div className="grid w-full max-w-6xl grid-cols-1 gap-10 md:grid-cols-2">
          <GlassCard
            href="/interactive"
            badge="01 // Environment"
            title="Immersive Drive"
            description="Venture into a high-fidelity geospatial motherboard environment. Optimized for neural engines and hardware acceleration."
            icon={Cpu}
            delay={0.4}
          />
          <GlassCard
            badge="02 // Documentation"
            title="Core Identity"
            description="A structured interface detailing professional achievements, technical stack, and verified project history. Optimized for readability."
            icon={Grid3X3}
            delay={0.6}
            active={false}
          />
        </div>
      </div>

      {/* --- SYSTEM METRICS FOOTER --- */}
      <footer className="absolute bottom-0 left-0 z-50 w-full border-t border-white/5 px-12 py-8 bg-black/20 backdrop-blur-md">
        <div className="flex flex-wrap justify-between gap-8 text-[9px] font-black tracking-[0.5em] text-white/30 uppercase">
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-emerald-500/40">Client_Node</span>
              <span className="text-white">NODE_BROWSER_V1</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-emerald-500/40">Data_Index</span>
              <span className="text-white">1024_OBJECT_PTS</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-emerald-500/40">Terminal_Link</span>
              <span className="text-white">STABLE</span>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex flex-col gap-1 text-right">
              <span className="text-emerald-500/40">Universal_Time</span>
              <span className="text-white tabular-nums tracking-widest">{time}</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <span className="text-emerald-500 tracking-[1em] animate-pulse">Live_Sync</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
