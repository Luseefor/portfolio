'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const LiquidGlassCard = dynamic(() => import('@/components/LiquidGlassCard'), { ssr: false });

const testimonials = [
    {
        quote: "Alex transformed our outdated website into a modern, high-converting platform. The attention to detail is unmatched.",
        author: "John Doe",
        role: "CEO, TechStart",
        initials: "JD"
    },
    {
        quote: "Incredible technical skills and a great communicator. Delivered the project ahead of schedule with excellent code quality.",
        author: "Sarah Miller",
        role: "Product Manager, InnovateCo",
        initials: "SM"
    },
    {
        quote: "The UI/UX design Alex provided was exactly what we needed. The glassmorphic look is stunning and very modern.",
        author: "Robert Brown",
        role: "Founder, DesignHub",
        initials: "RB"
    }
];

export default function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black text-white text-center mb-16"
            >
                Client Feedback
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-amber-600 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full"
                    >
                        <LiquidGlassCard className="h-full p-8 flex flex-col justify-between">
                            <p className="text-slate-300 italic mb-8 text-lg">"{item.quote}"</p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {item.initials}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{item.author}</h4>
                                    <span className="text-orange-400 text-xs font-mono">{item.role}</span>
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
