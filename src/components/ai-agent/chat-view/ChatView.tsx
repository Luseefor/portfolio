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
}

export default function ChatView({ messages, input, setInput, onSend, isLoading }: ChatViewProps) {
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
        className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent"
      >
        <div className="flex flex-col gap-5">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              isLatest={msg.role === 'assistant' && i === messages.length - 1}
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

      <div className="border-t border-black/5 bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-black/70">
        <InputZone input={input} setInput={setInput} onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
