'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';
import dynamic from 'next/dynamic';

const FuturisticCard = dynamic(() => import('./FuturisticCard'), { ssr: false });

export default function TimelineSection() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const themeFade = hexToRgba(themeColor, isDark ? 0.35 : 0.7);

  return (
    <section id="timeline" className="relative py-32 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="h-[2px] w-12" style={{ backgroundColor: themeColor }} />
          <span className="text-[11px] font-mono uppercase tracking-[0.45em] text-slate-500">
            Chronology // EXP_LOG
          </span>
        </motion.div>
        <h2
          className={`font-black tracking-tighter leading-[0.95] ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
          style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.75rem)' }}
        >
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: `linear-gradient(90deg, ${themeColor}, ${themeFade})` }}
          >
            Experience
          </span>
        </h2>
      </div>

      <div className="relative">
        {/* Central Laser Spine */}
        <div
          className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2"
          style={{
            background: `linear-gradient(to bottom, transparent, ${themeColor}40 10%, ${themeColor}40 90%, transparent)`,
          }}
        />

        <div className="space-y-16">
          {PORTFOLIO_CONTENT.experience.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col md:flex-row gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Node Point */}
              <div
                className={`absolute left-[20px] md:left-1/2 -translate-x-1/2 w-4 h-4 border-2 rotate-45 z-10 ${
                  isDark ? 'bg-black' : 'bg-white'
                }`}
                style={{ borderColor: themeColor, boxShadow: `0 0 15px ${themeColor}` }}
              >
                <div
                  className={`absolute inset-0 animate-pulse opacity-20 ${
                    isDark ? 'bg-white' : 'bg-black'
                  }`}
                />
              </div>

              {/* Content */}
              <div className="ml-12 md:ml-0 md:w-1/2 pt-1">
                <FuturisticCard
                  themeColor={themeColor}
                  isDark={isDark}
                  className={`p-6 ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
                >
                  <span
                    className="font-mono text-sm tracking-wider opacity-80 mb-2 block"
                    style={{ color: themeColor }}
                  >
                    {item.period}
                  </span>
                  <h3 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.company}
                  </h3>
                  <h4 className={`text-xl mb-6 font-medium tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {item.role}
                  </h4>
                  <p className={`text-base leading-relaxed font-light ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                    {item.description}
                  </p>
                </FuturisticCard>
              </div>

              {/* Empty spacer for alternating layout */}
              <div className="hidden md:block md:w-1/2" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
