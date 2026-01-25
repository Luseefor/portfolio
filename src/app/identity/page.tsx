'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Github, Linkedin, Mail, Twitter } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useStore } from '@/utils/store';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { getThemeColor } from '@/utils/themes';

const TechMarquee = dynamic(() => import('@/components/TechMarquee'), { ssr: false });
const CodeTyper = dynamic(() => import('@/components/CodeTyper'), { ssr: false });
const ServicesSection = dynamic(() => import('@/components/ServicesSection'), { ssr: false });
const TimelineSection = dynamic(() => import('@/components/TimelineSection'), { ssr: false });
const ProjectsSection = dynamic(() => import('@/components/ProjectsSection'), { ssr: false });
const ContactSection = dynamic(() => import('@/components/ContactSection'), { ssr: false });
const ThemeBackground = dynamic(() => import('@/components/ThemeBackground'), { ssr: false });
const IdentityHero = dynamic(() => import('@/components/IdentityHero'), { ssr: false });
const FuturisticNavbar = dynamic(() => import('@/components/FuturisticNavbar'), { ssr: false });

// --- UTILS ---
const BentoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative overflow-hidden rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 group hover:border-white/20 transition-all duration-500 shadow-2xl ${className}`}>
        {/* Liquid Shine Effect */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
        {children}
    </div>
);

const GlassyButton = dynamic(() => import('@/components/ui/GlassyButton'), { ssr: false });

export default function IdentityPage() {
    const { currentTheme, isDark } = useStore();
    const themeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    return (
        <div className={`min-h-screen font-sans pb-32 transition-colors duration-1000 ${isDark ? 'text-white selection:bg-cyan-500/30' : 'text-slate-900 selection:bg-cyan-500/30'}`}>
            <ThemeBackground themeColor={themeColor} isDark={isDark} />

            <div className="relative z-10">
                <FuturisticNavbar />

                {/* Spacer for Nav */}
                <div className="h-24" />

                <IdentityHero />

                {/* Header / Marquee Section */}
                <div className="mb-24 space-y-12">
                    <TechMarquee />
                </div>

                <main className="max-w-7xl mx-auto px-6 lg:px-12">

                    {/* BENTO GRID (Maintained as About) */}
                    {/* BENTO GRID (Maintained as About) */}
                    <div id="about" className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)] mb-32">
                        {/* 1. Main Profile Card (Large Left) */}
                        <BentoCard className="md:col-span-7 md:row-span-2 relative min-h-[500px] group overflow-hidden border border-white/10 bg-[#0a0a0a]">
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="/cyberpunk-avatar.png"
                                    alt="Cyberpunk Avatar"
                                    fill
                                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-80"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#020410]/40 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                            </div>

                            <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10 max-w-xl">
                                <h2 className="text-4xl md:text-6xl font-black leading-[0.9] mb-6 tracking-tighter text-white">
                                    I build software that <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">drives revenue.</span>
                                </h2>
                                <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed border-l-2 border-cyan-500/50 pl-4">
                                    Combining engineering precision with artistic flair to create digital experiences that perform.
                                </p>
                            </div>
                        </BentoCard>

                        {/* 2. Expertise / Code Card (Right Top) */}
                        <BentoCard className="md:col-span-5 md:row-span-1 bg-[#050714] border border-white/10 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="p-8 h-full flex flex-col justify-between relative z-10">
                                <div className="absolute top-0 right-0 p-6 opacity-30 scale-75 origin-top-right mix-blend-screen pointer-events-none">
                                    <CodeTyper />
                                </div>

                                <div className="mt-auto">
                                    <h3 className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-2">Expertise</h3>
                                    <h4 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                        Software, <span className="text-cyan-400">AI</span>, <br />
                                        <span className="text-purple-400">ML</span> & Data
                                    </h4>
                                </div>
                            </div>
                        </BentoCard>

                        {/* 3. Socials / Contact (Right Bottom) */}
                        <BentoCard className="md:col-span-5 md:row-span-1 bg-[#080a12] border border-white/10 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

                            <div className="p-8 h-full flex flex-col justify-between relative z-10">
                                <div className="flex justify-between items-start">
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[220px]">
                                        Creating products fully optimized for performance and premium aesthetics.
                                    </p>

                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        className="relative w-20 h-20 -mt-2 -mr-2 cursor-pointer"
                                    >
                                        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                                            <path
                                                id="curve"
                                                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                                                fill="transparent"
                                            />
                                            <text className="text-[10px] font-bold uppercase tracking-widest fill-white/80">
                                                <textPath href="#curve">
                                                    Get in Touch • Let's Talk • Connect •
                                                </textPath>
                                            </text>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                                                <ArrowUpRight size={18} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    {[Github, Linkedin, Twitter, Mail].map((Icon, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ y: -5 }}
                                            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all shadow-lg"
                                        >
                                            <Icon size={20} />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
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
