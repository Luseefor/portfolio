'use client';

import { useState } from 'react';
import { Html } from '@react-three/drei';

// Mock hook for now, or real implementation if API key available
// In production this should be in a separate hook file
function useChat() {
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
        { role: 'model', text: 'System Initialized. Accessing Core Database...' },
        { role: 'model', text: 'I am the Motherboard Core. Ask me about my architecture.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (text: string) => {
        // Optimistic update
        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsLoading(true);

        try {
            // Check for API key in env
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

            let responseText = "Access Denied: Missing API Key.";

            if (apiKey) {
                // Real API Call
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `You are the AI Core of a portfolio motherboard. Answer as a futuristic system. User asks: ${text}` }] }]
                    })
                });
                const data = await response.json();
                if (data.candidates && data.candidates[0].content) {
                    responseText = data.candidates[0].content.parts[0].text;
                }
            } else {
                // Mock Response
                await new Promise(r => setTimeout(r, 1000));
                responseText = "Processing... (Mock Mode): I process data at 5GHz. I specialize in React and Three.js rendering pipelines.";
            }

            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Error: System Malfunction." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return { messages, sendMessage, isLoading };
}

export function ChatInterface() {
    const { messages, sendMessage, isLoading } = useChat();
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <Html transform position={[0, 0, 0]} occlude distanceFactor={5}>
            <div className="w-80 h-96 bg-black/90 border border-cyan-500 rounded-lg p-4 text-cyan-500 font-mono flex flex-col pointer-events-auto shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                <div className="text-center border-b border-cyan-900 pb-2 mb-2 tracking-widest text-xs">AI CORE v9.0</div>

                <div className="flex-1 overflow-y-auto space-y-2 text-xs p-2 scrollbar-thin scrollbar-thumb-cyan-900">
                    {messages.map((msg, i) => (
                        <div key={i} className={`${msg.role === 'user' ? 'text-right text-white' : 'text-left text-cyan-400'}`}>
                            <span className="opacity-50 mr-1">{msg.role === 'user' ? '>' : '#'}</span>
                            {msg.text}
                        </div>
                    ))}
                    {isLoading && <div className="text-cyan-600 animate-pulse">Computing...</div>}
                </div>

                <form onSubmit={handleSubmit} className="mt-2 flex border-t border-cyan-900 pt-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Query system..."
                        className="flex-1 bg-transparent outline-none text-xs text-white placeholder-cyan-900"
                    />
                    <button type="submit" disabled={isLoading} className="text-cyan-500 hover:text-white px-2">
                        [SEND]
                    </button>
                </form>
            </div>
        </Html>
    );
}
