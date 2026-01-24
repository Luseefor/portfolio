'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

export default function FuturisticNavbar() {
    const { currentTheme, isDark } = useStore();
    const themeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    const navItems = [
        { name: 'About', href: '#about' },
        { name: 'Services', href: '#services' },
        { name: 'Timeline', href: '#timeline' },
        { name: 'Projects', href: '#projects' },
        { name: 'Testimonials', href: '#testimonials' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 inset-x-0 z-50 flex justify-center py-6 pointer-events-none"
        >
            <div
                className="pointer-events-auto flex items-center gap-8 px-6 py-3 bg-black/80 backdrop-blur-md border border-white/10 shadow-lg"
                style={{
                    borderBottomColor: themeColor,
                    boxShadow: `0 4px 20px -10px ${themeColor}40`
                }}
            >
                {/* Logo / System ID */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
                    <span className="font-mono text-sm font-bold tracking-widest text-white">
                        RIJAN<span style={{ color: themeColor }}>.SYS</span>
                    </span>
                </div>

                {/* Separator */}
                <div className="h-4 w-[1px] bg-white/20" />

                {/* Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors relative group"
                        >
                            <span className="relative z-10">{item.name}</span>
                            <span
                                className="absolute -bottom-1 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-300"
                                style={{ backgroundColor: themeColor }}
                            />
                        </Link>
                    ))}
                </div>

                {/* CTA Button */}
                <Link href="#contact">
                    <button
                        className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-mono font-bold uppercase tracking-widest text-white"
                        style={{ borderColor: `${themeColor}60` }}
                    >
                        <span style={{ color: themeColor }}>[</span> Contact <span style={{ color: themeColor }}>]</span>
                    </button>
                </Link>
            </div>
        </motion.nav>
    );
}
