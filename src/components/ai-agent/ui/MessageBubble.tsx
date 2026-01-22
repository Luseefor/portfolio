'use client';
import { motion } from 'framer-motion';
import AIAvatar from './AIAvatar';
import HyperText from '@/components/HyperText';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    isLatest?: boolean;
}

export default function MessageBubble({ role, content, isLatest }: MessageBubbleProps) {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start gap-3'}`}
        >
            {!isUser && (
                <div className="mt-1 shrink-0">
                    <AIAvatar speaking={isLatest} />
                </div>
            )}

            <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${isUser
                        ? 'bg-emerald-500 text-white rounded-tr-sm'
                        : 'bg-white border border-black/5 text-slate-800 rounded-tl-sm dark:bg-white/5 dark:border-white/5 dark:text-slate-200'
                    }`}
            >
                {!isUser && isLatest ? (
                    <HyperText text={content} />
                ) : (
                    content
                )}
            </div>
        </motion.div>
    );
}
