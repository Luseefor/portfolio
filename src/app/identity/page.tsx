'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Github, Linkedin, Mail, Twitter, Terminal } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useStore } from '@/utils/store';
import { PORTFOLIO_CONTENT } from '@/components/identity/portfolio-template';
import { getThemeColor } from '@/utils/themes';

const TechMarquee = dynamic(() => import('@/components/identity/TechMarquee'), { ssr: false });
const CodeTyper = dynamic(() => import('@/components/identity/CodeTyper'), { ssr: false });
const ServicesSection = dynamic(() => import('@/components/identity/ServicesSection'), {
  ssr: false,
});
const TimelineSection = dynamic(() => import('@/components/identity/TimelineSection'), {
  ssr: false,
});
const ProjectsSection = dynamic(() => import('@/components/identity/ProjectsSection'), {
  ssr: false,
});
const ContactSection = dynamic(() => import('@/components/identity/ContactSection'), {
  ssr: false,
});
const ThemeBackground = dynamic(() => import('@/components/identity/ThemeBackground'), {
  ssr: false,
});
const IdentityHero = dynamic(() => import('@/components/identity/IdentityHero'), { ssr: false });
const FuturisticNavbar = dynamic(() => import('@/components/identity/FuturisticNavbar'), {
  ssr: false,
});
const TimeLocationCard = dynamic(() => import('@/components/identity/TimeLocationCard'), {
  ssr: false,
});

// --- UTILS ---
const BentoCard = ({
  children,
  className = '',
  themeColor = '#10b981',
  id = '01',
}: {
  children: React.ReactNode;
  className?: string;
  themeColor?: string;
  id?: string;
}) => (
  <div
    className={`group relative overflow-hidden bg-white/[0.03] backdrop-blur-[32px] border border-white/10 transition-all duration-700 shadow-2xl ${className}`}
    style={{
      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
    }}
  >
    {/* Glass Noise Texture */}
    <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
      style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}
    />

    {/* Light Sweep Effect */}
    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out" />
    </div>

    {/* HUD Corner Accents */}
    <div className="absolute top-0 left-0 w-8 h-[1px]" style={{ backgroundColor: themeColor }} />
    <div className="absolute top-0 left-0 w-[1px] h-8" style={{ backgroundColor: themeColor }} />

    {/* ID Badge */}
    <div
      className="absolute top-0 right-0 px-3 py-1 font-terminal text-[8px] tracking-[0.2em] font-bold"
      style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
    >
      MODULE_{id}
    </div>

    {/* Scanline Background */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(0deg, transparent 24%, ${themeColor} 25%, ${themeColor} 26%, transparent 27%, transparent 74%, ${themeColor} 75%, ${themeColor} 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, ${themeColor} 25%, ${themeColor} 26%, transparent 27%, transparent 74%, ${themeColor} 75%, ${themeColor} 76%, transparent 77%, transparent)`,
        backgroundSize: '40px 40px',
      }}
    />

    {/* Specular Highlight (Top Left) */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

    {/* Ambient Glow */}
    <div
      className="absolute -bottom-20 -right-20 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-1000"
      style={{ backgroundColor: themeColor }}
    />

    <div className="relative z-10 h-full">
      {children}
    </div>
  </div>
);

const GlassyButton = dynamic(() => import('@/components/shared/ui/GlassyButton'), { ssr: false });

// LuseeforBadge intentionally unused; landing-style header replaces it.

export default function IdentityPage() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-1000 ${isDark ? 'text-white selection:bg-cyan-500/30' : 'text-slate-900 selection:bg-cyan-500/30'}`}
    >
      <ThemeBackground themeColor={themeColor} isDark={isDark} />

      <div className="relative z-10">
        <FuturisticNavbar />

        <IdentityHero />

        <div className="mb-24">
          <TechMarquee />
        </div>

        <main className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* BENTO GRID */}
          <div
            id="about"
            className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[minmax(180px,auto)] mb-32"
          >
            {/* 1. Main Profile Card */}
            <BentoCard id="ALPHA" themeColor={themeColor} className="col-span-1 md:col-span-8 md:row-span-2 h-[550px]">
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2070&auto=format&fit=crop"
                  alt="Neural Network Interface"
                  fill
                  className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#020410]/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020410] to-transparent" />
              </div>

              <div className="relative z-10 p-10 md:p-14 h-full flex flex-col justify-end">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-8 opacity-60">
                    <span className="w-12 h-[1px] bg-sky-500" />
                    <span className="font-terminal text-[10px] tracking-[0.4em] uppercase text-sky-400">System_Core // active</span>
                  </div>
                  <motion.h2
                    className="font-black text-white mb-8 uppercase tracking-tighter leading-[0.9]"
                    style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    Building <br />
                    high-performance, <br />
                    <span
                      className="text-transparent bg-clip-text"
                      style={{ backgroundImage: `linear-gradient(to right, ${themeColor}, white)` }}
                    >
                      scalable systems.
                    </span>
                  </motion.h2>
                  <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                    Architecting robust digital infrastructure with a focus on reliability, extreme efficiency, and fluid user interaction.
                  </p>
                </div>
              </div>

              {/* HUD Coordinates */}
              <div className="absolute bottom-8 right-12 hidden md:block">
                <div className="font-terminal text-[8px] text-white/20 tracking-[0.2em] space-y-1">
                  <div>LAT_COORD: 31.3271° N</div>
                  <div>LNG_COORD: 89.2903° W</div>
                </div>
              </div>
            </BentoCard>

            {/* 2. Expertise Card */}
            <BentoCard id="OMEGA" themeColor={themeColor} className="md:col-span-4 md:row-span-1 h-[260px]">
              <div className="p-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                    <span className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase">Tech_Stack</span>
                  </div>
                  <h3
                    className="font-bold text-white tracking-tight leading-[1.1]"
                    style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}
                  >
                    Software, <br />
                    <span style={{ color: themeColor }}>AI Systems</span>,<br />
                    Data & ML
                  </h3>
                </div>
                <div className="mt-4 flex gap-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: themeColor }}
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* 3. Location & Time Card */}
            <BentoCard id="SIGMA" themeColor={themeColor} className="md:col-span-4 md:row-span-1 h-[260px]">
              <TimeLocationCard />
            </BentoCard>
          </div>

          {/* SERVICES */}
          <ServicesSection />

          {/* TIMELINE */}
          <TimelineSection />

          {/* PROJECTS SECTION */}
          <ProjectsSection />

          {/* CONTACT SECTION */}
          <ContactSection />
        </main>
      </div>
    </div>
  );
}
