'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '@/app/identity/portfolio-template';

import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

export default function IdentityHero() {
    const { currentTheme, isDark } = useStore();
    const themeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    return (
        <section className="relative min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-20 z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 max-w-3xl"
            >
                <div>
                    <motion.h2
                        className="text-3xl md:text-5xl font-bold text-slate-200 mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Hey there!
                    </motion.h2>
                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                    >
                        I'm <span
                            className="text-transparent bg-clip-text bg-gradient-to-r"
                            style={{
                                backgroundImage: `linear-gradient(to right, ${themeColor}, ${themeColor}CC)`
                            }}
                        >
                            {PORTFOLIO_CONTENT.hero.title}.
                        </span>
                    </motion.h1>
                </div>

                <motion.p
                    className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {PORTFOLIO_CONTENT.hero.tagline}
                </motion.p>

                <motion.div
                    className="flex flex-wrap items-center justify-center gap-4 pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    {/* LinkedIn Button */}
                    <a
                        href={`https://${PORTFOLIO_CONTENT.contact.email}`} // Using simplified placeholder, should be social link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-6 py-3 rounded-full bg-[#0077b5] hover:bg-[#006396] text-white transition-all hover:scale-105 shadow-lg shadow-blue-900/20"
                    >
                        <Linkedin size={24} className="fill-white" />
                        <span className="font-bold tracking-wide">LinkedIn</span>
                    </a>

                    {/* GitHub Button */}
                    <a
                        href={`https://${PORTFOLIO_CONTENT.contact.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-6 py-3 rounded-full bg-[#1b1f23] hover:bg-[#2d333b] text-white transition-all hover:scale-105 shadow-lg shadow-black/20 border border-white/10"
                    >
                        <Github size={24} className="fill-white" />
                        <span className="font-bold tracking-wide">GitHub</span>
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
}
