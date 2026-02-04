'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

export default function FuturisticNavbar() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );

  const navItems = [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Timeline', href: '#timeline' },
    { name: 'Projects', href: '#projects' },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
    >
      <div
        className="pointer-events-auto flex items-center gap-3 md:gap-6 rounded-[1.5rem] md:rounded-[2rem] px-4 md:px-8 py-2 md:py-3.5 font-display text-sm md:text-base tracking-[0.08em]"
        style={{
          background: 'rgba(6, 8, 12, 0.65)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-4 mr-1 md:mr-2">
          <div
            className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-[0_0_15px_currentColor]"
            style={{ backgroundColor: themeColor, color: themeColor }}
          />
          <span className="text-sm md:text-lg font-bold tracking-[0.08em] text-white flex items-center gap-1">
            Rijan
            <span style={{ color: themeColor }}>•</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 md:gap-2 mx-1 md:mx-3 overflow-x-auto max-w-[140px] sm:max-w-none no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative rounded-full px-3 md:px-6 py-1.5 md:py-2 text-xs md:text-base font-medium text-slate-300 hover:text-white transition-colors group whitespace-nowrap"
            >
              {/* Hover Pill */}
              <span className="absolute inset-0 rounded-full bg-white/10 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-6 md:h-8 bg-white/10 mx-1 md:mx-3 hidden sm:block" />

        {/* CTA Button */}
        <Link
          href="#contact"
          className="rounded-full border border-white/10 bg-white/5 px-4 md:px-7 py-2 md:py-2.5 text-xs md:text-base font-bold text-white/90 transition hover:border-white/20 hover:bg-white/10 shadow-lg"
          style={{
            boxShadow: `0 0 20px ${themeColor}10`
          }}
        >
          Contact
        </Link>
      </div>
    </motion.nav>
  );
}
