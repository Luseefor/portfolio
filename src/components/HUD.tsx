'use client';

import React, { useRef } from 'react';
import { useScroll, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';

export function HUD() {
    const scroll = useScroll();
    const speedTextRef = useRef<HTMLSpanElement>(null);
    const progressTextRef = useRef<HTMLSpanElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    useFrame(() => {
        const velocity = Math.abs(scroll.delta) * 800;
        const speed = Math.floor(Math.min(velocity, 220));
        const progress = Math.floor(scroll.offset * 100);

        if (speedTextRef.current) speedTextRef.current.textContent = speed.toString().padStart(3, '0');
        if (progressTextRef.current) progressTextRef.current.textContent = `${progress}%`;
        if (progressBarRef.current) progressBarRef.current.style.width = `${progress}%`;
    });

    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="relative h-screen w-screen p-10 font-mono text-white pointer-events-none">
                {/* Speedometer Area */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute bottom-10 left-10 overflow-hidden rounded-2xl border border-cyan-500/20 bg-black/40 p-6 backdrop-blur-xl"
                >
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/5 to-transparent" />

                    {/* Scanning Line */}
                    <motion.div
                        animate={{ y: ['0%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-x-0 h-px w-full bg-cyan-500/10"
                    />

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase opacity-60">Velocity_System</span>
                        <div className="flex items-baseline gap-3">
                            <span ref={speedTextRef} className="text-5xl font-black tabular-nums tracking-tighter text-white">000</span>
                            <span className="text-sm font-bold text-cyan-500/60 uppercase tracking-widest">km/h</span>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-1">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.2, 0.6, 0.2] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                                className="h-1 w-2 rounded-sm bg-cyan-500/40"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Progress Bar Area */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute bottom-10 right-10 w-80 overflow-hidden rounded-2xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-xl"
                >
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 to-transparent" />

                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-[0.3em] text-purple-400 uppercase opacity-60">Navigation_Log</span>
                            <span className="text-xs font-bold text-white/40">Motherboard_Traverse</span>
                        </div>
                        <span ref={progressTextRef} className="text-xl font-black text-white">0%</span>
                    </div>

                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div ref={progressBarRef} className="h-full w-0 bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300 ease-out" />
                    </div>

                    <div className="mt-4 flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        <span>Origin</span>
                        <span>Core_Destination</span>
                    </div>
                </motion.div>

                {/* Corner Technical Accents */}
                <div className="absolute top-10 left-10 flex flex-col gap-2 opacity-40">
                    <div className="h-px w-12 bg-white/20" />
                    <div className="h-12 w-px bg-white/20" />
                </div>
                <div className="absolute top-10 right-10 flex items-end flex-col gap-2 opacity-40">
                    <div className="h-px w-12 bg-white/20" />
                    <div className="h-12 w-px bg-white/20" />
                </div>
            </div>
        </Html>
    );
}
