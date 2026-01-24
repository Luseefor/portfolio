'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface GlassyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export default function GlassyButton({ children, className = "", ...props }: GlassyButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                relative px-6 py-3 rounded-full 
                bg-white/10 backdrop-blur-xl 
                border-t border-l border-white/20 
                border-b border-r border-black/20
                shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2),0_8px_20px_rgba(0,0,0,0.2)]
                text-white font-medium text-sm tracking-wide
                hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
                transition-colors duration-300
                overflow-hidden
                ${className}
            `}
            {...props}
        >
            {/* Shine effect */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50" />
            {children}
        </motion.button>
    );
}
