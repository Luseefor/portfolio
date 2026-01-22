'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050505] text-white">
      {/* Premium Background Accents */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
            System Dashboard
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mb-8 text-7xl font-black tracking-tighter sm:text-8xl md:text-9xl"
        >
          Welcome
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="max-w-md px-6 text-lg text-white/40"
        >
          Explore the immersive digital landscape through a high-performance interactive drive.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12"
        >
          <Link href="/interactive">
            <motion.div
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,1)', color: '#000' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition-all shadow-2xl backdrop-blur-md"
            >
              <span className="tracking-widest uppercase text-sm">Initiate Experience</span>
              <ChevronRight size={20} />
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Subtle Bottom Accents */}
      <div className="absolute bottom-12 flex gap-8 text-[10px] font-bold tracking-[0.5em] text-white/10 uppercase">
        <span>Portfolio.OS</span>
        <span>v2.0.4</span>
        <span>Secure Connection</span>
      </div>
    </main>
  );
}
