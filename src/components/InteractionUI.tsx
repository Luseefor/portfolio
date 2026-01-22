'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/utils/store';
import { X, Cpu, Activity, Zap } from 'lucide-react';

export function InteractionUI() {
    const focusedItem = useStore((state) => state.focusedItem);
    const setFocusedItem = useStore((state) => state.setFocusedItem);

    return (
        <AnimatePresence>
            {focusedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-end p-8 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="relative w-full max-w-sm pointer-events-auto rounded-[24px] border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-3xl overflow-hidden"
                    >
                        {/* Shimmer / Scanline */}
                        <motion.div
                            animate={{ y: ['0%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-x-0 h-px bg-cyan-500/20 top-0 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                        />

                        <div className="flex justify-between items-start mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                <Cpu size={20} />
                            </div>
                            <button
                                onClick={() => setFocusedItem(null)}
                                className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <h2 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase italic">
                            {focusedItem.title}
                        </h2>
                        <div className="h-1 w-12 bg-cyan-500 mb-6" />

                        <p className="text-white/60 leading-relaxed text-lg mb-8">
                            {focusedItem.content}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                                <div className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold mb-1">Stability</div>
                                <div className="text-lg font-black text-white">99.9%</div>
                            </div>
                            <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                                <div className="text-[10px] uppercase tracking-widest text-purple-500 font-bold mb-1">Efficiency</div>
                                <div className="text-lg font-black text-white">MAX</div>
                            </div>
                        </div>

                        {/* Visual acccents */}
                        <div className="absolute bottom-4 right-4 opacity-10">
                            <Zap size={100} className="text-white" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
