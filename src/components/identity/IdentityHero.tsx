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
    <section ref={sectionRef} className="relative min-h-[140vh] z-10">
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="sticky top-0 h-screen flex items-center justify-center px-4"
      >
        <div className="relative w-full max-w-4xl flex flex-col items-center text-center gap-6 -translate-y-10 md:-translate-y-12">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="-mt-2"
          >
            <HeroAvatar3D />
          </motion.div>

          <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-black/35 px-6 py-6 md:py-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
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
              className="text-lg md:text-xl text-slate-300/80 font-medium max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              {PORTFOLIO_CONTENT.hero.tagline}
            </motion.p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.linkedin.com"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                <Linkedin size={14} />
                LinkedIn
              </a>
              <a
                href="https://github.com"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                <Github size={14} />
                GitHub
              </a>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-[110px] rounded-full pointer-events-none -z-10" />
        </div>

        <motion.div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <motion.div
            className="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center"
            animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-2 w-2 border-b border-r border-white/60 rotate-45" />
          </motion.div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
