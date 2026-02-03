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
        className="pointer-events-auto flex items-center gap-4 rounded-full px-6 py-2.5 font-display text-sm tracking-[0.08em]"
        style={{
          background: 'rgba(6, 8, 12, 0.55)',
          backdropFilter: 'blur(22px) saturate(170%)',
          WebkitBackdropFilter: 'blur(22px) saturate(170%)',
          boxShadow: '0 20px 40px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mr-1">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]"
            style={{ backgroundColor: themeColor, color: themeColor }}
          />
          <span className="text-sm font-semibold tracking-[0.08em] text-white flex items-center gap-1">
            Rijan
            <span style={{ color: themeColor }}>•</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 mx-2 overflow-x-auto max-w-[220px] md:max-w-none no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium text-slate-300 hover:text-white transition-colors group whitespace-nowrap"
            >
              {/* Hover Pill */}
              <span className="absolute inset-0 rounded-full bg-white/10 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-6 bg-white/10 mx-2 hidden md:block" />

        {/* CTA Button */}
        <Link
          href="#contact"
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs md:text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
        >
          Contact
        </Link>
      </div>
    </motion.nav>
  );
}
