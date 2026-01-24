'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LiquidGlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function LiquidGlassCard({ children, className = "", onClick }: LiquidGlassCardProps) {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
                group relative overflow-hidden rounded-[2rem]
                bg-white/5 backdrop-blur-2xl
                border border-white/10
                shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
                hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(255,107,0,0.1)]
                transition-all duration-500
                ${className}
            `}
        >
            {/* Liquid Shine Effect */}
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
}
