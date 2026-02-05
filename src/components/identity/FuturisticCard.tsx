'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '@/utils/themes'; // Assuming utility exists or I'll implement inline helper

interface FuturisticCardProps {
  children: React.ReactNode;
  className?: string;
  themeColor?: string; // Hex color
  title?: string; // Optional "System Name" for the card header
  isDark?: boolean;
}

export default function FuturisticCard({
  children,
  className = '',
  themeColor = '#00f0ff',
  title,
  isDark = true,
}: FuturisticCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`group relative overflow-hidden backdrop-blur-xl transition-all duration-500 ${
        isDark ? 'bg-black/40 border border-white/5' : 'bg-white/80 border border-black/5'
      } ${className}`}
      style={{
        boxShadow: `0 0 20px -10px ${themeColor}20`, // Subtle glow
      }}
    >
      {/* Corner Brackets */}
      <div
        className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 transition-colors duration-300"
        style={{ borderColor: themeColor }}
      />
      <div
        className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 transition-colors duration-300"
        style={{ borderColor: themeColor }}
      />
      <div
        className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 transition-colors duration-300"
        style={{ borderColor: themeColor }}
      />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 transition-colors duration-300"
        style={{ borderColor: themeColor }}
      />

      {/* Scanline Background */}
      <div
        className={`absolute inset-0 pointer-events-none ${isDark ? 'opacity-[0.03]' : 'opacity-[0.015]'}`}
        style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, ${themeColor} 25%, ${themeColor} 26%, transparent 27%, transparent 74%, ${themeColor} 75%, ${themeColor} 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, ${themeColor} 25%, ${themeColor} 26%, transparent 27%, transparent 74%, ${themeColor} 75%, ${themeColor} 76%, transparent 77%, transparent)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Hover Glow Gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${themeColor}, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {title && (
          <div
            className={`mb-4 flex items-center gap-2 pb-2 ${
              isDark ? 'border-b border-white/10' : 'border-b border-black/10'
            }`}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: themeColor }}
            />
            <span
              className={`text-[10px] uppercase tracking-[0.2em] font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {title}
            </span>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}
