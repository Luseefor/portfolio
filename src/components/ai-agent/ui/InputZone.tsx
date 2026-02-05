'use client';
import { Send } from 'lucide-react';

interface InputZoneProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isDark: boolean;
}

export default function InputZone({ input, setInput, onSend, isLoading, isDark }: InputZoneProps) {
  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--ai-accent-60)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--ai-accent-20)';
        }}
        placeholder="Ask a question or type a command..."
        disabled={isLoading}
        className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-slate-400 disabled:opacity-50 ${
          isDark
            ? 'border-white/10 bg-black/40 text-white placeholder:text-slate-500'
            : 'border-black/10 bg-white/80 text-slate-900'
        }`}
        style={{ borderColor: 'var(--ai-accent-20)' }}
      />
      <button
        onClick={onSend}
        disabled={isLoading || !input.trim()}
        className="absolute right-2 rounded-xl p-2 transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
        style={{ color: 'var(--ai-accent)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--ai-accent-10)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Send size={16} />
      </button>
    </div>
  );
}
