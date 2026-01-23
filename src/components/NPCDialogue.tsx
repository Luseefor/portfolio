'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, ChevronRight, Zap } from 'lucide-react';
import { useStore } from '@/utils/store';

export function NPCDialogue() {
    const npcDialogue = useStore((state) => state.npcDialogue);
    const setNpcDialogue = useStore((state) => state.setNpcDialogue);

    if (!npcDialogue) return null;

    return (
        <AnimatePresence>
            {npcDialogue && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setNpcDialogue(null)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Dialogue Box */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-black/60 p-1 shadow-2xl backdrop-blur-xl pointer-events-auto"
                    >
                        <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/5 p-8">
                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight">{npcDialogue.title}</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50">System Intel</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNpcDialogue(null)}
                                    className="group rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10"
                                >
                                    <X size={18} className="text-white/40 group-hover:text-white" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <p className="text-white/70 leading-relaxed italic">
                                    "{npcDialogue.content}"
                                </p>

                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                <div className="flex items-center gap-2 text-xs text-white/40">
                                    <Info size={14} />
                                    <span>Source: Internal Registry // Node_72x</span>
                                </div>
                            </div>

                            {/* Footer / Action */}
                            <div className="mt-8">
                                <button
                                    onClick={() => setNpcDialogue(null)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-black transition-all hover:bg-emerald-400 active:scale-[0.98]"
                                >
                                    <span className="text-sm uppercase tracking-widest">Acknowledge</span>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 blur-[40px] -z-10" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
