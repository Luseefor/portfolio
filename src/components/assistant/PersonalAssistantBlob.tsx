'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useStore } from '@/utils/store';
import { getSurfacePalette, getThemeColor, hexToRgba } from '@/utils/themes';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "I'm Rijan's assistant. Ask about projects, skills, experience, or tell me to send a message.",
};

function toApiHistory(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.id !== 'welcome')
    .map((message) => ({
      role: message.role,
      content: message.text,
    }));
}

export default function PersonalAssistantBlob() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const currentTheme = useStore((state) => state.currentTheme);
  const isDark = useStore((state) => state.isDark);
  const palette = getSurfacePalette(isDark);
  const accent = getThemeColor(currentTheme, isDark);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const containerStyle = useMemo(
    () => ({
      borderColor: hexToRgba(palette.borderStrong, 0.85),
      backgroundColor: isDark ? hexToRgba(palette.elevated, 0.96) : hexToRgba('#ffffff', 0.98),
      boxShadow: `0 22px 48px ${hexToRgba('#000000', isDark ? 0.28 : 0.14)}`,
    }),
    [isDark, palette.borderStrong, palette.elevated],
  );

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmed,
    };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: toApiHistory(history),
        }),
      });
      const payload = (await response.json()) as { reply?: string };
      const reply = payload.reply?.trim() || 'I could not generate a response right now.';
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-assistant`, role: 'assistant', text: reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          text: 'I hit a connection issue. Please try again.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const openContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsOpen(false);
  };

  const openProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-[min(94vw,430px)] overflow-hidden rounded-3xl border backdrop-blur-xl"
            style={containerStyle}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3.5 sm:px-5"
              style={{ borderColor: hexToRgba(palette.borderDefault, 0.78) }}
            >
              <div className="inline-flex items-center gap-3">
                <div
                  className="relative h-11 w-11 overflow-hidden rounded-full border"
                  style={{ borderColor: hexToRgba(palette.borderStrong, 0.9) }}
                >
                  <Image src="/2d.png" alt="Rijan assistant avatar" width={44} height={44} className="h-full w-full object-cover" />
                  <span
                    className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border"
                    style={{ backgroundColor: '#4ADE80', borderColor: palette.elevated }}
                  />
                </div>
                <div>
                  <p className="text-[15px] font-semibold leading-none">Portfolio Assistant</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[11px]" style={{ color: palette.textMuted }}>
                    <Sparkles size={11} style={{ color: accent }} />
                    Active now
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm"
                style={{ borderColor: hexToRgba(palette.borderDefault, 0.86), color: palette.textSecondary }}
                aria-label="Close assistant"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
              <div
                className="mb-4 max-h-[20rem] space-y-3 overflow-y-auto rounded-2xl border p-3"
                style={{
                  borderColor: hexToRgba(palette.borderDefault, 0.72),
                  backgroundColor: hexToRgba(palette.base, isDark ? 0.46 : 0.06),
                }}
              >
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-6 ${
                          message.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                        }`}
                        style={{
                          background:
                            message.role === 'user'
                              ? `linear-gradient(135deg, ${hexToRgba(accent, 0.95)} 0%, ${hexToRgba(accent, 0.72)} 100%)`
                              : hexToRgba(palette.elevated, 0.95),
                          color:
                            message.role === 'user'
                              ? isDark
                                ? '#0A1118'
                                : palette.textPrimary
                              : palette.textSecondary,
                          border:
                            message.role === 'assistant'
                              ? `1px solid ${hexToRgba(palette.borderDefault, 0.72)}`
                              : 'none',
                        }}
                      >
                        {message.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isSending ? (
                  <div className="flex justify-start">
                    <div
                      className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-2.5"
                      style={{
                        backgroundColor: hexToRgba(palette.elevated, 0.95),
                        border: `1px solid ${hexToRgba(palette.borderDefault, 0.72)}`,
                      }}
                    >
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: palette.textMuted }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: palette.textMuted }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: palette.textMuted }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openProjects}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{ borderColor: hexToRgba(palette.borderDefault, 0.85), color: palette.textSecondary }}
                >
                  View projects
                </button>
                <button
                  type="button"
                  onClick={openContact}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{ borderColor: hexToRgba(palette.borderDefault, 0.85), color: palette.textSecondary }}
                >
                  Send message
                </button>
                <a
                  href="/My Resume - Main.pdf"
                  download="Rijan-Ghimire-Resume.pdf"
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{ borderColor: hexToRgba(palette.borderDefault, 0.85), color: palette.textSecondary }}
                >
                  Resume
                </a>
              </div>

              <form className="grid grid-cols-[1fr_auto] items-center gap-2" onSubmit={sendMessage}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Message about projects, experience, contact..."
                  className="min-h-12 rounded-full border px-4 text-sm outline-none"
                  style={{
                    borderColor: hexToRgba(palette.borderDefault, 0.9),
                    backgroundColor: hexToRgba(palette.base, isDark ? 0.54 : 0.06),
                    color: palette.textPrimary,
                  }}
                />
                <button
                  type="submit"
                  disabled={isSending || input.trim().length === 0}
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: accent }}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            type="button"
            onClick={() => setIsOpen(true)}
            className="group inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border backdrop-blur-lg"
            style={{
              borderColor: hexToRgba(palette.borderStrong, 0.9),
              backgroundColor: hexToRgba(palette.elevated, 0.92),
              boxShadow: `0 12px 30px ${hexToRgba('#000000', isDark ? 0.3 : 0.12)}`,
            }}
            aria-label="Open portfolio assistant"
          >
            <Image src="/2d.png" alt="Open assistant" width={56} height={56} className="h-full w-full object-cover" />
          </motion.button>
        ) : null}
      </AnimatePresence>

      {!isOpen ? (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.08 }}
          className="pointer-events-none absolute right-[calc(100%+10px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] sm:inline-flex"
          style={{
            borderColor: hexToRgba(palette.borderDefault, 0.75),
            color: palette.textMuted,
            backgroundColor: hexToRgba(palette.elevated, 0.9),
          }}
        >
          <MessageCircle size={10} className="mr-1.5" />
          Ask me
        </motion.span>
      ) : null}
    </div>
  );
}
