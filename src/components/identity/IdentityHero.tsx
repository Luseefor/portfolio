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
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, -40]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[120vh] flex flex-col items-center justify-center text-center px-6 pt-16 pb-16 z-10"
    >
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="sticky top-16 flex w-full max-w-5xl flex-col items-center gap-6 md:gap-8"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <HeroAvatar3D />
        </motion.div>

        <div>
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-slate-200 mb-2"
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
            transition={{ delay: 0.4, type: 'spring' }}
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
        </div>

        <motion.p
          className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {PORTFOLIO_CONTENT.hero.tagline}
        </motion.p>

        {/* Background Glow for Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="h-6 w-px bg-white/20" />
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="h-2 w-2 rotate-45 border-b border-r border-white/60" />
          <div className="h-2 w-2 rotate-45 border-b border-r border-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
