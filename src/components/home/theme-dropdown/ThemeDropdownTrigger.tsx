'use client';

import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import type { ThemeDropdownProps } from './types';

type ThemeDropdownTriggerProps = Pick<
  ThemeDropdownProps,
  'renderTrigger' | 'triggerClassName' | 'isDark'
> & {
  isOpen: boolean;
  themeColor: string;
  currentThemeName: string;
  onToggle: () => void;
};

export function ThemeDropdownTrigger({
  renderTrigger,
  triggerClassName,
  isDark,
  isOpen,
  themeColor,
  currentThemeName,
  onToggle,
}: ThemeDropdownTriggerProps) {
  if (renderTrigger) {
    return (
      <button onClick={onToggle} className={triggerClassName ?? 'flex items-center justify-center rounded-full'} aria-label="Open theme selector">
        {renderTrigger({ isOpen, themeColor, currentThemeName })}
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 rounded-full border px-4 py-2 transition-all backdrop-blur-md md:px-5 ${
        isDark
          ? 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
          : 'border-black/5 bg-black/5 text-slate-900/60 hover:border-black/10'
      }`}
    >
      <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor, boxShadow: `0 0 8px ${themeColor}` }} />
      <span className="text-[10px] font-black uppercase tracking-widest">{currentThemeName}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
        <Palette size={12} />
      </motion.div>
    </button>
  );
}
