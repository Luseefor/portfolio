'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

interface LiquidGlassButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
    icon?: React.ReactNode;
}

export default function LiquidGlassButton({
    children,
    onClick,
    className = "",
    type = "button",
    icon
}: LiquidGlassButtonProps) {
    const { currentTheme, isDark } = useStore();
    const themeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    return (
        <motion.button
            type={type}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                relative overflow-hidden rounded-full px-8 py-3.5
                font-medium text-sm tracking-wide text-white
                transition-all duration-300
                group
                ${className}
            `}
            style={{
                // Base Glass Style
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: `
                    0 4px 24px -1px rgba(0, 0, 0, 0.2),
                    0 0 0 1px rgba(255, 255, 255, 0.1),
                    inset 0 0 12px rgba(255, 255, 255, 0.05),
                    0 0 20px ${themeColor}20
                `
            }}
        >
            {/* Animated Liquid Gradient Background */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                style={{
                    background: `linear-gradient(120deg, transparent 30%, ${themeColor}40 50%, transparent 70%)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite linear'
                }}
            />

            {/* Glossy Top Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />

            {/* Reflection Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20 pointer-events-none" />

            {/* Content Layer */}
            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors text-shadow-sm">
                {icon && <span className="opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>}
                {children}
            </span>

            <style jsx>{`
                @keyframes shimmer {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
                .text-shadow-sm {
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }
            `}</style>
        </motion.button>
    );
}
