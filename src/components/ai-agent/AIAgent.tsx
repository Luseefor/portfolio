'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles } from 'lucide-react';
import ChatView from './chat-view/ChatView';
import AuthView from './auth-view/AuthView';

import { useStore } from '@/utils/store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAgent() {
  const router = useRouter();
  const isChatOpen = useStore((state) => state.isChatOpen);
  const setChatOpen = useStore((state) => state.setChatOpen);

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
    <div className="z-[100] font-mono">
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm dark:bg-black/50"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-[100] h-screen w-full border-r border-black/10 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]/95 md:w-[450px]"
            >
              {/* Header */}
              <div className="absolute top-0 z-10 flex w-full items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Bot size={18} className="text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                      Luseefor.SYS
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Dashboard
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="group rounded-full border border-black/5 bg-black/5 p-2 transition-colors hover:border-black/10 hover:bg-black/10 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10"
                >
                  <X
                    size={16}
                    className="text-slate-500 transition-transform group-hover:rotate-90 group-hover:text-slate-900 dark:group-hover:text-white"
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
                      <AuthView onStart={() => setView('chat')} />
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
