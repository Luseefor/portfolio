'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Atom,
  Database,
  FileCode,
  Globe,
  Cpu,
  Code2,
  Terminal,
  Layers,
  Cloud,
  Boxes,
  ShieldCheck,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

const ICONS = [
  { icon: Terminal, label: 'CLI / Bash' },
  { icon: Layers, label: 'Full Stack' },
  { icon: Atom, label: 'React' },
  { icon: Globe, label: 'Next.js' },
  { icon: FileCode, label: 'TypeScript' },
  { icon: Database, label: 'PostgreSQL' },
  { icon: Cloud, label: 'Cloud' },
  { icon: Boxes, label: 'DevOps' },
  { icon: Cpu, label: 'System Design' },
  { icon: ShieldCheck, label: 'Security' },
  { icon: Bot, label: 'AI Systems' },
  { icon: Sparkles, label: 'UX Motion' },
  { icon: Code2, label: 'Algorithms' },
];

export default function TechMarquee() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const glowSoft = hexToRgba(themeColor, 0.25);

  return (
    <div
      className={`relative w-full overflow-hidden py-6 backdrop-blur-sm border-y ${
        isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/10'
      }`}
      style={
        {
          '--theme-color': themeColor,
          '--theme-glow': glowSoft,
        } as React.CSSProperties
      }
    >
      <div
        className={`absolute inset-y-0 left-0 w-32 z-10 ${
          isDark ? 'bg-gradient-to-r from-black/50 to-transparent' : 'bg-gradient-to-r from-white/80 to-transparent'
        }`}
      />
      <div
        className={`absolute inset-y-0 right-0 w-32 z-10 ${
          isDark ? 'bg-gradient-to-l from-black/50 to-transparent' : 'bg-gradient-to-l from-white/80 to-transparent'
        }`}
      />

      <motion.div
        className="flex gap-20 min-w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {[...ICONS, ...ICONS].map((item, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-default">
            <item.icon
              className={`w-6 h-6 transition-all duration-500 group-hover:scale-110 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              } group-hover:text-[var(--theme-color)]`}
            />
            <span
              className={`text-lg md:text-xl font-bold tracking-tight transition-colors duration-300 group-hover:drop-shadow-[0_0_12px_var(--theme-glow)] ${
                isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
