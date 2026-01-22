'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function CircularLoader() {
    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black">
            <div className="relative h-48 w-48">
                {/* Outer Ring */}
                <motion.svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 h-full w-full rotate-[-90deg]"
                >
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(6, 182, 212, 0.1)"
                        strokeWidth="2"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        strokeDasharray="283"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{
                            strokeDashoffset: [283, 0],
                            rotate: [0, 360]
                        }}
                        transition={{
                            strokeDashoffset: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                        }}
                        strokeLinecap="round"
                    />
                </motion.svg>

                {/* Inner Pulsing Core */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-24 w-24 rounded-full bg-cyan-500/10 blur-xl"
                    />
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase"
                        >
                            Loading
                        </motion.div>
                        <div className="mt-1 h-[1px] w-12 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    </div>
                </div>

                {/* Satellite Dots */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-cyan-400"
                        initial={{ x: 0, y: 0 }}
                        animate={{
                            rotate: 360,
                            x: Math.cos((i * 120) * (Math.PI / 180)) * 60,
                            y: Math.sin((i * 120) * (Math.PI / 180)) * 60
                        }}
                        transition={{
                            rotate: { duration: 3 + i, repeat: Infinity, ease: "linear" },
                            duration: 0
                        }}
                        style={{ originX: "-50%", originY: "-50%" }}
                    />
                ))}
            </div>

            {/* Subtext */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
            >
                <div className="text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase">
                    Initializing Neural Network
                </div>
                <div className="mt-2 flex gap-1 justify-center">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="h-1 w-1 rounded-full bg-cyan-500"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
