'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Send } from 'lucide-react';
import { portfolioData } from '@/content/portfolio';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

export default function ContactPanel({ theme }: ChestPanelTemplateProps) {
  const [status, setStatus] = useState('Send Message');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('Transmitting...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Signal Received');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Transmission Failed');
      }
    } catch {
      setStatus('Connection Error');
    } finally {
      setTimeout(() => setStatus('Send Message'), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] font-terminal" style={{ color: theme.accentMuted }}>
        {portfolioData.contact.cta}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Your name"
          className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="you@example.com"
          className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500"
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          placeholder="What are we building?"
          className="w-full resize-none rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500"
        />

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-terminal text-stone-100"
          style={{ borderColor: theme.accentBorderStrong, backgroundColor: theme.accentBgSoft }}
        >
          <Send size={12} />
          {status}
        </button>
      </form>

      <p className="text-xs text-stone-400">Direct: {portfolioData.contact.email}</p>
    </div>
  );
}
