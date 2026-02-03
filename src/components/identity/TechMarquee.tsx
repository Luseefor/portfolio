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
    <div className="relative w-full overflow-hidden py-4 bg-[#020410] border-y border-white/5">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020410] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020410] to-transparent z-10" />

      <motion.div
        className="flex gap-16 min-w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
      >
        {[...ICONS, ...ICONS].map((item, i) => (
          <div key={i} className="flex items-center gap-3 group cursor-default">
            <item.icon className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors duration-300" />
            <span className="text-base font-semibold text-slate-500 group-hover:text-white transition-colors duration-300">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
