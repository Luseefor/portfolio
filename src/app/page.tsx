'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal, ArrowRight, Grid3X3, ShieldCheck, Activity, Globe } from 'lucide-react';

const GlitchBackground = () => {
  const [glitchLines, setGlitchLines] = useState<number[]>([]);
  const [dataPoints, setDataPoints] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial data points only on client
    const points = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5
    }));
    setDataPoints(points);

    const interval = setInterval(() => {
      const lines = Array.from({ length: 3 }, () => Math.random() * 100);
      setGlitchLines(lines);
      setTimeout(() => setGlitchLines([]), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020202]">
      <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[120px] md:h-[800px] md:w-[800px]" />
      <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-emerald-900/10 blur-[120px] md:h-[800px] md:w-[800px]" />

      <motion.div
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)'
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        {dataPoints.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              y: [0, -100],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay
            }}
            className="absolute h-[1px] w-[1px] bg-emerald-400"
            style={{
              top: p.top,
              left: p.left,
              boxShadow: '0 0 8px #34d399'
            }}
          />
        ))}
      </div>

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

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.9)_100%)]" />
    </div>
  );
};

const GlassCard = ({ delay = 0, href = "#", title, description, badge, icon: Icon, active = true }: any) => {
  return (
    <Link href={href} className={`group relative block h-full ${!active && 'pointer-events-none cursor-default'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-6 shadow-2xl backdrop-blur-[40px] transition-all duration-500 group-hover:border-emerald-500/30 group-hover:from-white/[0.12] md:rounded-[2rem] md:p-8"
      >
        <motion.div
          initial={{ x: '-150%', skewX: -45 }}
          whileHover={{ x: '150%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-4 flex justify-between items-start md:mb-6">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[8px] font-black tracking-[0.2em] uppercase transition-colors md:px-4 md:text-[10px] ${active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-white/30'}`}>
              {badge}
            </span>
            <div className={`transition-all duration-500 ${active ? 'text-emerald-500 group-hover:scale-110 group-hover:text-emerald-400' : 'text-white/10'}`}>
              <Icon size={32} strokeWidth={1.5} className="md:w-12 md:h-12" />
            </div>
          </div>

          <h3 className={`mb-2 text-2xl font-black tracking-tight md:mb-4 md:text-3xl lg:text-4xl ${active ? 'text-white' : 'text-white/20'}`}>
            {title}
          </h3>
          <p className={`mb-6 text-xs leading-relaxed font-sans md:mb-8 md:text-sm ${active ? 'text-white/40' : 'text-white/10'}`}>
            {description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 md:gap-3 md:text-xs md:tracking-[0.3em] ${active ? 'text-emerald-500 group-hover:text-emerald-300' : 'text-white/10'}`}>
              <span>{active ? 'Initialize' : 'Offline'}</span>
              {active && <ArrowRight size={14} className="transition-transform group-hover:translate-x-2 md:w-4 md:h-4" />}
            </div>
            {active && (
              <div className="h-0.5 w-8 overflow-hidden rounded-full bg-white/5 md:h-1 md:w-12">
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
    <main className="relative flex h-screen w-full flex-col overflow-hidden font-mono text-emerald-500/60 selection:bg-emerald-500/30">
      <GlitchBackground />

      {/* --- HEADER --- */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm md:px-10 md:py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 md:gap-4"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md md:h-10 md:w-10 md:rounded-xl">
            <Terminal size={16} className="text-emerald-400 md:w-5 md:h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-[0.2em] text-white uppercase md:text-sm md:tracking-[0.4em]">Luseefor.SYS</span>
            <span className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest md:text-[10px]">Public_Interface</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.1em] md:gap-10 md:text-[10px] md:tracking-[0.2em]"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <Activity size={12} className="text-emerald-500 animate-pulse md:w-3.5 md:h-3.5" />
            <span className="text-white/60">Secure</span>
          </div>
          <div className="hidden items-center gap-3 border-l border-white/10 pl-6 md:flex md:pl-10">
            <Globe size={14} className="text-white/20" />
            <span className="text-white/20">99.9%</span>
          </div>
        </motion.div>
      </header>

      {/* --- MAIN DASHBOARD --- */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 md:px-10">
        <div className="mb-8 text-center md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 backdrop-blur-md md:mb-6 md:gap-3 md:px-6 md:py-2"
          >
            <ShieldCheck size={12} className="text-emerald-400 md:w-3.5 md:h-3.5" />
            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/40 md:text-[10px] md:tracking-[0.3em]">Access_Verified</span>
          </motion.div>

          <h1 className="text-4xl font-black tracking-tighter text-white sm:text-6xl md:text-8xl lg:text-[9rem] leading-none uppercase">
            PORTFOLIO<span className="text-emerald-500 opacity-20">.</span>os
          </h1>
        </div>

        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:gap-10">
          <div className="h-[220px] sm:h-[260px] md:h-auto lg:h-[380px]">
            <GlassCard
              href="/interactive"
              badge="01 // Environment"
              title="Interactive"
              description="Venture into a high-fidelity geospatial motherboard environment. Hardware accelerated."
              icon={Cpu}
              delay={0.4}
            />
          </div>
          <div className="h-[220px] sm:h-[260px] md:h-auto lg:h-[380px]">
            <GlassCard
              badge="02 // Documentation"
              title="Identity"
              description="A structured interface detailing projects and technical stack. Optimized for readability."
              icon={Grid3X3}
              delay={0.6}
              active={false}
            />
          </div>
        </div>
      </div>

      {/* --- SYSTEM METRICS FOOTER --- */}
      <footer className="relative z-50 w-full border-t border-white/5 bg-black/40 px-6 py-4 backdrop-blur-md md:px-12 md:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[7px] font-black tracking-[0.2em] text-white/30 uppercase md:text-[9px] md:tracking-[0.5em]">
          <div className="flex gap-4 md:gap-12">
            <div className="flex flex-col gap-0.5">
              <span className="text-emerald-500/40">Node</span>
              <span className="text-white">BROWSER_V1</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-emerald-500/40">Data</span>
              <span className="text-white">1024_PTS</span>
            </div>
            <div className="hidden flex-col gap-0.5 sm:flex">
              <span className="text-emerald-500/40">Link</span>
              <span className="text-white tabular-nums">{time}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-12">
            <span className="text-emerald-500 animate-pulse">Sync_Active</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
