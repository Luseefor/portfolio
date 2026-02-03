'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';

export const Magnetic = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

interface GlassCardProps {
  delay?: number;
  href?: string;
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  active?: boolean;
  easter?: string;
  themeColor: string;
  isDark: boolean;
}

export const GlassCard = ({
  delay = 0,
  href = '#',
  title,
  description,
  badge,
  icon: Icon,
  active = false,
  easter,
  themeColor,
  isDark,
}: GlassCardProps) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const isActiveState = active || isHovered;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <Link href={href} className="group relative block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: rotate.x,
          rotateY: rotate.y,
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        transition={{
          opacity: { delay, duration: 0.8 },
          rotateX: { type: 'spring', stiffness: 100, damping: 30 },
          rotateY: { type: 'spring', stiffness: 100, damping: 30 },
        }}
        style={{ perspective: 1000 }}
        className={`relative h-full overflow-hidden rounded-[1.5rem] border p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 md:rounded-[2rem] md:p-8 md:backdrop-blur-[60px] ${
          isDark
            ? 'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent hover:from-white/[0.12]'
            : 'border-black/[0.05] bg-gradient-to-br from-white/80 to-white/20 hover:from-white/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)]'
        }`}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative z-10 flex h-full flex-col text-left">
          <div className="mb-4 flex justify-between items-start md:mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[8px] font-black tracking-[0.2em] uppercase transition-colors md:px-4 md:text-[10px] font-terminal"
              style={{
                borderColor: isActiveState
                  ? `${themeColor}40`
                  : isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)',
                backgroundColor: isActiveState
                  ? `${themeColor}10`
                  : isDark
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(0,0,0,0.02)',
                color: isActiveState
                  ? themeColor
                  : isDark
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.2)',
              }}
            >
              {badge}
            </span>
            <div
              className="transition-all duration-500"
              style={{
                color: isActiveState
                  ? themeColor
                  : isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
              }}
            >
              <Icon size={32} strokeWidth={1.5} className="md:w-12 md:h-12" />
            </div>
          </div>

          <h3
            className={`mb-2 text-2xl font-black tracking-tight transition-colors duration-500 md:mb-4 md:text-3xl lg:text-4xl font-display ${isActiveState ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-white/20' : 'text-slate-900/20'}`}
          >
            {title}
          </h3>
          <p
            className={`mb-6 text-xs leading-relaxed font-display transition-colors duration-500 md:mb-8 md:text-sm ${isActiveState ? (isDark ? 'text-white/40' : 'text-slate-600') : isDark ? 'text-white/10' : 'text-slate-900/10'}`}
          >
            {description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <Magnetic>
              <div
                className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 md:gap-3 md:text-xs md:tracking-[0.3em] font-terminal"
                style={{
                  color: isActiveState
                    ? themeColor
                    : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.1)',
                }}
              >
                <span>{isActiveState ? 'Initialize' : 'Offline'}</span>
                {isActiveState && (
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-2 md:w-4 md:h-4"
                  />
                )}
              </div>
            </Magnetic>
            {easter && (
              <span
                className={`text-[9px] uppercase tracking-[0.35em] font-terminal transition-opacity duration-500 ${
                  isActiveState ? 'opacity-60' : 'opacity-0'
                }`}
                style={{ color: isActiveState ? `${themeColor}aa` : 'transparent' }}
              >
                {easter}
              </span>
            )}
            {active && (
              <div
                className={`h-0.5 w-8 overflow-hidden rounded-full md:h-1 md:w-12 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}
              >
                <motion.div
                  animate={{ x: [-48, 48] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="h-full w-full"
                  style={{ backgroundColor: `${themeColor}60` }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
