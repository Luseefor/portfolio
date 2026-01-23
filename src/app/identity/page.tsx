'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, Mail, Github, Twitter, ExternalLink, Code2, Layers, Cpu, Globe, ArrowDown } from 'lucide-react';
import DigitalNexus from '@/components/DigitalNexus';
import { useStore } from '@/utils/store';
import { PORTFOLIO_CONTENT } from './portfolio-template';

import { THEMES, getThemeColor } from '@/utils/themes';

// --- Shared Refined Styles ---

const getGlassStyle = (isDark: boolean) =>
    `backdrop-blur-3xl border shadow-2xl transition-colors duration-1000 ${isDark
        ? 'bg-white/[0.02] border-white/[0.05]'
        : 'bg-white/80 border-black/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]'}`;

const getMicroText = (isDark: boolean) =>
    `font-mono text-[9px] uppercase tracking-[0.4em] transition-colors duration-1000 ${isDark ? 'text-white/20' : 'text-slate-950/20'}`;

const getAccentText = (color: string) =>
    `font-mono text-[10px] uppercase tracking-[0.5em] font-black`;

const GLOSS_SHEEN = (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <motion.div
            animate={{ left: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-[-15deg]"
        />
    </div>
);

// --- Components ---

const Background = ({ themeColor, isDark }: { themeColor: string, isDark: boolean }) => (
    <div className={`fixed inset-0 z-0 overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#010101]' : 'bg-[#fcfcfc]'}`}>
        <div
            className="absolute left-1/2 top-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[200px] transition-colors duration-1000"
            style={{ backgroundColor: `${themeColor}${isDark ? '05' : '10'}` }}
        />

        <DigitalNexus color={themeColor} isDark={isDark} />

        {/* Subtle Horizontal Rules */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'} pointer-events-none`}>
            {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className={`h-px w-full ${isDark ? 'bg-white/20' : 'bg-black/10'}`} style={{ top: `${(i + 1) * 7}%`, position: 'absolute' }} />
            ))}
        </div>
    </div>
);

const SectionWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <section className={`relative min-h-[80vh] w-full flex flex-col items-center justify-center px-6 py-24 md:py-32 ${className}`}>
        <div className="max-w-5xl w-full relative">
            {children}
        </div>
    </section>
);

