'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint } from 'lucide-react';
import AIAvatar from '../ui/AIAvatar';

export default function AuthView({ onStart }: { onStart: () => void }) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">

            <div className="mb-6 scale-150">
                <AIAvatar />
            </div>

            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
                Luseefor.SYS
            </motion.h3>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 text-xs text-slate-500 dark:text-slate-400"
            >
                Advanced Portfolio Assistant v2.0 <br />
                Ready to optimize your navigation.
            </motion.p>

            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-emerald-600 dark:bg-white dark:text-black dark:hover:bg-emerald-400"
            >
                <Fingerprint size={16} />
                <span>INITIALIZE SESSION</span>
            </motion.button>

            <div className="mt-8 flex gap-4 opacity-30">
                <ShieldCheck size={14} />
                <span className="text-[10px] uppercase tracking-widest">Secure Connection</span>
            </div>
        </div>
    );
}
