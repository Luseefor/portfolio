'use client';

import React from 'react';
import { motion } from 'framer-motion';
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

  return (
    <section className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center text-center px-6 z-10">
      <div className="flex flex-col items-center gap-6 md:gap-8 -mt-12">
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
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center p-1.5">
          <motion.div
            className="w-1 h-1 bg-white rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
