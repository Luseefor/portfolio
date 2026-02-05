'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const TechMarquee = dynamic(() => import('@/components/identity/TechMarquee'), { ssr: false });
const CapabilityMatrix = dynamic(() => import('@/components/identity/CapabilityMatrix'), {
  ssr: false,
});
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
        <Link
          href="/"
          className={`fixed left-6 top-6 z-[60] inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-md transition ${
            isDark
              ? 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
              : 'border-black/10 bg-white/80 text-slate-700 hover:border-black/30 hover:text-slate-900'
          }`}
        >
          <ArrowLeft size={12} />
          Back
        </Link>

        <FuturisticNavbar />

        <IdentityHero />

        <div className="mb-24">
          <TechMarquee />
        </div>

        <main className="max-w-7xl mx-auto px-6 lg:px-12">
          <CapabilityMatrix />

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
