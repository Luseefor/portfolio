'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const LiquidGlassCard = dynamic(() => import('@/components/LiquidGlassCard'), { ssr: false });

const experienceData = [
    {
        period: "2022 - Present",
        role: "Senior Full Stack Developer",
        company: "TechCorp Inc.",
        description: "Leading a team of 5 developers, architecting scalable microservices, and improving system performance by 40%."
    },
    {
        period: "2020 - 2022",
        role: "Frontend Developer",
        company: "Creative Agency",
        description: "Developed award-winning marketing sites for Fortune 500 clients using React and GSAP animations."
    },
    {
        period: "2018 - 2020",
        role: "Junior Web Developer",
        company: "StartUp Hub",
        description: "Collaborated on MVP development and maintained legacy codebases while learning agile methodologies."
    }
];

export default function TimelineSection() {
    return (
        <section id="experience" className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black text-white text-center mb-20"
            >
                Experience
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-amber-600 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
            </motion.h2>

            <div className="relative">
                {/* Center Line */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 md:-ml-[1px] ml-4" />

                <div className="space-y-12">
                    {experienceData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center`}
                        >
                            {/* Spacer for opposite side */}
                            <div className="flex-1 hidden md:block" />

                            {/* Timeline Node */}
                            <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-[#020410] border-[3px] border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] z-10 md:-ml-2 translate-y-6 md:translate-y-0" />

                            {/* Content Card */}
                            <div className="flex-1 w-full pl-12 md:pl-0 md:px-12">
                                <LiquidGlassCard className="p-8 relative">
                                    {/* Arrow connecting to line */}
                                    <div className={`absolute top-6 w-0 h-0 border-[10px] border-transparent 
                                        ${index % 2 === 0
                                            ? 'hidden md:block md:right-[-20px] md:border-l-white/10 md:border-r-0'
                                            : 'hidden md:block md:left-[-20px] md:border-r-white/10 md:border-l-0'
                                        } 
                                        block left-[-20px] border-r-white/10 border-l-0
                                    `} />

                                    <span className="text-orange-400 font-bold text-sm mb-2 block">{item.period}</span>
                                    <h3 className="text-xl font-bold text-white mb-1">{item.role}</h3>
                                    <h4 className="text-slate-400 text-sm font-medium mb-4">{item.company}</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>
                                </LiquidGlassCard>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
