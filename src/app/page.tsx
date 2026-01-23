'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal, ArrowRight, Grid3X3, ShieldCheck, Activity, Globe, Palette, Sun, Moon } from 'lucide-react';
import { useStore } from '@/utils/store';
import dynamic from 'next/dynamic';

const FloatingParticles = dynamic(() => import('@/components/FloatingParticles'), { ssr: false });
const LetterGlitch = dynamic(() => import('@/components/LetterGlitch'), { ssr: false });
const HyperText = dynamic(() => import('@/components/HyperText'), { ssr: false });

const THEMES = {
  emerald: {
    name: 'Emerald',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  amber: {
    name: 'Amber',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)'
  },
  cobalt: {
    name: 'Cobalt',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)'
  },
  crimson: {
    name: 'Crimson',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)'
  }
};


const Background = ({ themeColor, isDark }: { themeColor: string, isDark: boolean }) => {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#020202]' : 'bg-[#fcfcfc]'}`}>
      <motion.div
        animate={{ opacity: isDark ? [0.03, 0.08, 0.03] : [0.05, 0.12, 0.05] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] md:h-[800px] md:w-[800px] md:blur-[150px]"
        style={{ backgroundColor: themeColor, willChange: "opacity, transform" }}
      />

      <FloatingParticles
        particleColor={themeColor}
        particleCount={30}
        movementSpeed={0.3}
        mouseInfluence={200}
        mouseGravity="attract"
        gravityStrength={80}
      />

      <LetterGlitch
        glitchColors={[themeColor, `${themeColor}aa`, `${themeColor}55`]}
        opacity={isDark ? 0.05 : 0.08}
        outerVignette={false}
      />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] md:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${themeColor} 1px, transparent 1px), linear-gradient(90deg, ${themeColor} 1px, transparent 1px)`,
          backgroundSize: '120px 120px',
        }}
      />

      <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-100' : 'opacity-40'}`} style={{ background: `radial-gradient(circle at center, transparent 30%, ${isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)'} 100%)` }} />
    </div>
  );
};


