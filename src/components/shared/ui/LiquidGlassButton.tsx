'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export default function LiquidGlassButton({
  children,
  onClick,
  className = '',
  type = 'button',
  icon,
}: LiquidGlassButtonProps) {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
                relative overflow-hidden rounded-full px-8 py-3.5
                font-medium text-sm tracking-wide
                transition-all duration-300
                group
                ${className}
            `}
      style={{
        // Base Glass Style
        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `
                    0 4px 24px -1px rgba(0, 0, 0, 0.2),
                    0 0 0 1px ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)'},
                    inset 0 0 12px ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)'},
                    0 0 20px ${themeColor}20
                `,
      }}
    >
      {/* Animated Liquid Gradient Background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
        style={{
          backgroundImage: `linear-gradient(120deg, transparent 30%, ${themeColor}40 50%, transparent 70%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear',
        }}
      />

      {/* Glossy Top Highlight */}
      <div
        className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent to-transparent ${
          isDark ? 'via-white/40 opacity-50' : 'via-black/10 opacity-70'
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent to-transparent ${
          isDark ? 'via-white/10 opacity-30' : 'via-black/5 opacity-50'
        }`}
      />

      {/* Reflection Gradient */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark ? 'bg-gradient-to-b from-white/10 to-transparent opacity-20' : 'bg-gradient-to-b from-white/60 to-transparent opacity-70'
        }`}
      />

      {/* Content Layer */}
      <span
        className={`relative z-10 flex items-center justify-center gap-2 transition-colors ${
          isDark ? 'text-white group-hover:text-white text-shadow-sm' : 'text-slate-900 group-hover:text-slate-900'
        }`}
      >
        {icon && (
          <span className="opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>
        )}
        {children}
      </span>

      <style jsx>{`
        @keyframes shimmer {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }
        .text-shadow-sm {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </motion.button>
  );
}
