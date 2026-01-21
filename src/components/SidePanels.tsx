'use client';

import { useStore } from '@/utils/store';
import { motion, AnimatePresence } from 'framer-motion';

const CONTENT = {
    RAM: {
        title: "SKILLS & MEMORY",
        body: "React, Next.js, Three.js, GSAP, WebGL, Node.js, Python, GLSL.",
        color: "cyan"
    },
    GPU: {
        title: "GRAPHICS PROJECTS",
        body: "Rendering 60FPS experiences. Project A: Neon Racer. Project B: Void Scroller.",
        color: "pink"
    },
    CPU: {
        title: "CENTRAL PROCESSING",
        body: "Core Logic. Contact me for authorized access.",
        color: "yellow"
    }
};

export function SidePanels() {
    const activeSection = useStore((state) => state.activeSection);
    const data = activeSection ? CONTENT[activeSection as keyof typeof CONTENT] : null;

    return (
        <div className="fixed top-0 right-0 h-full w-full pointer-events-none flex items-center justify-end p-12 z-40">
            <AnimatePresence>
                {activeSection && data && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className={`w-96 p-8 border-l-4 bg-black/50 backdrop-blur-md pointer-events-auto`}
                        style={{ borderColor: data.color }}
                    >
                        <h2 className="text-4xl font-bold mb-4 font-mono" style={{ color: data.color }}>
                            {data.title}
                        </h2>
                        <div className="h-1 w-full bg-gray-800 mb-4 overflow-hidden">
                            <div className="h-full w-1/3 bg-white animate-pulse" />
                        </div>
                        <p className="text-gray-300 font-mono text-sm leading-relaxed">
                            {data.body}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
