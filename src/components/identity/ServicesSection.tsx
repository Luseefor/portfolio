'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Cpu, Server } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

const FuturisticCard = dynamic(() => import('./FuturisticCard'), { ssr: false });

const services = [
  {
    title: 'Product + Platform',
    desc: 'I build full-stack systems that feel fast, stay reliable, and scale without drama.',
    icon: Globe,
    id: 'SYS-01',
  },
  {
    title: 'Data + AI Systems',
    desc: 'RAG, evals, pipelines, and pragmatic ML that ships to production and stays measurable.',
    icon: Cpu,
    id: 'SYS-02',
  },
  {
    title: 'Infrastructure + Reliability',
    desc: 'APIs, observability, performance tuning, and secure architecture that holds up in the wild.',
    icon: Server,
    id: 'SYS-03',
  },
];

export default function ServicesSection() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const themeFade = hexToRgba(themeColor, isDark ? 0.35 : 0.7);

  return (
    <section id="services" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="h-[2px] w-12" style={{ backgroundColor: themeColor }} />
          <span className="text-[11px] font-mono uppercase tracking-[0.45em] text-slate-500">
            ABOUT // FOCUS
          </span>
        </motion.div>
        <h2
          className={`font-black tracking-tighter leading-[0.95] ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
          style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.75rem)' }}
        >
          What I build & <br />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(90deg, ${themeColor}, ${themeFade})`,
            }}
          >
            why it works.
          </span>
        </h2>
        <p className="mt-4 text-slate-300 max-w-2xl text-base md:text-lg leading-relaxed">
          I’m a systems‑minded developer who cares about clarity, speed, and reliability — not hype.
          These are the areas where I do my best work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, i) => (
          <FuturisticCard key={i} themeColor={themeColor} isDark={isDark} className="min-h-[240px]">
            <div
              className={`mb-5 inline-flex p-3 rounded-lg ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              }`}
              style={{ color: themeColor }}
            >
              <service.icon size={32} />
            </div>
            <h3
              className={`text-xl font-semibold mb-3 tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {service.title}
            </h3>
            <p
              className={`text-sm md:text-base leading-relaxed font-light ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {service.desc}
            </p>
          </FuturisticCard>
        ))}
      </div>
    </section>
  );
}