const ThemeDropdown = ({ currentTheme, onThemeChange, isDark, toggleDark, themeColor }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 rounded-full border px-4 py-2 transition-all backdrop-blur-md md:px-5 ${isDark ? 'border-white/10 bg-white/5 text-white/60 hover:border-white/20' : 'border-black/5 bg-black/5 text-slate-900/60 hover:border-black/10'}`}
      >
        <div
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: themeColor, boxShadow: `0 0 8px ${themeColor}` }}
        />
        <span className="text-[10px] font-black uppercase tracking-widest">{THEMES[currentTheme as keyof typeof THEMES].name}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <Palette size={12} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute right-0 top-full z-[110] mt-4 w-56 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${isDark ? 'border-white/10 bg-black/80' : 'border-black/5 bg-white/90'}`}
            >
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900/40'}`}>Appearance</span>
                  <button
                    onClick={toggleDark}
                    className={`flex h-6 w-12 items-center rounded-full p-1 transition-colors ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
                  >
                    <motion.div
                      animate={{ x: isDark ? 24 : 0 }}
                      className={`h-4 w-4 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
                    >
                      {isDark ? <Moon size={8} /> : <Sun size={8} />}
                    </motion.div>
                  </button>
                </div>

                <div className="flex flex-col gap-3 px-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900/40'}`}>System Accent</span>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(THEMES).map(([id, theme]) => (
                      <button
                        key={id}
                        onClick={() => {
                          onThemeChange(id);
                          setIsOpen(false);
                        }}
                        className={`group relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${currentTheme === id ? (isDark ? 'border-white/30 bg-white/10' : 'border-black/20 bg-black/5') : 'border-transparent'
                          }`}
                      >
                        <div
                          className="h-4 w-4 rounded-full transition-transform group-hover:scale-125"
                          style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}` }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const Magnetic = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

const GlassCard = ({ delay = 0, href = "#", title, description, badge, icon: Icon, active = false, themeColor, isDark }: any) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const isActiveState = active || isHovered;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <Link href={href} className="group relative block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: rotate.x,
          rotateY: rotate.y
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        transition={{
          opacity: { delay, duration: 0.8 },
          rotateX: { type: "spring", stiffness: 100, damping: 30 },
          rotateY: { type: "spring", stiffness: 100, damping: 30 }
        }}
        style={{ perspective: 1000 }}
        className={`relative h-full overflow-hidden rounded-[1.5rem] border p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 md:rounded-[2rem] md:p-8 md:backdrop-blur-[60px] ${isDark
          ? 'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent hover:from-white/[0.12]'
          : 'border-black/[0.05] bg-gradient-to-br from-white/80 to-white/20 hover:from-white/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)]'}`}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative z-10 flex h-full flex-col text-left">
          <div className="mb-4 flex justify-between items-start md:mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[8px] font-black tracking-[0.2em] uppercase transition-colors md:px-4 md:text-[10px]"
              style={{
                borderColor: isActiveState ? `${themeColor}40` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                backgroundColor: isActiveState ? `${themeColor}10` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                color: isActiveState ? themeColor : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
              }}
            >
              {badge}
            </span>
            <div
              className="transition-all duration-500"
              style={{ color: isActiveState ? themeColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }}
            >
              <Icon size={32} strokeWidth={1.5} className="md:w-12 md:h-12" />
            </div>
          </div>

          <h3 className={`mb-2 text-2xl font-black tracking-tight transition-colors duration-500 md:mb-4 md:text-3xl lg:text-4xl ${isActiveState ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-white/20' : 'text-slate-900/20')}`}>
            {title}
          </h3>
          <p className={`mb-6 text-xs leading-relaxed font-sans transition-colors duration-500 md:mb-8 md:text-sm ${isActiveState ? (isDark ? 'text-white/40' : 'text-slate-600') : (isDark ? 'text-white/10' : 'text-slate-900/10')}`}>
            {description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <Magnetic>
              <div
                className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 md:gap-3 md:text-xs md:tracking-[0.3em]"
                style={{ color: isActiveState ? themeColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }}
              >
                <span>{isActiveState ? 'Initialize' : 'Offline'}</span>
                {isActiveState && <ArrowRight size={14} className="transition-transform group-hover:translate-x-2 md:w-4 md:h-4" />}
              </div>
            </Magnetic>
            {active && (
              <div className={`h-0.5 w-8 overflow-hidden rounded-full md:h-1 md:w-12 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
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

export default function Home() {
  const [time, setTime] = useState('');
  const { currentTheme, setCurrentTheme, isDark, setIsDark } = useStore();

  const activeThemeColor = useMemo(() => {
    const rawColor = THEMES[currentTheme as keyof typeof THEMES].color;
    if (isDark) return rawColor;

    // Deeper colors for light mode to ensure premium contrast
    const lightAccents: any = {
      emerald: '#059669',
      amber: '#d97706',
      cobalt: '#2563eb',
      crimson: '#dc2626'
    };
    return lightAccents[currentTheme] || rawColor;
  }, [currentTheme, isDark]);

  const [systemNode, setSystemNode] = useState('DETECTING...');
  const [systemData, setSystemData] = useState('INITIALIZING...');
  const [securityStatus, setSecurityStatus] = useState('CHECKING...');
  const [syncStatus, setSyncStatus] = useState('0');

  useEffect(() => {
    // Time Loop
    const updateClock = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').slice(0, 19));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    // System Metrics
    const updateMetrics = () => {
      setSystemData(`${window.innerWidth}_X_${window.innerHeight}_PXLS`);

      const ua = navigator.userAgent;
      let platform = 'UNKNOWN';
      if (ua.includes('Mac')) platform = 'MAC_OS';
      else if (ua.includes('Win')) platform = 'WIN_NT';
      else if (ua.includes('Linux')) platform = 'LINUX';
      else if (ua.includes('Android')) platform = 'ANDROID';
      else if (ua.includes('iPhone')) platform = 'IOS';

      let browser = 'WEB';
      if (ua.includes('Chrome')) browser = 'CHROME';
      else if (ua.includes('Safari')) browser = 'SAFARI';
      else if (ua.includes('Firefox')) browser = 'FIREFOX';

      setSystemNode(`${platform}_${browser}`);
    };

    // Security & Sync Check
    setSecurityStatus(window.location.protocol === 'https:' ? 'SECURE' : 'UNSECURE');

    const pingInterval = setInterval(() => {
      const start = performance.now();
      // Simulate a network check (or use fetch/HEAD in prod)
      setTimeout(() => {
        const latency = Math.round(performance.now() - start);
        setSyncStatus(latency.toString());
      }, Math.random() * 50); // Simulated network jitter
    }, 2000);

    updateMetrics();
    window.addEventListener('resize', updateMetrics);

    return () => {
      clearInterval(interval);
      clearInterval(pingInterval);
      window.removeEventListener('resize', updateMetrics);
    };
  }, []);

  return (
    <main className={`relative flex h-screen w-full flex-col overflow-hidden font-mono selection:bg-none cursor-default select-none transition-colors duration-1000 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <Background themeColor={activeThemeColor} isDark={isDark} />

      {/* --- HEADER --- */}
      <header className="relative z-50 flex shrink-0 items-center justify-between px-6 py-3 backdrop-blur-sm md:px-10 md:py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => useStore.getState().setChatOpen(true)}
          className="flex items-center gap-3 md:gap-4 cursor-pointer"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all md:h-10 md:w-10 md:rounded-xl ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}>
            <Terminal size={16} className="md:w-5 md:h-5" style={{ color: activeThemeColor }} />
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <div className="min-h-[14px] min-w-[100px] md:min-h-[20px] md:min-w-[140px] flex items-center">
              <HyperText
                text="Luseefor"
                className={`text-xs font-black tracking-[0.2em] uppercase transition-colors md:text-sm md:tracking-[0.4em] ${isDark ? 'text-white' : 'text-slate-900'}`}
              />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest md:text-[10px]" style={{ color: `${activeThemeColor}80` }}>Public_Interface</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.1em] md:gap-10 md:text-[10px] md:tracking-[0.2em]"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <Activity size={12} className="animate-pulse md:w-3.5 md:h-3.5" style={{ color: securityStatus === 'SECURE' ? activeThemeColor : '#ef4444' }} />
            <span className={`w-16 inline-flex justify-center ${isDark ? 'text-white/60' : 'text-slate-900/60'}`}>
              <HyperText text={securityStatus} />
            </span>
          </div>
          <div className={`hidden h-8 w-[1px] md:block ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
          <ThemeDropdown
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            isDark={isDark}
            toggleDark={() => setIsDark(!isDark)}
            themeColor={activeThemeColor}
          />
        </motion.div>
      </header>

      {/* --- MAIN DASHBOARD --- */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 md:px-10">
        <div className="mb-6 text-center md:mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-md md:mb-6 md:gap-3 md:px-6 md:py-2 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}
          >
            <ShieldCheck size={12} className="md:w-3.5 md:h-3.5" style={{ color: activeThemeColor }} />
            <div className={`text-[8px] font-black tracking-[0.2em] uppercase md:text-[10px] md:tracking-[0.3em] ${isDark ? 'text-white/40' : 'text-slate-900/40'}`}>
              <HyperText text="Access_Verified" />
            </div>
          </motion.div>

          <h1 className={`text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11rem] leading-none uppercase transition-colors duration-1000 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {"Portfolio".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.8 + i * 0.05,
                  duration: 0.8,
                  ease: [0.2, 0.65, 0.3, 0.9]
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="transition-colors duration-1000"
              style={{ color: activeThemeColor }}
            >
              .
            </motion.span>
            {"os".split("").map((char, i) => (
              <motion.span
                key={i + 10}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 1.6 + i * 0.1,
                  duration: 0.8,
                  ease: [0.2, 0.65, 0.3, 0.9]
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </h1>
        </div>

        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
          <div className="h-[200px] sm:h-[220px] md:h-auto lg:h-[320px]">
            <GlassCard
              href="/interactive"
              badge="01 // Environment"
              title="Interactive"
              description="Venture into a high-fidelity geospatial motherboard environment. Hardware accelerated."
              icon={Cpu}
              delay={0.4}
              themeColor={activeThemeColor}
              isDark={isDark}
            />
          </div>
          <div className="h-[200px] sm:h-[220px] md:h-auto lg:h-[320px]">
            <GlassCard
              href="/identity"
              badge="02 // Documentation"
              title="Identity"
              description="A structured interface detailing projects and technical stack. Optimized for readability."
              icon={Grid3X3}
              delay={0.6}
              themeColor={activeThemeColor}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* --- SYSTEM METRICS FOOTER --- */}
      <footer className={`relative z-50 w-full shrink-0 border-t px-6 py-3 backdrop-blur-md transition-colors duration-1000 md:px-12 md:py-4 ${isDark ? 'border-white/5 bg-black/40' : 'border-black/5 bg-white/40'}`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 text-[7px] font-black tracking-[0.2em] uppercase transition-colors duration-1000 md:text-[9px] md:tracking-[0.5em] ${isDark ? 'text-white/30' : 'text-slate-900/30'}`}>
          <div className="flex gap-8 md:gap-12">
            <div className="flex flex-col gap-0.5 cursor-pointer min-w-[80px]">
              <span className="opacity-40" style={{ color: activeThemeColor }}>Node</span>
              <span className={`transition-colors duration-1000 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                <HyperText text={systemNode} />
              </span>
            </div>
            <div className="flex flex-col gap-0.5 cursor-pointer min-w-[80px]">
              <span className="opacity-40" style={{ color: activeThemeColor }}>Data</span>
              <span className={`transition-colors duration-1000 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                <HyperText text={systemData} />
              </span>
            </div>
            <div className="hidden flex-col gap-0.5 sm:flex cursor-pointer min-w-[120px]">
              <span className="opacity-40" style={{ color: activeThemeColor }}>Link</span>
              <span className={`tabular-nums transition-colors duration-1000 ${isDark ? 'text-white' : 'text-slate-950'}`}>{time}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-12">
            <span className="animate-pulse cursor-pointer flex items-center gap-2" style={{ color: activeThemeColor }}>
              <HyperText text="SYNC_ACTIVE" />
              <span className="tabular-nums">[{syncStatus}MS]</span>
            </span>
          </div>
        </div>
      </footer>
    </main >
  );
}
