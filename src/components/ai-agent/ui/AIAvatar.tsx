'use client';
import { motion } from 'framer-motion';

export default function AIAvatar({ speaking = false }: { speaking?: boolean }) {
    return (
        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-emerald-500/30 bg-black">
            <motion.div
                animate={{
                    scale: speaking ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-full bg-[url('/avatar.png')] bg-[length:200%_100%] bg-left bg-no-repeat"
            />

            {/* Gloss Overlay */}
            <div className="absolute inset-0 rounded-full border-t border-white/20" />
        </div>
    );
}
