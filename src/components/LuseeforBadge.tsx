'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { useStore } from '@/utils/store';

export default function LuseeforBadge() {
    const setChatOpen = useStore((state) => state.setChatOpen);
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollValues = [
                window.scrollY,
                document.documentElement.scrollTop,
                document.body.scrollTop
            ];
            // Check if any scroll value > 20
            const currentScroll = Math.max(...scrollValues);
            setIsScrolled(currentScroll > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.button
            onClick={() => setChatOpen(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: isScrolled ? 0 : 1,
                y: isScrolled ? -20 : 0,
                pointerEvents: isScrolled ? 'none' : 'auto'
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed top-8 left-8 z-40 group"
        >
            <div className="flex items-center gap-4 bg-[#050505] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md hover:border-white/20 transition-colors">
                {/* Icon Box */}
                <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors shrink-0">
                    <Terminal size={20} className="text-emerald-500" />
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-start">
                    <span className="text-white font-black tracking-[0.2em] text-sm leading-none mb-1">
                        L U S E E F O R
                    </span>
                    <span className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest">
                        PUBLIC_INTERFACE
                    </span>
                </div>
            </div>
        </motion.button>
    );
}
