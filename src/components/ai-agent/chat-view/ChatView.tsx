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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        <div className="flex flex-col gap-6">
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

      <div className="border-t border-black/5 bg-white/50 p-4 backdrop-blur-md dark:border-white/5 dark:bg-black/50">
        <InputZone input={input} setInput={setInput} onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
