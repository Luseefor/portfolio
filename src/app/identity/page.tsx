'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Github, Twitter, ExternalLink, Code2, Layers, Cpu, Globe, ArrowDown, ArrowRight, Component, Key, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useStore } from '@/utils/store';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { getThemeColor } from '@/utils/themes';

const FloatingParticles = dynamic(() => import('@/components/FloatingParticles'), { ssr: false });
const LetterGlitch = dynamic(() => import('@/components/LetterGlitch'), { ssr: false });

// --- UTILS & STYLES ---

const getGlassStyle = (isDark: boolean) =>
    `backdrop-blur-[20px] border transition-colors duration-700 ${isDark
        ? 'bg-white/[0.03] border-white/[0.08] shadow-[0_4px_24px_-1px_rgba(0,0,0,0.3)]'
        : 'bg-white/70 border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`;

const getTechBorder = (themeColor: string) => ({
    backgroundImage: `linear-gradient(to bottom, ${themeColor}40 0%, transparent 50%, ${themeColor}40 100%)`,
    backgroundSize: '1px 100%',
    backgroundRepeat: 'no-repeat'
});

const SectionWrapper = ({ children, className = "", id = "" }: { children: React.ReactNode, className?: string, id?: string }) => (
    <section id={id} className={`relative w-full min-h-screen py-20 px-6 md:px-12 lg:px-24 flex flex-col justify-center ${className}`}>
        <div className="max-w-[1600px] w-full mx-auto relative z-10">
            {children}
        </div>
    </section>
);

const NumberTicker = ({ value, className = "" }: { value: string | number, className?: string }) => (
    <span className={`font-mono tabular-nums tracking-tighter ${className}`}>
        {value}
    </span>
);

// --- COMPONENTS ---

