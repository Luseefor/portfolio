'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Send, Twitter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PORTFOLIO_CONTENT } from '@/app/identity/portfolio-template';

const LiquidGlassCard = dynamic(() => import('@/components/LiquidGlassCard'), { ssr: false });

export default function ContactSection() {
    return (
        <section id="contact" className="relative py-32 px-6 md:px-12 max-w-5xl mx-auto">
            <LiquidGlassCard className="p-12 md:p-24 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold mb-8">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        Available for new opportunities
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
                        Let's build something<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">extraordinary.</span>
                    </h2>

                    <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
                        Whether you have a question or just want to say hi, I'll try my best to get back to you!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a
                            href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
                            className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-cyan-50 transition-all hover:scale-105"
                        >
                            <Mail size={20} />
                            Say Hello
                        </a>
                        <div className="flex gap-4">
                            <a href={`https://${PORTFOLIO_CONTENT.contact.github}`} className="p-4 rounded-full bg-white/5 hover:bg-white/10 hover:text-cyan-400 transition-all border border-white/5">
                                <Github size={20} />
                            </a>
                            <a href="#" className="p-4 rounded-full bg-white/5 hover:bg-white/10 hover:text-cyan-400 transition-all border border-white/5">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </LiquidGlassCard>

            <footer className="mt-24 text-center text-slate-600 text-sm">
                <p>© {new Date().getFullYear()} Rijan Ghimire. Crafted with ❤️ and Next.js.</p>
            </footer>
        </section>
    );
}
