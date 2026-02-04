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
  return (
    <div className="relative w-full overflow-hidden py-6 bg-white/[0.02] backdrop-blur-sm border-y border-white/5">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/50 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/50 to-transparent z-10" />

      <motion.div
        className="flex gap-20 min-w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {[...ICONS, ...ICONS].map((item, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-default">
            <item.icon className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-all duration-500 group-hover:scale-110" />
            <span className="text-lg md:text-xl font-bold tracking-tight text-slate-500 group-hover:text-white transition-colors duration-300">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
