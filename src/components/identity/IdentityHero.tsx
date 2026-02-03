'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Github, Linkedin } from 'lucide-react';
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

  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <section ref={sectionRef} className="relative min-h-[120vh] z-10">
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="sticky top-0 h-screen flex items-center justify-center px-4"
      >
        <div className="relative w-full max-w-5xl flex flex-col items-center text-center gap-4 md:gap-6 -translate-y-4 md:-translate-y-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="-mt-1"
          >
            <HeroAvatar3D />
          </motion.div>

          <div className="relative w-full max-w-4xl">
            <motion.h2
              className="text-xl md:text-2xl font-semibold text-slate-200 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Hey there!
            </motion.h2>
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: 'spring' }}
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
              className="text-base md:text-lg text-slate-300/80 font-medium max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              {PORTFOLIO_CONTENT.hero.tagline}
            </motion.p>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-[110px] rounded-full pointer-events-none -z-10" />
        </div>

        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
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
      </motion.div>
    </section>
  );
}
