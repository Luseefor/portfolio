'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Server, Palette } from 'lucide-react';
import dynamic from 'next/dynamic';

const LiquidGlassCard = dynamic(() => import('@/components/LiquidGlassCard'), { ssr: false });

const services = [
    {
        icon: Monitor,
        title: "Web Development",
        description: "Building responsive, high-performance websites using modern frameworks like React and Next.js."
    },
    {
        icon: Server,
        title: "Backend Systems",
        description: "Designing robust APIs and server-side logic with Node.js, Python, and PostgreSQL."
    },
    {
        icon: Palette,
        title: "UI/UX Design",
        description: "Creating intuitive interfaces and seamless user experiences with a focus on accessibility."
    }
];

export default function ServicesSection() {
    return (
        <section id="services" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black text-white text-center mb-16"
            >
                What I Do
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-amber-600 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <LiquidGlassCard className="h-full p-10 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                            <div className="mb-6 p-4 rounded-full bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform duration-300">
                                <service.icon size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{service.description}</p>
                        </LiquidGlassCard>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
