import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type React from 'react';
import type { Message } from './types';

type TryHandleBuiltInCommandParams = {
  lowerInput: string;
  userMessage: Message;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  router: AppRouterInstance;
};

export function tryHandleBuiltInCommand({
  lowerInput,
  userMessage,
  setMessages,
  setInput,
  router,
}: TryHandleBuiltInCommandParams) {
  if (lowerInput === 'clear') {
    setMessages([{ role: 'assistant', content: 'Console cleared. System ready.' }]);
    setInput('');
    return true;
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
    return true;
  }

  if (lowerInput === 'whoami') {
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        role: 'assistant',
        content: 'User: Guest\nAccess Level: Visiting Entity\nSystem: Connected via Secure Socket',
      },
    ]);
    setInput('');
    return true;
  }

  if (['home', 'identity'].includes(lowerInput)) {
    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: 'assistant', content: `Executing navigation protocol: ${lowerInput.toUpperCase()}...` },
    ]);
    setTimeout(() => {
      if (lowerInput === 'home') router.push('/');
      else router.push(`/${lowerInput}`);
    }, 800);
    setInput('');
    return true;
  }

  return false;
}