const Background = ({ themeColor, isDark }: { themeColor: string, isDark: boolean }) => (
    <div className={`fixed inset-0 z-0 overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#050505]' : 'bg-[#FAFAFA]'}`}>
        {/* Cinematic Ambient Glow */}
        <motion.div
            animate={{ opacity: isDark ? [0.05, 0.1, 0.05] : [0.03, 0.08, 0.03] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full blur-[150px] opacity-10 pointer-events-none"
            style={{ backgroundColor: themeColor }}
        />
        <motion.div
            animate={{ opacity: isDark ? [0.05, 0.1, 0.05] : [0.03, 0.08, 0.03] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full blur-[120px] opacity-10 pointer-events-none"
            style={{ backgroundColor: themeColor }}
        />

        <FloatingParticles
            particleColor={themeColor}
            particleCount={40}
            movementSpeed={0.2}
            mouseInfluence={300}
            mouseGravity="attract"
            gravityStrength={50}
        />

        {/* Technical Grid Overlay */}
        <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
                backgroundImage: `linear-gradient(${isDark ? '#FFF' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#FFF' : '#000'} 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }}
        />

        {/* Vignette */}
        <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${isDark ? 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]' : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]'}`} />
    </div>
);

const SectionTitle = ({ number, title, subtitle, isDark, themeColor }: { number: string, title: string, subtitle?: string, isDark: boolean, themeColor: string }) => (
    <div className="flex flex-col gap-6 mb-20 md:mb-32">
        <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold" style={{ color: themeColor }}>{number}</span>
            <div className={`h-[1px] w-24 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
            <span className={`font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded border ${isDark ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'}`}>
                {subtitle || "Section_Idx"}
            </span>
        </div>
        <h2 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] uppercase leading-[0.9] transition-colors duration-1000 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title.split(" ").map((word, i) => (
                <span key={i} className="block">{word}</span>
            ))}
        </h2>
    </div>
);

// --- SECTIONS ---

const Hero = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper className="!h-screen py-0">
        <div className="h-full flex flex-col justify-center">
            {/* Top Meta */}
            <div className="absolute top-24 md:top-32 left-0 right-0 px-6 md:px-12 lg:px-24 flex justify-between items-start pointer-events-none">
                <div className="hidden md:flex flex-col gap-2">
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-black/30'}`}>Coordinates</span>
                    <span className={`text-xs font-mono font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>34.0522° N, 118.2437° W</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-black/30'}`}>Status</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
                        <span className={`text-xs font-bold uppercase tracking-wider tabular-nums ${isDark ? 'text-white' : 'text-black'}`} style={{ color: themeColor }}>
                            {PORTFOLIO_CONTENT.hero.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                <div className="lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h1 className={`text-[12vw] leading-[0.85] font-black tracking-[-0.05em] uppercase mix-blend-difference opacity-90 transition-colors duration-1000 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Rijan<br />Ghimire
                        </h1>
                    </motion.div>
                </div>
                <div className="lg:col-span-4 lg:mb-4 lg:pl-12">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                    >
                        <p className={`text-sm md:text-base font-medium leading-relaxed max-w-sm ml-auto lg:ml-0 transition-colors duration-1000 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                            {PORTFOLIO_CONTENT.hero.tagline}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {PORTFOLIO_CONTENT.stack.technologies.slice(0, 3).map((tech, i) => (
                                <span key={i} className={`text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full border ${isDark ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'}`}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Scroll Indicator */}
            <motion.div
                className="absolute bottom-12 right-6 md:right-12 lg:right-24 flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
            >
                <span className={`text-[9px] font-mono uppercase tracking-[0.2em] ${isDark ? 'text-white/30' : 'text-black/30'}`}>Scroll to explore</span>
                <div className={`h-12 w-[1px] relative overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                    <motion.div
                        animate={{ top: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-full h-full bg-current absolute left-0 top-0"
                        style={{ color: themeColor }}
                    />
                </div>
            </motion.div>
        </div>
    </SectionWrapper>
);

const About = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper>
        <SectionTitle number="01" subtitle="Architect_Bio" title="The_Operator" isDark={isDark} themeColor={themeColor} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
            <div>
                <p className={`text-2xl md:text-3xl lg:text-4xl leading-tight font-medium transition-colors duration-1000 ${isDark ? 'text-white/80' : 'text-slate-900'}`}>
                    {PORTFOLIO_CONTENT.about.description}
                </p>
                <div className="mt-12 flex gap-4">
                    <button className={`group px-8 py-4 rounded-full bg-transparent border uppercase text-xs font-bold tracking-widest transition-all hover:scale-105 ${isDark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>
                        Read Full Bio
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {PORTFOLIO_CONTENT.about.stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`aspect-square flex flex-col items-center justify-center p-6 text-center rounded-[2rem] ${getGlassStyle(isDark)}`}
                    >
                        <span className="text-5xl lg:text-6xl font-black mb-2 tracking-tighter" style={{ color: themeColor }}>{stat.value}</span>
                        <span className={`text-[10px] font-mono uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-black/40'}`}>{stat.label}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    </SectionWrapper>
);

const Experience = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => {
    return (
        <SectionWrapper>
            <SectionTitle number="02" subtitle="Career_Timeline" title="Trajectory" isDark={isDark} themeColor={themeColor} />

            <div className="relative border-l border-dashed pl-8 md:pl-16 space-y-20 md:space-y-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                {PORTFOLIO_CONTENT.experience.items.map((job, i) => (
                    <div key={i} className="relative md:grid md:grid-cols-12 md:gap-12 md:items-start md:mb-24 group">
                        {/* Dot */}
                        <div className="absolute -left-[37px] md:-left-[69px] top-2" style={{ color: themeColor }}>
                            <div className="w-4 h-4 rounded-full bg-current relative">
                                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" />
                            </div>
                        </div>

                        {/* Period */}
                        <div className="md:col-span-3 mb-4 md:mb-0">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border ${isDark ? 'border-white/10 text-white/60 bg-white/5' : 'border-black/10 text-black/60 bg-black/5'}`}>
                                {job.period}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="md:col-span-9">
                            <h3 className={`text-4xl md:text-5xl font-black uppercase mb-1 tracking-tight transition-colors duration-500 ${isDark ? 'text-white group-hover:text-white/80' : 'text-black group-hover:text-black/80'}`}>
                                {job.company}
                            </h3>
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`text-lg font-medium ${isDark ? 'text-white/40' : 'text-black/40'}`}>{job.role}</span>
                                <div className={`h-[1px] w-8 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                            </div>
                            <p className={`text-sm md:text-base leading-relaxed max-w-2xl transition-colors ${isDark ? 'text-white/50 group-hover:text-white/70' : 'text-black/50 group-hover:text-black/70'}`}>
                                {job.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </SectionWrapper>
    );
};

const Projects = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper>
        <SectionTitle number="03" subtitle="Selected_Works" title="Protocol_Output" isDark={isDark} themeColor={themeColor} />

        <div className="space-y-32">
            {PORTFOLIO_CONTENT.projects.categories.map((cat, i) => (
                <div key={i}>
                    <div className="flex items-center gap-4 mb-12">
                        <span className={`text-xs font-mono uppercase tracking-[0.2em] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>CAT_0{i + 1}__{cat.name.toUpperCase()}</span>
                        <div className="h-[1px] flex-1 opacity-10 bg-current" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {cat.items.map((project, j) => (
                            <motion.div
                                key={j}
                                whileHover={{ y: -10 }}
                                className={`group relative p-8 md:p-12 rounded-[2rem] overflow-hidden min-h-[400px] flex flex-col justify-between transition-colors duration-700 ${isDark ? 'bg-white/[0.03] hover:bg-white/[0.05]' : 'bg-black/[0.02] hover:bg-black/[0.04]'}`}
                            >
                                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <ArrowRight size={24} className="-rotate-45" style={{ color: themeColor }} />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-wrap gap-2">
                                        {project.stack.map((tech, k) => (
                                            <span key={k} className={`text-[9px] font-mono uppercase border px-2 py-1 rounded-md ${isDark ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'}`}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className={`text-4xl md:text-5xl font-black leading-none tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
                                        {project.title}
                                    </h3>
                                </div>

                                <div className="mt-12">
                                    <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                                        {project.desc}
                                    </p>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: themeColor, transform: 'scaleX(0)', transformOrigin: 'left' }} className="group-hover:scale-x-100 transition-transform duration-700" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </SectionWrapper>
);

const Contact = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper className="!min-h-[70vh] flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-end mb-24">
            <div>
                <span className="block font-mono text-xs mb-8 opacity-50 uppercase tracking-widest">Init_Transmission</span>
                <h2 className={`text-6xl md:text-8xl font-black tracking-[-0.04em] uppercase leading-[0.9] mb-8 ${isDark ? 'text-white' : 'text-black'}`}>
                    Let's Build<br /><span style={{ color: themeColor, opacity: 0.8 }}>The Future</span>
                </h2>
            </div>
            <div className="lg:text-right">
                <a
                    href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
                    className={`inline-block text-2xl md:text-4xl font-mono font-bold hover:underline decoration-2 underline-offset-8 transition-colors ${isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                >
                    {PORTFOLIO_CONTENT.contact.email}
                </a>
            </div>
        </div>

        <div className="border-t pt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <div className="flex gap-8">
                {[
                    { name: 'Github', icon: Github, href: `https://${PORTFOLIO_CONTENT.contact.github}` },
                    { name: 'Twitter', icon: Twitter, href: `https://${PORTFOLIO_CONTENT.contact.twitter}` },
                    { name: 'Email', icon: Mail, href: `mailto:${PORTFOLIO_CONTENT.contact.email}` },
                ].map((social, i) => (
                    <a
                        key={i}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-colors hover:text-emerald-500 ${isDark ? 'text-white/40' : 'text-black/40'}`}
                    >
                        <social.icon size={16} />
                        <span className="hidden md:inline">{social.name}</span>
                    </a>
                ))}
            </div>

            <div className={`text-[10px] font-mono uppercase tracking-[0.2em] opacity-30 ${isDark ? 'text-white' : 'text-black'}`}>
                System_Ver_3.8 // {new Date().getFullYear()}
            </div>
        </div>
    </SectionWrapper>
);

// --- MAIN PAGE ---

export default function IdentityPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const { currentTheme, isDark } = useStore();
    const activeThemeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    return (
        <div ref={containerRef} className={`relative min-h-screen transition-colors duration-1000 selection:bg-emerald-500/30 selection:text-emerald-200 font-sans ${isDark ? 'bg-[#050505] text-white' : 'bg-[#FAFAFA] text-slate-900'}`}>
            <Background themeColor={activeThemeColor} isDark={isDark} />

            {/* Global Nav Sticky */}
            <nav className="fixed top-0 inset-x-0 z-[100] px-6 py-6 md:px-12 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
                <Link href="/" className="pointer-events-auto group flex items-center gap-3">
                    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="hidden md:block text-xs font-bold uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">Return</span>
                </Link>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono font-bold">{PORTFOLIO_CONTENT.hero.title.toUpperCase()}</span>
                    <div className="w-12 h-[1px] bg-white/40" />
                    <span className="text-[10px] font-mono">ID_MOD</span>
                </div>
            </nav>

            {/* Progress Bar */}
            <motion.div
                className="fixed right-0 top-0 w-1 h-screen z-[101] origin-top opacity-50"
                style={{ scaleY: smoothProgress, backgroundColor: activeThemeColor }}
            />

            <main className="relative z-10 w-full overflow-hidden">
                <Hero isDark={isDark} themeColor={activeThemeColor} />
                <About isDark={isDark} themeColor={activeThemeColor} />
                <Experience isDark={isDark} themeColor={activeThemeColor} />
                <Projects isDark={isDark} themeColor={activeThemeColor} />
                <Contact isDark={isDark} themeColor={activeThemeColor} />
            </main>
        </div>
    );
}
