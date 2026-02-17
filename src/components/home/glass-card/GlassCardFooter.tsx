'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Magnetic } from './Magnetic';

type GlassCardFooterProps = {
  isActiveState: boolean;
  isDark: boolean;
  themeColor: string;
  easter?: string;
  active: boolean;
};

export function GlassCardFooter({ isActiveState, isDark, themeColor, easter, active }: GlassCardFooterProps) {
  return (
    <div className="mt-auto flex items-center justify-between">
      <Magnetic>
        <div
          className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 md:gap-3 md:text-xs md:tracking-[0.3em] font-terminal"
          style={{
            color: isActiveState ? themeColor : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}
        >
          <span>{isActiveState ? 'Initialize' : 'Offline'}</span>
          {isActiveState && <ArrowRight size={14} className="transition-transform group-hover:translate-x-2 md:w-4 md:h-4" />}
        </div>
      </Magnetic>

      {easter && (
        <span
          className={`text-[9px] uppercase tracking-[0.35em] font-terminal transition-opacity duration-500 ${
            isActiveState ? 'opacity-60' : 'opacity-0'
          }`}
          style={{ color: isActiveState ? `${themeColor}aa` : 'transparent' }}
        >
          {easter}
        </span>
      )}

      {active && (
        <div className={`h-0.5 w-8 overflow-hidden rounded-full md:h-1 md:w-12 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <motion.div
            animate={{ x: [-48, 48] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="h-full w-full"
            style={{ backgroundColor: `${themeColor}60` }}
          />
        </div>
      )}
    </div>
  );
}
