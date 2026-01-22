'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal, ArrowRight, Grid3X3, ShieldCheck, Activity, Globe, Palette } from 'lucide-react';

const THEMES = {
  emerald: {
    name: 'Emerald',
    color: '#10b981',
    secondary: '#064e3b',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  amber: {
    name: 'Amber',
    color: '#f59e0b',
    secondary: '#78350f',
    glow: 'rgba(245, 158, 11, 0.4)'
  },
  cobalt: {
    name: 'Cobalt',
    color: '#3b82f6',
    secondary: '#1e3a8a',
    glow: 'rgba(59, 130, 246, 0.4)'
  },
  crimson: {
    name: 'Crimson',
    color: '#ef4444',
    secondary: '#7f1d1d',
    glow: 'rgba(239, 68, 68, 0.4)'
  }
};

const GravityBackground = ({ themeColor }: { themeColor: string }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Initialize particles on client
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * -20 // Start at different positions in their animation
    }));
    setParticles(p);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020202]">
      {/* Background glow using theme color */}
      <motion.div
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute -top-[10%] -left-[10%] h-[600px] w-[600px] rounded-full blur-[120px] md:h-[800px] md:w-[800px]"
        style={{ backgroundColor: themeColor }}
      />
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full blur-[120px] md:h-[800px] md:w-[800px]"
        style={{ backgroundColor: themeColor }}
      />

      {/* Gravity Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: '-10%', opacity: 0 }}
            animate={{
              y: '110vh',
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
            className="absolute rounded-full"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: themeColor,
              boxShadow: `0 0 10px ${themeColor}`
            }}
          />
        ))}
      </div>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${themeColor} 1px, transparent 1px), linear-gradient(90deg, ${themeColor} 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)'
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.9)_100%)]" />
    </div>
  );
};

const GlassCard = ({ delay = 0, href = "#", title, description, badge, icon: Icon, active = true, themeColor }: any) => {
  return (
    <Link href={href} className={`group relative block h-full ${!active && 'pointer-events-none cursor-default'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-6 shadow-2xl backdrop-blur-[40px] transition-all duration-500 hover:from-white/[0.12] md:rounded-[2rem] md:p-8"
        style={{ outline: `0px solid ${themeColor}` }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative z-10 flex h-full flex-col text-left">
          <div className="mb-4 flex justify-between items-start md:mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[8px] font-black tracking-[0.2em] uppercase transition-colors md:px-4 md:text-[10px]"
              style={{
                borderColor: active ? `${themeColor}40` : 'rgba(255,255,255,0.1)',
                backgroundColor: active ? `${themeColor}20` : 'rgba(255,255,255,0.05)',
                color: active ? themeColor : 'rgba(255,255,255,0.3)'
              }}
            >
              {badge}
            </span>
            <div
              className="transition-all duration-500"
              style={{ color: active ? themeColor : 'rgba(255,255,255,0.1)' }}
            >
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
            <div
              className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 md:gap-3 md:text-xs md:tracking-[0.3em]"
              style={{ color: active ? themeColor : 'rgba(255,255,255,0.1)' }}
            >
              <span>{active ? 'Initialize' : 'Offline'}</span>
              {active && <ArrowRight size={14} className="transition-transform group-hover:translate-x-2 md:w-4 md:h-4" />}
            </div>
            {active && (
              <div className="h-0.5 w-8 overflow-hidden rounded-full bg-white/5 md:h-1 md:w-12">
                <motion.div
                  animate={{ x: [-48, 48] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full"
                  style={{ backgroundColor: `${themeColor}60` }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ThemeSwitcher = ({ currentTheme, onThemeChange }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 right-6 z-[100] flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl md:bottom-auto md:top-32"
    >
      <div className="flex items-center gap-2 px-1 mb-1">
        <Palette size={14} className="text-white/40" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Themes</span>
      </div>
      <div className="flex flex-col gap-2">
        {Object.entries(THEMES).map(([id, theme]) => (
          <button
            key={id}
            onClick={() => onThemeChange(id)}
            className={`group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${currentTheme === id ? 'border-white/30 bg-white/10' : 'border-white/5 bg-transparent opacity-40 hover:opacity-100 hover:bg-white/5'
              }`}
            title={theme.name}
          >
            <div
              className="h-3 w-3 rounded-full shadow-lg"
              style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}` }}
            />
            {currentTheme === id && (
              <motion.div
                layoutId="theme-active"
                className="absolute inset-0 rounded-lg border border-white/20"
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [time, setTime] = useState('');
  const [currentTheme, setCurrentTheme] = useState('emerald');
  const activeTheme = useMemo(() => THEMES[currentTheme as keyof typeof THEMES], [currentTheme]);

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
    <main className="relative flex h-screen w-full flex-col overflow-hidden font-mono selection:bg-white/10">
      <GravityBackground themeColor={activeTheme.color} />
      <ThemeSwitcher currentTheme={currentTheme} onThemeChange={setCurrentTheme} />

      {/* --- HEADER --- */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm md:px-10 md:py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 md:gap-4"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md md:h-10 md:w-10 md:rounded-xl">
            <Terminal size={16} className="md:w-5 md:h-5" style={{ color: activeTheme.color }} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-black tracking-[0.2em] text-white uppercase md:text-sm md:tracking-[0.4em]">Luseefor.SYS</span>
            <span className="text-[8px] font-bold uppercase tracking-widest md:text-[10px]" style={{ color: `${activeTheme.color}60` }}>Public_Interface</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.1em] md:gap-10 md:text-[10px] md:tracking-[0.2em]"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <Activity size={12} className="animate-pulse md:w-3.5 md:h-3.5" style={{ color: activeTheme.color }} />
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
            <ShieldCheck size={12} className="md:w-3.5 md:h-3.5" style={{ color: activeTheme.color }} />
            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/40 md:text-[10px] md:tracking-[0.3em]">Access_Verified</span>
          </motion.div>

          <h1 className="text-4xl font-black tracking-tighter text-white sm:text-6xl md:text-8xl lg:text-[9.5rem] leading-none uppercase">
            Portfolio<span className="opacity-20" style={{ color: activeTheme.color }}>.</span>os
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
              themeColor={activeTheme.color}
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
              themeColor={activeTheme.color}
            />
          </div>
        </div>
      </div>

      {/* --- SYSTEM METRICS FOOTER --- */}
      <footer className="relative z-50 w-full border-t border-white/5 bg-black/40 px-6 py-4 backdrop-blur-md md:px-12 md:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[7px] font-black tracking-[0.2em] text-white/30 uppercase md:text-[9px] md:tracking-[0.5em]">
          <div className="flex gap-4 md:gap-12">
            <div className="flex flex-col gap-0.5">
              <span className="opacity-40" style={{ color: activeTheme.color }}>Node</span>
              <span className="text-white">BROWSER_V1</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="opacity-40" style={{ color: activeTheme.color }}>Data</span>
              <span className="text-white">1024_PTS</span>
            </div>
            <div className="hidden flex-col gap-0.5 sm:flex">
              <span className="opacity-40" style={{ color: activeTheme.color }}>Link</span>
              <span className="text-white tabular-nums">{time}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-12">
            <span className="animate-pulse" style={{ color: activeTheme.color }}>Sync_Active</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
