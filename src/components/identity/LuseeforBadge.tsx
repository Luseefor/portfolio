'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { useStore } from '@/utils/store';

export default function LuseeforBadge({ className = '' }: { className?: string }) {
  const setChatOpen = useStore((state) => state.setChatOpen);

  return (
    <motion.button
      onClick={() => setChatOpen(true)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`group outline-none ${className}`}
    >
      <div className="flex items-center gap-3 bg-[#050505]/90 border border-white/10 shadow-2xl backdrop-blur-xl p-3 pr-4 rounded-xl hover:border-emerald-500/30 transition-colors">
        {/* Icon Box */}
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-white/10 group-hover:border-emerald-500/50 transition-colors shrink-0">
          <Terminal size={18} className="text-emerald-500" />
        </div>

        {/* Text Content */}
        <div className="hidden md:flex flex-col items-start whitespace-nowrap">
          <span className="text-white font-black tracking-[0.2em] text-xs leading-none mb-1">
            L U S E E F O R
          </span>
          <span className="text-emerald-500 font-mono text-[9px] uppercase tracking-widest leading-none">
            PUBLIC_INTERFACE
          </span>
        </div>
      </div>
    </motion.button>
  );
}
