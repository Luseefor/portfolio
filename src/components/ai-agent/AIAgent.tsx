'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Activity } from 'lucide-react';
import ChatView from './chat-view/ChatView';
import AuthView from './auth-view/AuthView';

import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Luseefor.SYS Online. How may I assist you?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    const lowerInput = input.trim().toLowerCase();

    // Terminal Commands
    if (lowerInput === 'clear') {
      setMessages([{ role: 'assistant', content: 'Console cleared. System ready.' }]);
      setInput('');
      return;
    }

    if (lowerInput === 'help') {
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          role: 'assistant',
          content:
            'Available Commands:\n\n- clear: Reset console\n- home: Navigate to Dashboard\n- identity: View Documentation\n- whoami: System User Info',
        },
      ]);
      setInput('');
      return;
    }

    if (['home', 'identity'].includes(lowerInput)) {
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          role: 'assistant',
          content: `Executing navigation protocol: ${lowerInput.toUpperCase()}...`,
        },
      ]);
      setTimeout(() => {
        if (lowerInput === 'home') router.push('/');
        else router.push(`/${lowerInput}`);
      }, 800);
      setInput('');
      return;
    }

    if (lowerInput === 'whoami') {
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          role: 'assistant',
          content:
            'User: Guest\nAccess Level: Visiting Entity\nSystem: Connected via Secure Socket',
        },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.json();

      // Handle Navigation Commands
      let cleanContent = data.content;
      const navMatch = cleanContent.match(/\[\[NAVIGATE:(.*?)\]\]/);

      if (navMatch) {
        const path = navMatch[1];
        cleanContent = cleanContent.replace(navMatch[0], '').trim();
        router.push(path);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: cleanContent }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection Interrupted. Please retry.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
              {/* Header */}
              <div className="absolute top-0 z-10 flex w-full items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ai-accent-30)] bg-[var(--ai-accent-10)]">
                    <Bot size={16} style={{ color: themeColor }} />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.2em] font-terminal ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Luseefor.SYS
                    </span>
                    <span
                      className="text-[8px] font-bold uppercase tracking-widest"
                      style={{ color: accent60 }}
                    >
                      Dashboard
                    </span>
                  </div>
                </div>
                <div className="hidden items-center gap-3 text-[8px] font-terminal uppercase tracking-[0.35em] md:flex">
                  <Activity size={12} className="animate-pulse" />
                  <span style={{ color: accent60 }}>Active</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="group rounded-full border border-[var(--ai-accent-20)] bg-[var(--ai-accent-10)] p-2 transition-colors hover:border-[var(--ai-accent-40)] hover:bg-[var(--ai-accent-20)]"
                >
                  <X
                    size={16}
                    className="transition-transform group-hover:rotate-90"
                    style={{ color: accent60 }}
                  />
                </button>
              </div>

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
