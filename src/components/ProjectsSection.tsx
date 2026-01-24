'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Layers } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PORTFOLIO_CONTENT } from '@/app/identity/portfolio-template';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

const FuturisticCard = dynamic(() => import('@/components/FuturisticCard'), { ssr: false });

export default function ProjectsSection() {
    const { currentTheme, isDark } = useStore();
    const themeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    return (
        <section id="projects" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-[2px] w-12" style={{ backgroundColor: themeColor }} />
                        <span className="text-sm font-mono uppercase tracking-widest text-slate-400">Deployment Logs</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
                        Selected<br />
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${themeColor}, white)` }}>Works</span>
                    </h2>
                </motion.div>
                <div className="h-[1px] flex-1 bg-white/10 mb-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {PORTFOLIO_CONTENT.projects.categories.flatMap(c => c.items).map((project, i) => (
                    <FuturisticCard key={i} themeColor={themeColor} className="min-h-[300px] flex flex-col justify-between hover:cursor-pointer">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 rounded-full bg-white/5" style={{ color: themeColor }}>
                                    <Layers size={24} />
                                </div>
                                <ArrowUpRight className="text-white/30 group-hover:text-white transition-colors" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3 transition-colors">
                                <span className={`` /* Hack to allow hover state via CSS or JS, kept simple for now */}>
                                    {project.title}
                                </span>
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                {project.desc}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto">
                            {project.stack.map((tech, j) => (
                                <span key={j}
                                    className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-white/5"
                                    style={{ color: `${themeColor}aa`, backgroundColor: `${themeColor}10` }}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </FuturisticCard>
                ))}
            </div>
        </section>
    );
}
