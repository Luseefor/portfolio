'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint, Sparkles, Radio, Lock, Cpu } from 'lucide-react';
import AIAvatar from '../ui/AIAvatar';

export default function AuthView({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="absolute bottom-16 left-10 h-20 w-20 rounded-full border border-emerald-400/20" />
        <div className="absolute right-8 top-24 h-12 w-12 rounded-full border border-emerald-400/30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-terminal uppercase tracking-[0.35em] text-emerald-300"
      >
        <Sparkles size={12} />
        Neural Link
      </motion.div>

      <div className="relative mb-6 scale-150">
        <AIAvatar />
        <div className="absolute -right-6 -top-4 rounded-full border border-emerald-400/30 bg-black/60 px-2 py-0.5 text-[9px] font-terminal uppercase tracking-[0.35em] text-emerald-300">
          SYS
        </div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-lg font-bold tracking-tight text-white"
      >
        Luseefor.SYS
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 text-xs text-emerald-200/60"
      >
        Advanced Portfolio Assistant v2.0 <br />
        Calibrated for precision navigation.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={onStart}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="group relative flex items-center gap-3 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.3em] text-emerald-200 shadow-lg transition-all hover:border-emerald-300 hover:bg-emerald-400/20"
      >
        <Fingerprint size={16} />
        <span>Initialize Session</span>
        <div className="absolute inset-0 rounded-full border border-emerald-400/20 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
      </motion.button>

      <div className="mt-8 grid grid-cols-3 gap-3 text-[9px] uppercase tracking-[0.3em] font-terminal text-emerald-300/60">
        <span className="flex items-center gap-2">
          <ShieldCheck size={12} />
          Secure
        </span>
        <span className="flex items-center gap-2">
          <Cpu size={12} />
          Synced
        </span>
        <span className="flex items-center gap-2">
          <Lock size={12} />
          Encrypted
        </span>
      </div>

      <div className="mt-6 flex items-center gap-2 text-[10px] font-terminal uppercase tracking-[0.3em] text-emerald-400/60">
        <Radio size={12} className="animate-pulse" />
        Secure Connection
      </div>
    </div>
  );
}
