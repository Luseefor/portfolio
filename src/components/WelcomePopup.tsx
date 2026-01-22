'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, MessageSquare, MousePointer2, Keyboard, ChevronRight } from 'lucide-react';

interface WelcomePopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop with deep blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Main Popup Container */}
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                        className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/20 bg-black/40 p-1 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
                    >
                        {/* Shimmer / Liquid Glass Background */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50" />
                        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" />
                        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/10 blur-[80px]" />

                        {/* Scanning Line Animation */}
                        <motion.div
                            animate={{ y: ['0%', '1000%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-x-0 top-0 h-[2px] w-full -z-10 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none"
                        />

                        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-8 md:p-12">
                            {/* Top Section: Header & Badge */}
                            <div className="mb-8 flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-6 flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5"
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">System Initialized</span>
                                </motion.div>

                                <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl drop-shadow-lg">
                                    Welcome to my <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Portfolio</span>
                                </h1>
                                <p className="mt-4 max-w-md text-lg text-white/60">
                                    Step into an interactive 3D drive through my career, skills, and projects.
                                </p>
                            </div>

                            {/* Middle Section: Feature Grid */}
                            <div className="grid gap-6 md:grid-cols-2 mb-10">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="group flex gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                        <Car size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Interactive Drive</h3>
                                        <p className="text-sm text-white/50">Navigate through different project zones along the highway.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="group flex gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">AI Assistant</h3>
                                        <p className="text-sm text-white/50">Chat with my AI companion at any time to learn more about my work.</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Controls Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mb-10 rounded-2xl border border-white/5 bg-black/20 p-6"
                            >
                                <div className="mb-4 flex items-center gap-2 text-white/40">
                                    <Keyboard size={16} />
                                    <span className="text-xs font-bold tracking-wider uppercase">Navigation Controls</span>
                                </div>
                                <div className="flex flex-wrap gap-8 justify-center">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-center">
                                                <kbd className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[10px] font-bold text-white shadow-[0_2px_0_0_rgba(255,255,255,0.1)]">W</kbd>
                                            </div>
                                            <div className="flex gap-1">
                                                <kbd className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[10px] font-bold text-white shadow-[0_2px_0_0_rgba(255,255,255,0.1)]">A</kbd>
                                                <kbd className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[10px] font-bold text-white shadow-[0_2px_0_0_rgba(255,255,255,0.1)]">S</kbd>
                                                <kbd className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[10px] font-bold text-white shadow-[0_2px_0_0_rgba(255,255,255,0.1)]">D</kbd>
                                            </div>
                                        </div>
                                        <span className="text-xs text-white/60">A / D to switch lanes</span>
                                    </div>
                                    <div className="h-12 w-px bg-white/5" />
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <MousePointer2 size={18} className="text-white/40" />
                                            <kbd className="flex h-8 w-32 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[10px] font-bold text-white shadow-[0_2px_0_0_rgba(255,255,255,0.1)] uppercase tracking-widest">Scroll Wheel</kbd>
                                        </div>
                                        <span className="text-xs text-white/60">to explore</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Footer: Start Button */}
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white/10 py-5 font-bold text-white border border-white/20 shadow-xl transition-all"
                            >
                                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="tracking-[0.1em] uppercase text-sm">Initiate Experience</span>
                                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </motion.button>
                        </div>

                        {/* Visual tech accents */}
                        <div className="pointer-events-none absolute top-4 left-4 h-8 w-8 border-t border-l border-white/20 rounded-tl-xl" />
                        <div className="pointer-events-none absolute top-4 right-4 h-8 w-8 border-t border-r border-white/20 rounded-tr-xl" />
                        <div className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b border-l border-white/20 rounded-bl-xl" />
                        <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-white/20 rounded-br-xl" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
