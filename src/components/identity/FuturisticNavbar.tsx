'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';
import ThemeDropdown from '@/components/home/ThemeDropdown';

export default function FuturisticNavbar() {
  const { currentTheme, isDark, setCurrentTheme, setIsDark } = useStore();
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
          background: isDark ? 'rgba(6, 8, 12, 0.65)' : 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow: isDark
            ? '0 24px 48px -12px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 24px 48px -12px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,0.7)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.08)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-4 mr-1 md:mr-2">
          <ThemeDropdown
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            isDark={isDark}
            toggleDark={() => setIsDark(!isDark)}
            themeColor={themeColor}
            renderTrigger={({ themeColor }) => (
              <span
                className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-[0_0_15px_currentColor]"
                style={{ backgroundColor: themeColor, color: themeColor }}
              />
            )}
            triggerClassName="flex items-center justify-center rounded-full p-1"
          />
          <span
            className={`text-sm md:text-lg font-bold tracking-[0.08em] flex items-center gap-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
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
              className={`relative rounded-full px-3 md:px-6 py-1.5 md:py-2 text-xs md:text-base font-medium transition-colors group whitespace-nowrap ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {/* Hover Pill */}
              <span
                className={`absolute inset-0 rounded-full scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ${
                  isDark ? 'bg-white/10' : 'bg-black/5'
                }`}
              />
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Separator */}
        <div
          className={`w-[1px] h-6 md:h-8 mx-1 md:mx-3 hidden sm:block ${
            isDark ? 'bg-white/10' : 'bg-black/10'
          }`}
        />

        {/* CTA Button */}
        <Link
          href="#contact"
          className={`rounded-full border px-4 md:px-7 py-2 md:py-2.5 text-xs md:text-base font-bold transition shadow-lg ${
            isDark
              ? 'border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10'
              : 'border-black/10 bg-black/5 text-slate-900 hover:border-black/20 hover:bg-black/10'
          }`}
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
