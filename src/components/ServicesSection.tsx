'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Cpu, Server } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

const FuturisticCard = dynamic(() => import('@/components/FuturisticCard'), { ssr: false });

const services = [
    {
        title: "Full Stack Engineering",
        desc: "End-to-end web application development using modern frameworks like Next.js and secure backends.",
        icon: Globe,
        id: "SYS-01"
    },
    {
        title: "AI & ML pipelines",
        desc: "Integration of LLMs, proprietary models, and automated data processing workflows.",
        icon: Cpu,
        id: "SYS-02"
    },
    {
        title: "Backend Architecture",
        desc: "High-performance API design, microservices, and scalable database schema optimization.",
        icon: Server,
        id: "SYS-03"
    }
];

export default function ServicesSection() {
    const { currentTheme, isDark } = useStore();
    const themeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

    return (
        <section id="services" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-16">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 mb-4"
                >
                    <div className="h-[2px] w-12" style={{ backgroundColor: themeColor }} />
                    <span className="text-sm font-mono uppercase tracking-widest text-slate-400">System Modules</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                    Core <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${themeColor}, white)` }}>Services</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, i) => (
                    <FuturisticCard key={i} themeColor={themeColor} className="min-h-[280px]">
                        <div className="mb-6 inline-flex p-3 rounded-lg bg-white/5" style={{ color: themeColor }}>
                            <service.icon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {service.desc}
                        </p>
                    </FuturisticCard>
                ))}
            </div>
        </section>
    );
}
