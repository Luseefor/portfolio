'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { GlassCardFooter } from './glass-card/GlassCardFooter';
import { GlassCardHeader } from './glass-card/GlassCardHeader';
import { Magnetic } from './glass-card/Magnetic';
import { useCardTilt } from './glass-card/useCardTilt';

export { Magnetic };

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

const cardVariants = (delay: number, rotateX: number, rotateY: number): Variants => ({
  initial: { opacity: 0, y: 20, rotateX: 0, rotateY: 0 },
  enter: {
    opacity: 1,
    y: 0,
    rotateX,
    rotateY,
    transition: {
      opacity: { delay, duration: 0.8 },
      rotateX: { type: 'spring', stiffness: 100, damping: 30 },
      rotateY: { type: 'spring', stiffness: 100, damping: 30 },
    },
  },
});

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
  const { rotate, isActiveState, onMouseMove, onMouseLeave, onMouseEnter } = useCardTilt(active);

  return (
    <Link href={href} className="group relative block h-full">
      <motion.div
        variants={cardVariants(delay, rotate.x, rotate.y)}
        initial="initial"
        animate="enter"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        style={{ perspective: 1000 }}
        className={`relative h-full overflow-hidden rounded-[1.5rem] border p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 md:rounded-[2rem] md:p-8 md:backdrop-blur-[60px] ${
          isDark
            ? 'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent hover:from-white/[0.12]'
            : 'border-black/[0.05] bg-gradient-to-br from-white/80 to-white/20 hover:from-white/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)]'
        }`}
      >
        <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: themeColor }} />

        <div className="relative z-10 flex h-full flex-col text-left">
          <GlassCardHeader badge={badge} Icon={Icon} isActiveState={isActiveState} isDark={isDark} themeColor={themeColor} />
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
          <GlassCardFooter
            isActiveState={isActiveState}
            isDark={isDark}
            themeColor={themeColor}
            easter={easter}
            active={active}
          />
        </div>
      </motion.div>
    </Link>
  );
};
