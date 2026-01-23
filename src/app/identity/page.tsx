'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, Mail, Github, Twitter, ExternalLink, Code2, Layers, Cpu, Globe, ArrowDown } from 'lucide-react';
import FloatingParticles from '@/components/FloatingParticles';
import { PORTFOLIO_CONTENT } from './portfolio-template';

// --- Shared Refined Styles ---

const GLASS_STYLE = "backdrop-blur-3xl bg-white/[0.02] border border-white/[0.05] shadow-2xl";
const MICRO_TEXT = "font-mono text-[9px] uppercase tracking-[0.4em] text-white/20";
const ACCENT_TEXT = "text-emerald-500/60 font-mono text-[10px] uppercase tracking-[0.5em] font-black";

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

const Background = () => (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#010101]">
        <div className="absolute left-1/2 top-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.015] blur-[200px]" />

        {/* Subtle Horizontal Rules */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-px w-full bg-white/20" style={{ top: `${(i + 1) * 10}%`, position: 'absolute' }} />
            ))}
        </div>

        <FloatingParticles
            particleColor="#10b981"
            particleCount={20}
            movementSpeed={0.08}
            mouseInfluence={80}
            mouseGravity="attract"
            gravityStrength={15}
        />
    </div>
);

const SectionWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <section className={`relative min-h-[80vh] w-full flex flex-col items-center justify-center px-6 py-24 md:py-32 ${className}`}>
        <div className="max-w-5xl w-full relative">
            {children}
        </div>
    </section>
);

const SectionHeader = ({ number, title }: { number: string, title: string }) => (
    <div className="mb-20">
        <div className="flex items-center gap-6">
            <span className="text-emerald-500/80 font-mono font-black text-sm">{number}</span>
            <div className="h-px w-12 bg-white/10" />
            <h2 className={MICRO_TEXT}>{title}</h2>
        </div>
    </div>
);

