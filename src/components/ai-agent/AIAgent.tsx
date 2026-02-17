'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ChatView from './chat-view/ChatView';
import AuthView from './auth-view/AuthView';
import { AgentSidebarHeader } from './layout/AgentSidebarHeader';
import { useAiAgentChat } from './runtime/useAiAgentChat';

import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

export default function AIAgent() {
  const router = useRouter();
  const isChatOpen = useStore((state) => state.isChatOpen);
  const setChatOpen = useStore((state) => state.setChatOpen);
  const { currentTheme, isDark } = useStore();

  const themeColor = getThemeColor(currentTheme, isDark);
  const accent08 = hexToRgba(themeColor, 0.08);
  const accent10 = hexToRgba(themeColor, 0.1);
  const accent15 = hexToRgba(themeColor, 0.15);
  const accent20 = hexToRgba(themeColor, 0.2);
  const accent30 = hexToRgba(themeColor, 0.3);
  const accent40 = hexToRgba(themeColor, 0.4);
  const accent60 = hexToRgba(themeColor, 0.6);

  const [view, setView] = useState<'auth' | 'chat'>('auth');
  const { messages, input, setInput, isLoading, handleSend } = useAiAgentChat(router);

  return (
    <div
      className="fixed inset-0 z-[1000] font-mono pointer-events-none"
      style={
        {
          '--ai-accent': themeColor,
          '--ai-accent-08': accent08,
          '--ai-accent-10': accent10,
          '--ai-accent-15': accent15,
          '--ai-accent-20': accent20,
          '--ai-accent-30': accent30,
          '--ai-accent-40': accent40,
          '--ai-accent-60': accent60,
        } as React.CSSProperties
      }
    >
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className={`fixed inset-0 z-[90] backdrop-blur-sm pointer-events-auto ${
                isDark ? 'bg-black/50' : 'bg-black/20'
              }`}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 z-[100] h-screen w-full border-r shadow-2xl backdrop-blur-xl md:w-[450px] relative pointer-events-auto ${
                isDark
                  ? 'text-white border-[var(--ai-accent-15)] bg-gradient-to-b from-[#050707]/95 to-[#030404]/95'
                  : 'text-slate-900 border-black/10 bg-gradient-to-b from-white/95 to-white/90'
              }`}
              style={{
                backgroundColor: isDark ? 'rgba(5, 7, 7, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ai-accent-20)] to-transparent" />
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[var(--ai-accent-10)] to-transparent" />
              </div>
              <AgentSidebarHeader
                isDark={isDark}
                themeColor={themeColor}
                accent60={accent60}
                onClose={() => setChatOpen(false)}
              />

              {/* Content Area */}
              <div className="h-full pt-20 pb-4">
                <AnimatePresence mode="wait">
                  {view === 'auth' ? (
                    <motion.div
                      key="auth"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full px-6"
                    >
                      <AuthView onStart={() => setView('chat')} isDark={isDark} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="h-full"
                    >
                      <ChatView
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        onSend={handleSend}
                        isLoading={isLoading}
                        isDark={isDark}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
