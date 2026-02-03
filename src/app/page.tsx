'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ShieldCheck, Gamepad2 } from 'lucide-react';
import { useStore } from '@/utils/store';
import dynamic from 'next/dynamic';

const Background = dynamic(() => import('@/components/home/Background'), { ssr: false });
const ThemeDropdown = dynamic(() => import('@/components/home/ThemeDropdown'), { ssr: false });
const GlassCard = dynamic(() => import('@/components/home/GlassCard').then((m) => m.GlassCard), {
  ssr: false,
});
const HyperText = dynamic(() => import('@/components/shared/HyperText'), { ssr: false });

import { getThemeColor } from '@/utils/themes';
import { Grid3X3 } from 'lucide-react';

export default function Home() {
  const [time, setTime] = useState('');
  const { currentTheme, setCurrentTheme, isDark, setIsDark } = useStore();
  const [konamiActive, setKonamiActive] = useState(false);

  const activeThemeColor = useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const konamiThemeColor = '#ff2d2d';
  const displayIsDark = konamiActive ? true : isDark;
  const displayThemeColor = konamiActive ? konamiThemeColor : activeThemeColor;
  const cardGridCols = konamiActive ? 'md:grid-cols-3' : 'md:grid-cols-2';

  const [systemNode, setSystemNode] = useState('DETECTING...');
  const [systemData, setSystemData] = useState('INITIALIZING...');
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('konamiUnlocked');
    if (stored === 'true') setKonamiActive(true);
  }, []);

  useEffect(() => {
    const sequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'KeyB',
      'KeyA',
    ];
    let index = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === sequence[index]) {
        index += 1;
        if (index === sequence.length) {
          setKonamiActive(true);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('konamiUnlocked', 'true');
          }
          index = 0;
        }
      } else {
        index = event.code === sequence[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <main
      className={`relative flex h-screen w-full flex-col overflow-hidden font-mono selection:bg-none cursor-default select-none transition-colors duration-1000 ${displayIsDark ? 'text-white' : 'text-slate-900'}`}
    >
      <Background themeColor={displayThemeColor} isDark={displayIsDark} glitchMode={konamiActive} />

      {/* --- HEADER --- */}
      <header className="relative z-50 flex shrink-0 items-center justify-between pl-6 pr-10 py-3 backdrop-blur-sm md:pl-10 md:pr-12 md:py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => useStore.getState().setChatOpen(true)}
          className="flex items-center gap-3 md:gap-4 cursor-pointer"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all md:h-10 md:w-10 md:rounded-xl ${displayIsDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}
          >
            <Terminal size={16} className="md:w-5 md:h-5" style={{ color: displayThemeColor }} />
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <div className="min-h-[14px] min-w-[100px] md:min-h-[20px] md:min-w-[140px] flex items-center">
              <HyperText
                text="Luseefor"
                className={`text-xs font-black tracking-[0.2em] uppercase transition-colors md:text-sm md:tracking-[0.4em] font-terminal ${displayIsDark ? 'text-white' : 'text-slate-900'}`}
              />
            </div>
            <span
              className="text-[8px] font-bold uppercase tracking-widest md:text-[10px] font-terminal"
              style={{ color: `${displayThemeColor}80` }}
            >
              Public_Interface
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.1em] md:gap-10 md:text-[10px] md:tracking-[0.2em]"
        >
          <div
            className={`hidden h-8 w-[1px] md:block ${displayIsDark ? 'bg-white/10' : 'bg-black/10'}`}
          />
          <ThemeDropdown
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            isDark={displayIsDark}
            toggleDark={() => setIsDark(!isDark)}
            themeColor={displayThemeColor}
          />
        </motion.div>
      </header>

      {/* --- MAIN DASHBOARD --- */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 md:px-10">
        <div className="mb-6 text-center md:mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-md md:mb-6 md:gap-3 md:px-6 md:py-2 ${displayIsDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}
          >
            <ShieldCheck
              size={12}
              className="md:w-3.5 md:h-3.5"
              style={{ color: displayThemeColor }}
            />
            <div
              className={`text-[8px] font-black tracking-[0.2em] uppercase md:text-[10px] md:tracking-[0.3em] font-terminal ${displayIsDark ? 'text-white/40' : 'text-slate-900/40'}`}
            >
              <HyperText text="Access_Verified" />
            </div>
          </motion.div>

          <div className="relative group">
            <h1
              className={`text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11.5rem] leading-none uppercase transition-colors duration-1000 font-display`}
              style={{
                color: displayIsDark ? 'white' : 'transparent',
                backgroundImage: !displayIsDark
                  ? `linear-gradient(to bottom right, ${displayThemeColor}, ${displayThemeColor}aa)`
                  : 'none',
                WebkitBackgroundClip: !displayIsDark ? 'text' : 'none',
                backgroundClip: !displayIsDark ? 'text' : 'none',
              }}
            >
              {'Portfolio'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.8 + i * 0.04,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block px-1"
                >
                  {char}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: displayIsDark ? 0.3 : 0.6, scale: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="transition-colors duration-1000"
                style={{ color: displayThemeColor }}
              >
                .
              </motion.span>
              {'os'.split('').map((char, i) => (
                <motion.span
                  key={i + 10}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 1.4 + i * 0.08,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block px-1"
                >
                  {char}
                </motion.span>
              ))}
            </h1>
            <div
              className={`pointer-events-none absolute -right-8 top-0 opacity-0 transition-opacity duration-500 group-hover:opacity-70 font-terminal text-[10px] uppercase tracking-[0.6em] ${displayIsDark ? 'text-white/60' : 'text-slate-900/60'}`}
            >
              0xC0DE
            </div>
          </div>
          {konamiActive && (
            <div
              className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-terminal uppercase tracking-[0.35em] ${
                displayIsDark ? 'border-white/10 bg-white/5 text-white/70' : 'border-black/10 bg-black/5 text-slate-900/70'
              }`}
            >
              KONAMI_MODE // UNLOCKED
            </div>
          )}
          <div
            className={`mt-4 text-[8px] font-terminal uppercase tracking-[0.8em] transition-colors duration-1000 ${displayIsDark ? 'text-white/10' : 'text-black/5'}`}
          >
            01001100 01010101 01010011 01001100
          </div>
        </div>

        <div className={`grid w-full max-w-6xl grid-cols-1 gap-4 ${cardGridCols} md:gap-6 lg:gap-8`}>
          <div className="h-[200px] sm:h-[220px] md:h-auto lg:h-[320px]">
            <GlassCard
              href="/identity"
              badge="01 // Documentation"
              title="Identity"
              description="A structured interface detailing projects and technical stack. Optimized for readability."
              icon={Grid3X3}
              delay={0.6}
              themeColor={displayThemeColor}
              isDark={displayIsDark}
              active
              easter={konamiActive ? 'PROTOCOL: ID-ROOT' : undefined}
            />
          </div>
          <div className="h-[200px] sm:h-[220px] md:h-auto lg:h-[320px]">
            <GlassCard
              href="/interactive"
              badge="02 // Simulation"
              title="Interactive"
              description="A third-person shooter-style interactive environment showcasing realtime systems and input fidelity."
              icon={Gamepad2}
              delay={0.75}
              themeColor={displayThemeColor}
              isDark={displayIsDark}
              active
              easter={konamiActive ? 'PROTOCOL: SIM-CORE' : undefined}
            />
          </div>
          {konamiActive && (
            <div className="h-[200px] sm:h-[220px] md:h-auto lg:h-[320px]">
              <GlassCard
                href="/rd"
                badge="03 // R&D BLACKSITE"
                title="R&D"
                description="Restricted research archive. Prototype systems and experimental builds."
                icon={ShieldCheck}
                delay={0.9}
                themeColor={konamiThemeColor}
                isDark
                active
                easter="ACCESS: REDLINE"
              />
            </div>
          )}
        </div>
      </div>

      {/* --- SYSTEM METRICS FOOTER --- */}
      <footer
        className={`relative z-50 w-full shrink-0 border-t px-6 py-3 backdrop-blur-md transition-colors duration-1000 md:px-12 md:py-4 ${displayIsDark ? 'border-white/5 bg-black/40' : 'border-black/5 bg-white/40'}`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-4 text-[7px] font-black tracking-[0.2em] uppercase transition-colors duration-1000 md:text-[9px] md:tracking-[0.5em] font-terminal ${displayIsDark ? 'text-white/30' : 'text-slate-900/30'}`}
        >
          <div className="flex gap-8 md:gap-12">
            <div className="flex flex-col gap-0.5 cursor-pointer min-w-[80px]">
              <span className="opacity-40" style={{ color: displayThemeColor }}>
                Node
              </span>
              <span
                className={`transition-colors duration-1000 ${displayIsDark ? 'text-white' : 'text-slate-950'}`}
              >
                <HyperText text={systemNode} />
              </span>
            </div>
            <div className="flex flex-col gap-0.5 cursor-pointer min-w-[80px]">
              <span className="opacity-40" style={{ color: displayThemeColor }}>
                Data
              </span>
              <span
                className={`transition-colors duration-1000 ${displayIsDark ? 'text-white' : 'text-slate-950'}`}
              >
                <HyperText text={systemData} />
              </span>
            </div>
            <div className="hidden flex-col gap-0.5 sm:flex cursor-pointer min-w-[120px]">
              <span className="opacity-40" style={{ color: displayThemeColor }}>
                Link
              </span>
              <span
                className={`tabular-nums transition-colors duration-1000 ${displayIsDark ? 'text-white' : 'text-slate-950'}`}
              >
                {time}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-12">
            <span
              className="animate-pulse cursor-pointer flex items-center gap-2"
              style={{ color: displayThemeColor }}
            >
              <HyperText text="SYNC_ACTIVE" />
              <span className="tabular-nums">[{syncStatus}MS]</span>
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
