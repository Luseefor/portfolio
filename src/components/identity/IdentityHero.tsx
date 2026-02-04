'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';
import dynamic from 'next/dynamic';

const HeroAvatar3D = dynamic(() => import('./HeroAvatar3D'), { ssr: false });

export default function IdentityHero() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );

  return (
    <section className="relative min-h-[120vh]">
      <div className="sticky top-0 h-screen w-full px-6 pt-24 pb-12">
        <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col items-center text-center">
          <div className="w-full flex items-center justify-center">
            <div className="relative h-[25vh] min-h-[140px] max-h-[300px] aspect-square">
              <HeroAvatar3D />
            </div>
          </div>

          <motion.div
            className="mt-2 md:mt-4 flex w-full flex-col items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h2
              className="font-semibold text-slate-200/90 whitespace-nowrap"
              style={{ fontSize: 'clamp(0.875rem, 2.5vh, 1.75rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Hey there!
            </motion.h2>

            <motion.h1
              className="mt-1 md:mt-2 font-black tracking-tighter leading-[1.1]"
              style={{ fontSize: 'clamp(2.5rem, 15vh, 11rem)' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                textShadow: themeColor ? [`0 0 20px ${themeColor}20`, `0 0 40px ${themeColor}40`, `0 0 20px ${themeColor}20`] : undefined
              }}
              transition={{
                opacity: { delay: 0.3, duration: 0.8 },
                scale: { delay: 0.3, type: 'spring', damping: 15 },
                textShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
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
              className="mt-2 md:mt-6 text-slate-300/90 font-light max-w-4xl mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(0.75rem, 1.8vh, 1.5rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {PORTFOLIO_CONTENT.hero.tagline}
            </motion.p>

            <motion.div
              className="mt-8 md:mt-12 flex items-center gap-4 md:gap-8 uppercase tracking-[0.3em] md:tracking-[0.5em] font-terminal text-emerald-300/80"
              style={{ fontSize: 'clamp(0.5rem, 1.2vh, 0.875rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="hover:text-emerald-400 transition-colors">Identity</span>
              <span className="h-[1px] w-6 md:w-10 bg-emerald-400/30" />
              <span className="hover:text-emerald-400 transition-colors">Systems</span>
              <span className="h-[1px] w-6 md:w-10 bg-emerald-400/30" />
              <span className="hover:text-emerald-400 transition-colors">Interface</span>
            </motion.div>

            <motion.div
              className="mt-6 md:mt-10 flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              <motion.div
                className="flex items-center gap-3 uppercase tracking-[0.4em] md:tracking-[0.6em] font-terminal text-emerald-300/60"
                style={{ fontSize: 'clamp(0.45rem, 1vh, 0.75rem)' }}
                animate={{ y: [0, 6, 0], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="h-[1px] w-8 md:w-16 bg-emerald-400/20" />
                Exploration_Uplink
                <span className="h-[1px] w-8 md:w-16 bg-emerald-400/20" />
              </motion.div>
              <div className="flex flex-col items-center gap-1.5 opacity-60">
                <div className="h-2 w-2 md:h-2.5 md:w-2.5 rotate-45 border-b-2 border-r-2 border-emerald-400/40" />
                <div className="h-2 w-2 md:h-2.5 md:w-2.5 rotate-45 border-b-2 border-r-2 border-emerald-400/20" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
