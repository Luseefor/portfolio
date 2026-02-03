'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

export default function IdentityHero() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );

  return (
    <section className="relative min-h-[120vh]">
      <div className="sticky top-0 h-screen w-full px-6 pt-16 pb-16">
        <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center text-center -translate-y-8 md:-translate-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] font-terminal uppercase tracking-[0.4em] text-emerald-300/80"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
            SIGNAL ONLINE
          </motion.div>

          <motion.h2
            className="mt-6 text-xl md:text-2xl font-semibold text-slate-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Hey there!
          </motion.h2>

          <motion.h1
            className="mt-2 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            I'm{' '}
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColor}, ${themeColor}CC)`,
              }}
            >
              {PORTFOLIO_CONTENT.hero.title}.
            </span>
          </motion.h1>

          <motion.p
            className="mt-5 text-base md:text-lg text-slate-300/80 font-medium max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {PORTFOLIO_CONTENT.hero.tagline}
          </motion.p>

          <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] font-terminal text-emerald-300/70">
            <span>Identity</span>
            <span className="h-[1px] w-6 bg-emerald-400/40" />
            <span>Systems</span>
            <span className="h-[1px] w-6 bg-emerald-400/40" />
            <span>Interface</span>
          </div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            <motion.div
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] font-terminal text-emerald-300/70"
              animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="h-[1px] w-8 bg-emerald-400/40" />
              Scroll
              <span className="h-[1px] w-8 bg-emerald-400/40" />
            </motion.div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-2 w-2 rotate-45 border-b border-r border-emerald-400/60" />
              <div className="h-2 w-2 rotate-45 border-b border-r border-emerald-400/40" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
