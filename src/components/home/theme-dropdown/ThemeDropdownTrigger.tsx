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
      className={`flex min-h-11 items-center gap-3 rounded-full border px-4 py-2 transition-all backdrop-blur-md md:px-5 ${
        isDark
          ? 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/15'
          : 'border-slate-300/70 bg-white/90 text-slate-700 hover:border-slate-400/80'
      }`}
    >
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: themeColor }} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">{currentThemeName}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
        <Palette size={12} />
      </motion.div>
    </button>
  );
}
