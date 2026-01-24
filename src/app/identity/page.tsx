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
const ExperienceSection = dynamic(() => import('@/components/ExperienceSection'), { ssr: false });
const ProjectsSection = dynamic(() => import('@/components/ProjectsSection'), { ssr: false });
const ContactSection = dynamic(() => import('@/components/ContactSection'), { ssr: false });
const ThemeBackground = dynamic(() => import('@/components/ThemeBackground'), { ssr: false });
const IdentityHero = dynamic(() => import('@/components/IdentityHero'), { ssr: false });

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

const NavBar = () => (
    <nav className="fixed top-0 inset-x-0 z-50 flex justify-center py-6 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-8 px-8 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <span className="font-bold text-white text-xl tracking-tight">Rijan<span className="text-cyan-400">.</span></span>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                <Link href="#about" className="hover:text-white transition-colors">About</Link>
                <Link href="#projects" className="hover:text-white transition-colors">Projects</Link>
                <Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
                <Link href="#work" className="hover:text-white transition-colors">Work</Link>
            </div>
            <GlassyButton className="!px-5 !py-2 !text-xs font-bold">
                Contact
            </GlassyButton>
        </div>
    </nav>
);

export default function IdentityPage() {
    const { currentTheme, isDark } = useStore();
    const themeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    return (
        <div className={`min-h-screen font-sans pb-32 transition-colors duration-1000 ${isDark ? 'text-white selection:bg-cyan-500/30' : 'text-slate-900 selection:bg-cyan-500/30'}`}>
            <ThemeBackground themeColor={themeColor} isDark={isDark} />

            <div className="relative z-10">
                <NavBar />

                {/* Spacer for Nav */}
                <div className="h-24" />

                <IdentityHero />

                {/* Header / Marquee Section */}
                <div className="mb-24 space-y-12">
                    <TechMarquee />
                </div>

                <main className="max-w-7xl mx-auto px-6 lg:px-12">



                    {/* BENTO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

                        {/* 1. Main Profile Card (Large Left) */}
                        <BentoCard className="md:col-span-7 md:row-span-2 relative min-h-[500px] group">
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="/cyberpunk-avatar.png"
                                    alt="Cyberpunk Avatar"
                                    fill
                                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-transparent to-transparent opacity-90" />
                            </div>

                            <div className="absolute bottom-0 left-0 p-10 z-10 max-w-lg">
                                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                                    I build software that <span className="text-cyan-400">drives revenue</span>.
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Combining engineering precision with artistic flair to create digital experiences that perform.
                                </p>
                            </div>
                        </BentoCard>

                        {/* 2. Expertise / Code Card (Right Top) */}
                        <BentoCard className="md:col-span-5 md:row-span-1 bg-[#050714]">
                            <div className="p-8 h-full flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-20">
                                    <CodeTyper />
                                </div>
                                <div className="relative z-10 mt-auto">
                                    <h3 className="text-2xl font-bold mb-2">My expertise include</h3>
                                    <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                        Software, AI, ML & Data
                                    </h4>
                                </div>
                            </div>
                        </BentoCard>

                        {/* 3. Socials / Contact (Right Bottom) */}
                        <BentoCard className="md:col-span-5 md:row-span-1 bg-gradient-to-br from-[#0F1221] to-[#050714]">
                            <div className="p-8 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <p className="text-slate-400 text-sm font-mono max-w-[200px]">
                                        Creating products with optimized performance and premium aesthetics.
                                    </p>
                                    <div className="relative w-24 h-24 -mt-4 -mr-4 animate-spin-slow">
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            <path
                                                id="curve"
                                                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                                                fill="transparent"
                                            />
                                            <text className="text-[11px] font-bold uppercase tracking-widest fill-white">
                                                <textPath href="#curve">
                                                    * Contact Me * Contact Me * Contact Me
                                                </textPath>
                                            </text>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                <ArrowUpRight size={16} className="text-black" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                        <Github size={20} />
                                    </button>
                                    <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                        <Linkedin size={20} />
                                    </button>
                                    <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                        <Twitter size={20} />
                                    </button>
                                    <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                        </BentoCard>

                    </div>

                    {/* VISUAL SPACER */}
                    <div className="h-32" />

                    {/* EXPERIENCE SECTION (3D) */}
                    <ExperienceSection />

                    {/* PROJECTS SECTION */}
                    <ProjectsSection />

                    {/* CONTACT SECTION */}
                    <ContactSection />

                </main>
            </div>
        </div>
    );
}
