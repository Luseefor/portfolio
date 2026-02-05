'use client';
import { useRef, useEffect } from 'react';
import MessageBubble from '../ui/MessageBubble';
import InputZone from '../ui/InputZone';
import TypingIndicator from '../ui/TypingIndicator';

interface ChatViewProps {
  messages: any[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isDark: boolean;
}

export default function ChatView({
  messages,
  input,
  setInput,
  onSend,
  isLoading,
  isDark,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide bg-gradient-to-b from-transparent via-[var(--ai-accent-08)] to-transparent"
      >
        <div className="flex flex-col gap-5">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              isLatest={msg.role === 'assistant' && i === messages.length - 1}
              isDark={isDark}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start pl-11">
              {/* pl-11 to align with avatar offset */}
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>

      <div
        className={`border-t p-4 backdrop-blur-md ${
          isDark ? 'border-white/10 bg-black/70' : 'border-black/5 bg-white/80'
        }`}
      >
        <InputZone
          input={input}
          setInput={setInput}
          onSend={onSend}
          isLoading={isLoading}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
