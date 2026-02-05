'use client';
import { motion } from 'framer-motion';
import AIAvatar from './AIAvatar';
import TypewriterText from './typewriter-text';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isLatest?: boolean;
  isDark: boolean;
}

export default function MessageBubble({ role, content, isLatest, isDark }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full items-start ${isUser ? 'justify-end' : 'justify-start gap-4'}`}
    >
      {!isUser && (
        <div className="mt-1 shrink-0">
          <AIAvatar speaking={isLatest} />
        </div>
      )}

      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
          isUser
            ? 'bg-[var(--ai-accent)] text-white rounded-tr-sm border border-[var(--ai-accent-40)]'
            : `${isDark ? 'bg-white/10 border-white/10 text-slate-100' : 'bg-white/90 border-black/5 text-slate-900'} rounded-tl-sm`
        }`}
      >
        {!isUser && isLatest ? <TypewriterText text={content} /> : content}
      </div>
    </motion.div>
  );
}
