'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

export default function FloatingAIBlob() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const setChatOpen = useStore((state) => state.setChatOpen);

  return (
    <div className="fixed bottom-8 right-8 z-[1100]">
      <motion.button
        type="button"
        aria-label="Open Luseefor AI System"
        onClick={() => setChatOpen(true)}
        className="relative h-16 w-16 md:h-20 md:w-20 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden"
        style={{
          boxShadow: `0 0 30px ${themeColor}40, 0 0 60px ${themeColor}25`,
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span
          className="absolute inset-0"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle at 30% 20%, ${themeColor}55, transparent 55%)`,
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 70% 70%, ${themeColor}40, transparent 55%)`,
          }}
        />
        <img
          src="/2d.png"
          alt="Luseefor AI"
          className="relative z-10 h-full w-full rounded-full object-cover"
        />
      </motion.button>
    </div>
  );
}
