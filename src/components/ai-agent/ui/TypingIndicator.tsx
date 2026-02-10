'use client';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex items-center justify-center p-2">
      <motion.div
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        className="h-8 w-8 bg-black rounded-full overflow-hidden border border-[var(--ai-accent-30)]"
      >
        <div className="h-full w-full bg-[url('/2d.png')] bg-cover bg-center bg-no-repeat" />
      </motion.div>
    </div>
  );
}