const SectionHeader = ({ number, title, isDark, themeColor }: { number: string, title: string, isDark: boolean, themeColor: string }) => (
    <div className="mb-20">
        <div className="flex items-center gap-6">
            <span className="font-mono font-black text-sm" style={{ color: `${themeColor}cc` }}>{number}</span>
            <div className={`h-px w-12 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
            <h2 className={getMicroText(isDark)}>{title}</h2>
        </div>
    </div>
);

const ProfileAvatar = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <div className="relative mb-12 flex justify-center group opacity-80">
        <div className="relative h-40 w-40 md:h-52 md:w-52">
            {/* Minimal High-Tech Ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className={`absolute -inset-4 rounded-full border ${isDark ? 'border-white/[0.03]' : 'border-black/[0.03]'}`}
            />

            <div className={`absolute inset-0 overflow-hidden rounded-full ${getGlassStyle(isDark)} group-hover:border-emerald-500/20 transition-all duration-1000`}>
                <div
                    className="flex h-full w-full items-center justify-center transition-colors duration-1000"
                    style={{ background: `linear-gradient(135deg, ${themeColor}10, transparent)` }}
                >
                    <Cpu size={40} style={{ color: `${themeColor}40` }} className="md:size-16" />
                </div>
                {GLOSS_SHEEN}
                <motion.div
                    animate={{ top: ['-10%', '110%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px]"
                    style={{ backgroundColor: `${themeColor}30` }}
                />
            </div>

            {/* Micro Metadata */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 space-y-2 hidden md:block">
                <div className="text-[8px] font-mono uppercase tracking-tighter" style={{ color: `${themeColor}60` }}>REF_OS_V3.8</div>
                <div className={`text-[8px] font-mono uppercase tracking-tighter ${isDark ? 'text-white/20' : 'text-slate-950/20'}`}>0x4F8E2A</div>
            </div>
        </div>
    </div>
);

// --- Sections ---

const Hero = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => {
    return (
        <SectionWrapper className="h-screen py-0 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-center w-full flex flex-col items-center"
            >
                <div className="mb-8 flex flex-col items-center gap-4 md:mb-12">
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-md transition-all duration-700 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
                        <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/40' : 'text-slate-900/40'}`}>
                            {PORTFOLIO_CONTENT.hero.status}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.6em] transition-colors duration-1000 ${isDark ? 'text-white/20' : 'text-slate-950/30'}`}>
                            SYSTEM_PROTOCOL_IDX: "ACCESSING IDENTITY"
                        </p>
                        <h1 className={`text-6xl font-black tracking-tighter sm:text-8xl md:text-9xl leading-none transition-colors duration-1000`}
                            style={{
                                color: isDark ? 'white' : 'transparent',
                                backgroundImage: !isDark ? `linear-gradient(to right, ${themeColor}, ${themeColor}aa)` : 'none',
                                WebkitBackgroundClip: !isDark ? 'text' : 'none',
                                backgroundClip: !isDark ? 'text' : 'none'
                            }}
                        >
                            Rijan Ghimire
                        </h1>
                        <p className={`max-w-xl mx-auto text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] transition-colors duration-1000 ${isDark ? 'text-white/30' : 'text-slate-900/40'}`}>
                            {PORTFOLIO_CONTENT.hero.subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 mt-12 md:mt-20">
                    <div className={`text-[8px] font-mono uppercase tracking-[0.8em] transition-all duration-1000 ${isDark ? 'text-white/10' : 'text-black/5'}`}>
                        REF_ID: //0xCCFD_L02_G01
                    </div>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="mt-8"
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm shadow-xl transition-colors duration-1000 ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}>
                            <ArrowDown size={18} className={isDark ? 'text-white' : 'text-slate-900'} />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </SectionWrapper>
    );
}

const About = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper>
        <SectionHeader number="01" title="Background" isDark={isDark} themeColor={themeColor} />
        <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className={`text-[8px] font-mono tracking-widest transition-colors duration-1000 ${isDark ? 'text-white/20' : 'text-slate-950/20'} mb-6`}>PROTOCOL::START_INIT</div>
                <p className={`text-2xl sm:text-3xl md:text-4xl font-black leading-snug transition-colors duration-1000 ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                    {PORTFOLIO_CONTENT.about.description}
                </p>
                <div className="mt-12 group flex items-center gap-4">
                    <span className={getAccentText(themeColor)} style={{ color: `${themeColor}cc` }}>System_Identity_Verified // {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
                    <div className={`h-px flex-1 transition-colors duration-1000 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-1">
                {PORTFOLIO_CONTENT.about.stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-700 ${getGlassStyle(isDark)} hover:bg-emerald-500/[0.04]`}
                    >
                        <div className="text-4xl md:text-5xl font-black mb-2 leading-none" style={{ color: `${themeColor}cc` }}>{stat.value}</div>
                        <div className={getMicroText(isDark)}>{stat.label}</div>
                        {GLOSS_SHEEN}
                    </motion.div>
                ))}
            </div>
        </div>
    </SectionWrapper>
);

