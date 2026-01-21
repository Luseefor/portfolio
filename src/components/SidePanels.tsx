'use client';

import { useStore } from '@/utils/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Cpu, Layers } from 'lucide-react';

const CONTENT = {
    RAM: {
        icon: Database,
        title: "MEMORY & SKILLS",
        subtitle: "High-Speed Access",
        body: "Stack: Next.js, React, TypeScript, Three.js, Tailwind, Node.js.\nSpecialized in: Performance Optimization, 3D Web Experiences, System Architecture.",
        color: "cyan",
        accent: "border-cyan-500"
    },
    GPU: {
        icon: Layers,
        title: "GRAPHICS MODULE",
        subtitle: "Render Pipeline",
        body: "Project A: Neon Racer (WebGL Game)\nProject B: Portfolio City (Interactive 3D)\nProject C: Data_Viz_Core (D3.js Dashboard)",
        color: "pink",
        accent: "border-pink-500"
    },
    CPU: {
        icon: Cpu,
        title: "CENTRAL CORE",
        subtitle: "Processing Unit",
        body: "System Logic. AI Integration Active. \nContact me for collaboration access.",
        color: "yellow",
        accent: "border-yellow-500"
    }
};

export function SidePanels() {
    const activeSection = useStore((state) => state.activeSection);
    const data = activeSection ? CONTENT[activeSection as keyof typeof CONTENT] : null;

    return (
        <div className="fixed top-0 right-0 h-full w-full pointer-events-none flex items-center justify-end p-8 md:p-16 z-40">
            <AnimatePresence>
                {activeSection && data && (
                    <motion.div
                        initial={{ x: 100, opacity: 0, scale: 0.95 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: 50, opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`
                w-[28rem] bg-black/60 backdrop-blur-xl 
                border-l-4 ${data.accent} border-y border-r border-white/10
                rounded-r-2xl rounded-l-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]
                p-8 pointer-events-auto flex flex-col gap-4 font-mono relative overflow-hidden
            `}
                    >
                        {/* Background Decor */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl" />

                        {/* Header */}
                        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                            <div className={`p-3 rounded-lg bg-white/5 ${data.accent} border`}>
                                <data.icon size={32} color={data.color === 'cyan' ? '#22d3ee' : data.color === 'pink' ? '#f472b6' : '#facc15'} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">{data.title}</h2>
                                <p className="text-xs uppercase tracking-widest text-gray-400">{data.subtitle}</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {data.body}
                        </div>

                        {/* Footer / Action */}
                        <div className="mt-4 flex justify-end">
                            <button className={`
                    px-4 py-2 text-xs font-bold uppercase tracking-wider
                    border border-white/20 hover:bg-white/10 transition-colors
                    rounded flex items-center gap-2
                `}
                                style={{ color: data.color === 'cyan' ? '#22d3ee' : data.color === 'pink' ? '#f472b6' : '#facc15' }}
                            >
                                [ Initialize ]
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
