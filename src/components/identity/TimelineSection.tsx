'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';
import dynamic from 'next/dynamic';

const FuturisticCard = dynamic(() => import('./FuturisticCard'), { ssr: false });

export default function TimelineSection() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );

  return (
    <section id="timeline" className="relative py-32 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-block mb-4"
        >
          <span
            className="py-1 px-3 border border-white/10 rounded-none text-xs font-mono uppercase tracking-widest text-slate-400"
            style={{ borderColor: `${themeColor}40`, color: themeColor }}
          >
            Chronology // EXP_LOG
          </span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
          Experience
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
                className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-4 h-4 bg-black border-2 rotate-45 z-10"
                style={{ borderColor: themeColor, boxShadow: `0 0 15px ${themeColor}` }}
              >
                <div className="absolute inset-0 bg-white animate-pulse opacity-20" />
              </div>

              {/* Content */}
              <div className="ml-12 md:ml-0 md:w-1/2 pt-1">
                <FuturisticCard
                  themeColor={themeColor}
                  className={`p-6 ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
                >
                  <span
                    className="font-mono text-sm tracking-wider opacity-80 mb-2 block"
                    style={{ color: themeColor }}
                  >
                    {item.period}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-1">{item.company}</h3>
                  <h4 className="text-lg text-slate-300 mb-4">{item.role}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
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
