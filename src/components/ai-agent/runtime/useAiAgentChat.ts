import { useState } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { tryHandleBuiltInCommand } from './commandHandlers';
import type { Message } from './types';

export function useAiAgentChat(router: AppRouterInstance) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Luseefor.SYS Online. How may I assist you?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { role: 'user' as const, content: input };
    const lowerInput = input.trim().toLowerCase();

    if (tryHandleBuiltInCommand({ lowerInput, userMessage, setMessages, setInput, router })) {
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
      let cleanContent = data.content as string;
      const navMatch = cleanContent.match(/\[\[NAVIGATE:(.*?)\]\]/);
      if (navMatch) {
        const path = navMatch[1];
        cleanContent = cleanContent.replace(navMatch[0], '').trim();
        router.push(path);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: cleanContent }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection Interrupted. Please retry.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, input, setInput, isLoading, handleSend };
}