const Experience = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper>
        <SectionHeader number="02" title="Architecture_History" isDark={isDark} themeColor={themeColor} />
        <div className="space-y-4">
            {PORTFOLIO_CONTENT.experience.items.map((job, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`group relative overflow-hidden rounded-[2rem] p-10 md:p-12 transition-all duration-700 ${getGlassStyle(isDark)} hover:border-emerald-500/20`}
                >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <div className="mb-4 flex items-center gap-3">
                                <div className={`text-[8px] font-mono tracking-widest transition-colors duration-1000 ${isDark ? 'text-white/20' : 'text-slate-950/20'}`}>{job.period}</div>
                                <div className={`h-[1px] w-6 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                                <div className="text-[7px] font-mono uppercase tracking-tighter opacity-40">EXP_NODE_{i + 1}</div>
                            </div>
                            <h3 className={`text-3xl font-black mb-2 tracking-tight transition-colors duration-1000 md:text-5xl ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{job.role}</h3>
                            <div className="text-base font-bold uppercase tracking-widest transition-opacity duration-1000" style={{ color: `${themeColor}cc` }}>@{job.company}</div>
                            <p className={`mt-8 max-w-xl text-xs leading-relaxed font-sans font-medium transition-colors duration-1000 md:text-sm ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
                                {job.description}
                            </p>
                        </div>
                    </div>
                    {GLOSS_SHEEN}
                </motion.div>
            ))}
        </div>
    </SectionWrapper>
);

const Works = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper>
        <SectionHeader number="03" title="Component_Archive // SYS_DATA" isDark={isDark} themeColor={themeColor} />
        <div className="grid gap-12 lg:grid-cols-2">
            {PORTFOLIO_CONTENT.projects.categories.map((cat, i) => (
                <div key={i} className="space-y-6">
                    <h3 className={getMicroText(isDark).replace(isDark ? 'text-white/20' : 'text-slate-950/20', isDark ? 'text-white/40' : 'text-slate-950/40') + " font-black"}>CAT_{cat.name.toUpperCase()}</h3>
                    <div className="grid gap-4">
                        {cat.items.map((project, j) => (
                            <motion.div
                                key={j}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className={`group relative overflow-hidden rounded-[1.5rem] p-8 transition-all duration-700 ${getGlassStyle(isDark)} hover:border-emerald-500/30`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex flex-col gap-1">
                                        <h4 className={`text-xl font-black tracking-tight leading-none transition-colors duration-1000 ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{project.title}</h4>
                                        <div className="text-[7px] font-mono opacity-20 uppercase tracking-tighter">OBJ_ID: //0x{Math.random().toString(16).slice(2, 8).toUpperCase()}</div>
                                    </div>
                                    <ExternalLink size={14} className="transition-colors" style={{ color: `${themeColor}40` }} />
                                </div>
                                <p className={`text-xs mb-8 leading-relaxed font-medium transition-colors duration-1000 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                                    {project.desc}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {project.stack.map((tech, k) => (
                                        <span key={k} className="text-[8px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-black/5 bg-black/[0.02]" style={{ borderColor: `${themeColor}10`, color: `${themeColor}cc` }}>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                                {GLOSS_SHEEN}
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </SectionWrapper>
);

const TechStack = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper>
        <SectionHeader number="04" title="Logic_Foundation // CORE_TECH" isDark={isDark} themeColor={themeColor} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PORTFOLIO_CONTENT.stack.technologies.map((tech, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className={`group relative py-8 flex flex-col items-center justify-center rounded-2xl ${getGlassStyle(isDark)} hover:border-emerald-500/20 transition-all`}
                >
                    <div className="text-[7px] font-mono opacity-20 uppercase tracking-[0.4em] mb-3">MODULE_{i + 1}</div>
                    <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-1000 ${isDark ? 'text-white/30' : 'text-slate-900/40'} group-hover:text-emerald-500`} style={{ color: undefined }}>{tech}</span>
                    {GLOSS_SHEEN}
                </motion.div>
            ))}
        </div>
    </SectionWrapper>
);

