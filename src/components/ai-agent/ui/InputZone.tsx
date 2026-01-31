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
        placeholder="Execute command..."
        disabled={isLoading}
        className="w-full rounded-xl border border-black/5 bg-transparent px-4 py-3 pr-10 text-xs outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500/50 disabled:opacity-50 dark:border-white/5 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-emerald-500/50"
      />
      <button
        onClick={onSend}
        disabled={isLoading || !input.trim()}
        className="absolute right-2 rounded-lg p-1.5 text-emerald-500 transition-all hover:bg-emerald-500/10 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
      >
        <Send size={14} />
      </button>
    </div>
  );
}
