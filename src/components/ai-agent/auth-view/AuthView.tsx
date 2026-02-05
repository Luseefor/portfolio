'use client';
import { motion } from 'framer-motion';
import { Fingerprint, Radio } from 'lucide-react';
import AIAvatar from '../ui/AIAvatar';

export default function AuthView({ onStart, isDark }: { onStart: () => void; isDark: boolean }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ai-accent-08)] blur-[70px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ai-accent-20)] bg-[var(--ai-accent-10)] px-3 py-1 text-[10px] font-terminal uppercase tracking-[0.25em]"
        style={{ color: 'var(--ai-accent-60)' }}
      >
        Neural Link
      </motion.div>

      <div className="relative mb-5 scale-125">
        <AIAvatar />
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-2 text-lg font-bold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        Luseefor.SYS
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-7 text-xs"
        style={{ color: 'var(--ai-accent-60)' }}
      >
        Advanced Portfolio Assistant v2.0 <br />
        Calibrated for precision navigation.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={onStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex items-center gap-3 rounded-full border border-[var(--ai-accent-30)] bg-[var(--ai-accent-10)] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.25em] shadow-lg transition-all hover:border-[var(--ai-accent-40)] hover:bg-[var(--ai-accent-20)]"
        style={{ color: isDark ? 'white' : 'var(--ai-accent)' }}
      >
        <Fingerprint size={16} />
        <span>Initialize Session</span>
        <div className="absolute inset-0 rounded-full border border-[var(--ai-accent-20)] opacity-0 blur-md transition-opacity group-hover:opacity-100" />
      </motion.button>

      <div
        className="mt-6 flex items-center gap-2 text-[10px] font-terminal uppercase tracking-[0.3em]"
        style={{ color: 'var(--ai-accent-60)' }}
      >
        <Radio size={12} className="animate-pulse" />
        Secure Connection
      </div>
    </div>
  );
}
