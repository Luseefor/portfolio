'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

export default function LuseeforBadge({ className = '' }: { className?: string }) {
  const setChatOpen = useStore((state) => state.setChatOpen);
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const borderHover = hexToRgba(themeColor, 0.3);
  const borderHoverStrong = hexToRgba(themeColor, 0.5);

  return (
    <motion.button
      onClick={() => setChatOpen(true)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`group outline-none ${className}`}
      style={
        {
          '--theme-color': themeColor,
          '--theme-border': borderHover,
          '--theme-border-strong': borderHoverStrong,
        } as React.CSSProperties
      }
    >
      <div
        className={`flex items-center gap-3 shadow-2xl backdrop-blur-xl p-3 pr-4 rounded-xl transition-colors ${
          isDark
            ? 'bg-[#050505]/90 border border-white/10 hover:border-[var(--theme-border)]'
            : 'bg-white/90 border border-black/10 hover:border-[var(--theme-border)]'
        }`}
      >
        {/* Icon Box */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors shrink-0 ${
            isDark
              ? 'bg-[#0a0a0a] border border-white/10 group-hover:border-[var(--theme-border-strong)]'
              : 'bg-white border border-black/10 group-hover:border-[var(--theme-border-strong)]'
          }`}
        >
          <Terminal size={18} style={{ color: themeColor }} />
        </div>

        {/* Text Content */}
        <div className="hidden md:flex flex-col items-start whitespace-nowrap">
          <span className={`font-black tracking-[0.2em] text-xs leading-none mb-1 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            L U S E E F O R
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-widest leading-none"
            style={{ color: themeColor }}
          >
            PUBLIC_INTERFACE
          </span>
        </div>
      </div>
    </motion.button>
  );
}
