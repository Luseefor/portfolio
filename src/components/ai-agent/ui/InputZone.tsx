'use client';
import { Send } from 'lucide-react';

interface InputZoneProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export default function InputZone({ input, setInput, onSend, isLoading }: InputZoneProps) {
  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder="Ask a question or type a command..."
        disabled={isLoading}
        className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500/60 disabled:opacity-50 dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500/60"
      />
      <button
        onClick={onSend}
        disabled={isLoading || !input.trim()}
        className="absolute right-2 rounded-xl p-2 text-emerald-500 transition-all hover:bg-emerald-500/10 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