const ProfileAvatar = () => (
    <div className="relative mb-12 flex justify-center group opacity-80">
        <div className="relative h-40 w-40 md:h-52 md:w-52">
            {/* Minimal High-Tech Ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border border-white/[0.03]"
            />

            <div className={`absolute inset-0 overflow-hidden rounded-full ${GLASS_STYLE} group-hover:border-emerald-500/20 transition-all duration-1000`}>
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <Cpu size={40} className="text-emerald-500/20 md:size-16" />
                </div>
                {GLOSS_SHEEN}
                <motion.div
                    animate={{ top: ['-10%', '110%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-emerald-500/20"
                />
            </div>

            {/* Micro Metadata */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 space-y-2 hidden md:block">
                <div className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-tighter">REF_OS_V3.8</div>
                <div className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">0x4F8E2A</div>
            </div>
        </div>
    </div>
);

// --- Sections ---

const Hero = () => {
    return (
        <SectionWrapper className="h-screen py-0 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="text-center w-full flex flex-col items-center gap-12"
            >
                <ProfileAvatar />

                <div className="flex flex-col items-center gap-8">
                    <div className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        <span className={MICRO_TEXT.replace('text-white/20', 'text-emerald-500/80')}>
                            {PORTFOLIO_CONTENT.hero.status}
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-white leading-tight">
                        Rijan Ghimire
                    </h1>

                    <p className="max-w-2xl px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-[0.6em] mb-4">
                        {PORTFOLIO_CONTENT.hero.subtitle}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4, y: [0, 8, 0] }}
                    transition={{
                        opacity: { delay: 2, duration: 1 },
                        y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="flex flex-col items-center gap-2 mt-8"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
                        <ArrowDown size={18} className="text-white" />
                    </div>
                </motion.div>
            </motion.div>
        </SectionWrapper>
    );
}

const About = () => (
    <SectionWrapper>
        <SectionHeader number="01" title="Background" />
        <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <p className="text-2xl sm:text-3xl md:text-4xl font-black leading-snug text-white/90">
                    {PORTFOLIO_CONTENT.about.description}
                </p>
                <div className="mt-12 group flex items-center gap-4">
                    <span className={ACCENT_TEXT}>System Identity verified</span>
                    <div className="h-px flex-1 bg-white/5" />
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
                        className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-700 ${GLASS_STYLE} hover:bg-white/[0.04]`}
                    >
                        <div className="text-4xl md:text-5xl font-black text-emerald-500/80 mb-2 leading-none">{stat.value}</div>
                        <div className={MICRO_TEXT}>{stat.label}</div>
                        {GLOSS_SHEEN}
                    </motion.div>
                ))}
            </div>
        </div>
    </SectionWrapper>
);

const Experience = () => (
    <SectionWrapper>
        <SectionHeader number="02" title="Architecture History" />
        <div className="space-y-4">
            {PORTFOLIO_CONTENT.experience.items.map((job, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`group relative overflow-hidden rounded-2xl p-10 md:p-12 transition-all duration-700 ${GLASS_STYLE} hover:bg-white/[0.04]`}
                >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <div className="mb-4 text-[10px] font-mono text-white/20 tracking-widest">{job.period}</div>
                            <h3 className="text-3xl font-black text-white/90 mb-2 tracking-tight">{job.role}</h3>
                            <div className="text-base font-bold text-white/30 uppercase tracking-widest">@{job.company}</div>
                            <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/50 font-medium">
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

const Works = () => (
    <SectionWrapper>
        <SectionHeader number="03" title="Component Archive" />
        <div className="grid gap-12 lg:grid-cols-2">
            {PORTFOLIO_CONTENT.projects.categories.map((cat, i) => (
                <div key={i} className="space-y-6">
                    <h3 className={MICRO_TEXT.replace('text-white/20', 'text-white/40 font-black')}>{cat.name}</h3>
                    <div className="grid gap-4">
                        {cat.items.map((project, j) => (
                            <motion.div
                                key={j}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-700 ${GLASS_STYLE} hover:bg-white/[0.06] hover:border-emerald-500/30`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h4 className="text-xl font-black text-white/90 tracking-tight">{project.title}</h4>
                                    <ExternalLink size={14} className="text-white/10 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <p className="text-white/40 text-xs mb-8 leading-relaxed">
                                    {project.desc}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {project.stack.map((tech, k) => (
                                        <span key={k} className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-[0.2em]">
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

const TechStack = () => (
    <SectionWrapper>
        <SectionHeader number="04" title="Logic Foundation" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {PORTFOLIO_CONTENT.stack.technologies.map((tech, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className={`group relative py-6 flex items-center justify-center rounded-xl ${GLASS_STYLE} hover:bg-emerald-500/[0.05] hover:border-emerald-500/20 transition-all`}
                >
                    <span className="text-xs font-black text-white/30 group-hover:text-emerald-500 uppercase tracking-widest transition-colors">{tech}</span>
                </motion.div>
            ))}
        </div>
    </SectionWrapper>
);

const Contact = () => (
    <SectionWrapper className="mb-48">
        <div className={`relative overflow-hidden rounded-3xl p-16 md:p-24 text-center ${GLASS_STYLE} border-emerald-500/20`}>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className={MICRO_TEXT.replace('text-white/20', 'text-emerald-500/40') + " mb-8"}>Transmission ready</div>
                <h2 className="mb-12 text-4xl md:text-6xl font-black text-white tracking-tighter">
                    {PORTFOLIO_CONTENT.contact.cta}
                </h2>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <a href={`mailto:${PORTFOLIO_CONTENT.contact.email}`} className="group relative overflow-hidden flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/10 px-8 py-4 text-xs font-black text-white hover:bg-white hover:text-black transition-all">
                        <Mail size={16} />
                        <span className="uppercase tracking-[0.2em]">Email Terminal</span>
                        {GLOSS_SHEEN}
                    </a>

                    <div className="flex gap-4">
                        {[
                            { icon: Github, href: `https://${PORTFOLIO_CONTENT.contact.github}` },
                            { icon: Twitter, href: `https://${PORTFOLIO_CONTENT.contact.twitter}` }
                        ].map((social, i) => (
                            <a key={i} href={social.href} className={`group flex h-16 w-16 items-center justify-center rounded-xl ${GLASS_STYLE} text-white transition-all hover:bg-white hover:text-black hover:scale-105`}>
                                <social.icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Subtle Gradient Accent */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/[0.03] blur-[100px] pointer-events-none" />
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

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#010101] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
            <Background />

            {/* Minimal Nav */}
            <nav className="fixed top-0 left-0 right-0 z-[100] p-6 pointer-events-none">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
                    <Link href="/" className="group flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${GLASS_STYLE} group-hover:bg-emerald-500/80 group-hover:text-black transition-all duration-500`}>
                            <ArrowLeft size={16} />
                        </div>
                        <span className={MICRO_TEXT.replace('text-white/20', 'text-white/40 group-hover:text-emerald-500 transition-colors')}>System root</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <div className="text-[10px] font-mono text-white/20 tracking-tighter">DATA_STREAM :: ACTIVE</div>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
                    </div>
                </div>
            </nav>

            {/* Minimal Progress Line */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[1px] bg-emerald-500/30 z-[101] origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            <main className="relative z-10 w-full">
                <Hero />
                <About />
                <Experience />
                <Works />
                <TechStack />
                <Contact />

                {/* Minimal Footer */}
                <footer className="py-20 text-center">
                    <div className="text-[8px] font-mono text-white/10 uppercase tracking-[1em]">
                        &copy; {new Date().getFullYear()} Rijan Ghimire // V3.8_MINIMAL
                    </div>
                </footer>
            </main>
        </div>
    );
}