const Contact = ({ isDark, themeColor }: { isDark: boolean, themeColor: string }) => (
    <SectionWrapper className="mb-48">
        <div className={`relative overflow-hidden rounded-3xl p-16 md:p-24 text-center ${getGlassStyle(isDark)} transition-colors duration-1000 border-emerald-500/20 shadow-none`}>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className={getMicroText(isDark).replace(isDark ? 'text-white/20' : 'text-slate-950/20', '') + " mb-8"} style={{ color: `${themeColor}cc` }}>Transmission ready</div>
                <h2 className={`mb-12 text-4xl md:text-6xl font-black tracking-tighter transition-colors duration-1000 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {PORTFOLIO_CONTENT.contact.cta}
                </h2>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <a href={`mailto:${PORTFOLIO_CONTENT.contact.email}`} className={`group relative overflow-hidden flex items-center gap-3 rounded-xl border px-8 py-4 text-xs font-black transition-all ${isDark ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white hover:text-black' : 'bg-black/[0.05] border-black/10 text-slate-950 hover:bg-black hover:text-white'}`}>
                        <Mail size={16} />
                        <span className="uppercase tracking-[0.2em]">Email Terminal</span>
                        {GLOSS_SHEEN}
                    </a>

                    <div className="flex gap-4">
                        {[
                            { icon: Github, href: `https://${PORTFOLIO_CONTENT.contact.github}` },
                            { icon: Twitter, href: `https://${PORTFOLIO_CONTENT.contact.twitter}` }
                        ].map((social, i) => (
                            <a key={i} href={social.href} className={`group flex h-16 w-16 items-center justify-center rounded-xl ${getGlassStyle(isDark)} text-white transition-all hover:bg-emerald-500 hover:text-black hover:scale-105 ${!isDark && 'text-slate-900 shadow-none'}`}>
                                <social.icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Subtle Gradient Accent */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full blur-[100px] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: `${themeColor}10` }} />
        </div>
    </SectionWrapper>
);

// --- Main Page Component ---

export default function IdentityPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const { currentTheme, isDark } = useStore();

    const activeThemeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    return (
        <div ref={containerRef} className={`relative min-h-screen transition-colors duration-1000 selection:bg-emerald-500/30 selection:text-emerald-200 ${isDark ? 'bg-[#010101] text-white' : 'bg-[#fcfcfc] text-slate-900'}`}>
            <Background themeColor={activeThemeColor} isDark={isDark} />

            {/* Minimal Nav */}
            <nav className="fixed top-0 left-0 right-0 z-[100] p-6 lg:p-10 pointer-events-none">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
                    <Link href="/" className="group flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${isDark ? 'border-white/10 bg-white/5 hover:bg-white hover:text-black' : 'border-black/5 bg-black/5 hover:bg-black hover:text-white shadow-none'}`}>
                            <ArrowLeft size={16} />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Root_Link</span>
                            <span className="text-[7px] font-mono opacity-40 uppercase tracking-tighter mt-1">SYS_EXIT_PORTAL</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className={getMicroText(isDark)}>TRANS_ACTIVE :: 0xCCFD</div>
                            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeThemeColor, boxShadow: `0 0 10px ${activeThemeColor}` }} />
                        </div>
                        <div className={`h-8 w-[1px] ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Identity_Explorer.v3</div>
                    </div>
                </div>
            </nav>

            {/* Minimal Progress Line */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[1px] z-[101] origin-left"
                style={{ scaleX: scrollYProgress, backgroundColor: isDark ? `${activeThemeColor}40` : activeThemeColor }}
            />

            <main className="relative z-10 w-full">
                <Hero isDark={isDark} themeColor={activeThemeColor} />
                <About isDark={isDark} themeColor={activeThemeColor} />
                <Experience isDark={isDark} themeColor={activeThemeColor} />
                <Works isDark={isDark} themeColor={activeThemeColor} />
                <TechStack isDark={isDark} themeColor={activeThemeColor} />
                <Contact isDark={isDark} themeColor={activeThemeColor} />

                {/* Minimal Footer */}
                <footer className="py-20 text-center">
                    <div className={`text-[8px] font-mono uppercase tracking-[1em] transition-colors duration-1000 ${isDark ? 'text-white/10' : 'text-slate-950/10'}`}>
                        &copy; {new Date().getFullYear()} Rijan Ghimire // V3.8_MINIMAL
                    </div>
                </footer>
            </main>
        </div>
    );
}
