'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PORTFOLIO_CONTENT } from '@/app/identity/portfolio-template';

const LiquidGlassCard = dynamic(() => import('@/components/LiquidGlassCard'), { ssr: false });

export default function ContactSection() {
    const [status, setStatus] = useState('Send Message');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Sending...');
        setTimeout(() => {
            setStatus('Message Sent!');
            setTimeout(() => setStatus('Send Message'), 3000);
        }, 1500);
    };

    return (
        <section id="contact" className="relative py-32 px-6 md:px-12 max-w-4xl mx-auto">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black text-white text-center mb-16"
            >
                Get In Touch
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-amber-600 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
            </motion.h2>

            <LiquidGlassCard className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-slate-400 text-sm font-bold">Name</label>
                        <input
                            type="text"
                            id="name"
                            required
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-slate-400 text-sm font-bold">Email</label>
                        <input
                            type="email"
                            id="email"
                            required
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className="block text-slate-400 text-sm font-bold">Message</label>
                        <textarea
                            id="message"
                            rows={5}
                            required
                            placeholder="Tell me about your project..."
                            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status !== 'Send Message'}
                        className="w-full py-4 rounded-lg bg-gradient-to-r from-orange-400 to-amber-600 text-white font-bold tracking-wide hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/10 flex justify-center gap-8">
                    <a href={`https://${PORTFOLIO_CONTENT.contact.github}`} className="text-slate-400 hover:text-white transition-colors">
                        <Github size={24} />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        <Linkedin size={24} />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        <Twitter size={24} />
                    </a>
                    <a href={`mailto:${PORTFOLIO_CONTENT.contact.email}`} className="text-slate-400 hover:text-white transition-colors">
                        <Mail size={24} />
                    </a>
                </div>
            </LiquidGlassCard>

            <footer className="mt-24 text-center text-slate-600 text-sm">
                <p>© {new Date().getFullYear()} Rijan Ghimire. Built with pure HTML, CSS, and JS (adapted to Next.js).</p>
            </footer>
        </section>
    );
}
