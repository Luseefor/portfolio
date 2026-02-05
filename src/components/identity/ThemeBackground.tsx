'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const FloatingParticles = dynamic(() => import('@/components/shared/FloatingParticles'), {
  ssr: false,
});
const LetterGlitch = dynamic(() => import('@/components/shared/LetterGlitch'), { ssr: false });

interface ThemeBackgroundProps {
  themeColor: string;
  isDark: boolean;
}

export default function ThemeBackground({ themeColor, isDark }: ThemeBackgroundProps) {
  return (
    <div
      className={`fixed inset-0 z-0 overflow-hidden transition-colors duration-1000 ${
        isDark ? 'bg-[#020202]' : 'bg-[#f4f6f8]'
      }`}
    >
      {/* Breathing Blob */}
      <motion.div
        animate={{ opacity: isDark ? [0.03, 0.08, 0.03] : [0.02, 0.05, 0.02] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] md:h-[800px] md:w-[800px] md:blur-[150px]"
        style={{ backgroundColor: themeColor, willChange: 'opacity, transform' }}
      />

      <FloatingParticles
        particleColor={themeColor}
        particleCount={30}
        movementSpeed={0.3}
        mouseInfluence={200}
        mouseGravity="attract"
        gravityStrength={80}
      />

      <LetterGlitch
        glitchColors={[themeColor, `${themeColor}aa`, `${themeColor}55`]}
        opacity={isDark ? 0.05 : 0.04}
        outerVignette={false}
      />

      {/* Grid Overlay */}
      <div
        className={`absolute inset-0 ${isDark ? 'opacity-[0.03] md:opacity-[0.05]' : 'opacity-[0.015] md:opacity-[0.025]'}`}
        style={{
          backgroundImage: `linear-gradient(${themeColor} 1px, transparent 1px), linear-gradient(90deg, ${themeColor} 1px, transparent 1px)`,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Vignette / Radial Gradient */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-100' : 'opacity-40'}`}
        style={{
          background: `radial-gradient(circle at center, transparent 35%, ${
            isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.7)'
          } 100%)`,
        }}
      />
    </div>
  );
}
