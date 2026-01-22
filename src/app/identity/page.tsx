'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Github, Twitter, ExternalLink, Code2, Layers, Cpu, Globe } from 'lucide-react';
import FloatingParticles from '@/components/FloatingParticles';
import LetterGlitch from '@/components/LetterGlitch';
import HyperText from '@/components/HyperText';
import { PORTFOLIO_CONTENT } from './portfolio-template';

// Reusing the premium background from the landing page
const Background = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#020202]">
            {/* Ambient Orb */}
            <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

            <FloatingParticles
                particleColor="#10b981"
                particleCount={60}
                movementSpeed={0.3}
                mouseInfluence={200}
                mouseGravity="attract"
                gravityStrength={50}
            />

            <LetterGlitch
                glitchColors={['#10b981', '#34d399', '#059669']}
                opacity={0.05}
                outerVignette={false}
            />

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                }}
            />
        </div>
    );
};

// Section Header Component
const SectionTitle = ({ title }: { title: string }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-8 flex items-center gap-4 border-b border-emerald-500/20 pb-4"
    >
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">{title}</h2>
    </motion.div>
);

export default function IdentityPage() {
    return (
        <div className="min-h-screen w-full bg-[#020202] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
            <Background />

            {/* Navigation */}
            <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/5 bg-black/50 px-6 py-4 backdrop-blur-md">
                <Link href="/" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-emerald-500">
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                    <span>System Root</span>
                </Link>
                <div className="flex gap-4 opacity-50">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </nav>

            <main className="relative z-10 mx-auto max-w-4xl px-6 py-32">

                {/* Hero Section */}
                <section className="mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                {PORTFOLIO_CONTENT.hero.status}
                            </span>
                        </div>

                        <h1 className="mb-6 text-6xl font-black tracking-tighter md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20">
                            {PORTFOLIO_CONTENT.hero.title}
                        </h1>
                        <h2 className="mb-8 text-xl font-light text-slate-400 md:text-2xl">
                            {PORTFOLIO_CONTENT.hero.subtitle}
                        </h2>
                        <p className="max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
                            {PORTFOLIO_CONTENT.hero.tagline}
                        </p>
                    </motion.div>
                </section>

                {/* About Section */}
                <section className="mb-32">
                    <SectionTitle title={PORTFOLIO_CONTENT.about.title} />
                    <div className="grid gap-12 md:grid-cols-2">
                        <p className="text-lg leading-relaxed text-slate-300">
                            {PORTFOLIO_CONTENT.about.description}
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {PORTFOLIO_CONTENT.about.stats.map((stat, i) => (
                                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                                    <div className="text-3xl font-bold text-emerald-500">{stat.value}</div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Experience Section */}
                <section className="mb-32">
                    <SectionTitle title={PORTFOLIO_CONTENT.experience.title} />
                    <div className="flex flex-col gap-8">
                        {PORTFOLIO_CONTENT.experience.items.map((job, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative border-l-2 border-white/10 pl-8 transition-colors hover:border-emerald-500"
                            >
                                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-500/50">{job.period}</div>
                                <h3 className="text-2xl font-bold text-white">{job.role}</h3>
                                <div className="mb-4 text-sm text-slate-400">{job.company}</div>
                                <p className="text-sm leading-relaxed text-slate-500">{job.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Projects Section */}
                <section className="mb-32">
                    <SectionTitle title={PORTFOLIO_CONTENT.projects.title} />
                    <div className="flex flex-col gap-12">
                        {PORTFOLIO_CONTENT.projects.categories.map((cat, i) => (
                            <div key={i}>
                                <h3 className="mb-6 flex items-center gap-3 text-lg font-bold text-white">
                                    <Layers size={20} className="text-emerald-500" />
                                    {cat.name}
                                </h3>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {cat.items.map((project, j) => (
                                        <div key={j} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-emerald-500/50 hover:bg-white/[0.05]">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500">
                                                    <Code2 size={20} />
                                                </div>
                                                <ExternalLink size={16} className="text-slate-600 transition-colors group-hover:text-white" />
                                            </div>
                                            <h4 className="mb-2 text-xl font-bold text-white">{project.title}</h4>
                                            <p className="mb-6 text-sm text-slate-400">{project.desc}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.stack.map((tech, k) => (
                                                    <span key={k} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-400">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stack Section */}
                <section className="mb-32">
                    <SectionTitle title={PORTFOLIO_CONTENT.stack.title} />
                    <div className="flex flex-wrap gap-3">
                        {PORTFOLIO_CONTENT.stack.technologies.map((tech, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400">
                                <Cpu size={16} />
                                {tech}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Section */}
                <section className="mb-24">
                    <SectionTitle title={PORTFOLIO_CONTENT.contact.title} />
                    <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/10 to-transparent p-8 md:p-12 text-center">
                        <h2 className="mb-6 text-3xl font-black uppercase tracking-tight md:text-5xl">{PORTFOLIO_CONTENT.contact.cta}</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href={`mailto:${PORTFOLIO_CONTENT.contact.email}`} className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105">
                                <Mail size={16} />
                                <span>Email Me</span>
                            </a>
                            <a href={`https://${PORTFOLIO_CONTENT.contact.github}`} className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10">
                                <Github size={16} />
                                <span>GitHub</span>
                            </a>
                            <a href={`https://${PORTFOLIO_CONTENT.contact.twitter}`} className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10">
                                <Twitter size={16} />
                                <span>Twitter</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center text-[10px] uppercase tracking-widest text-slate-600">
                    System Identity // v2.0.4 // {new Date().getFullYear()}
                </footer>

            </main>
        </div>
    );
}
