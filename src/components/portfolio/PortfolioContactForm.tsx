'use client';

import { useState } from 'react';
import type { CSSProperties, ChangeEvent, FormEvent } from 'react';
import { CheckCircle2, LoaderCircle, Send, TriangleAlert } from 'lucide-react';

type ContactFormState = {
  name: string;
  email: string;
  context: string;
  message: string;
  company: string;
};

type SubmitState =
  | { status: 'idle'; message: string }
  | { status: 'submitting'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

const INITIAL_FORM: ContactFormState = {
  name: '',
  email: '',
  context: '',
  message: '',
  company: '',
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type PortfolioContactFormProps = {
  accent: string;
  surfaceStyle: CSSProperties;
  inputStyle: CSSProperties;
  mutedTextStyle: CSSProperties;
  labelStyle?: CSSProperties;
};

export default function PortfolioContactForm({
  accent,
  surfaceStyle,
  inputStyle,
  mutedTextStyle,
  labelStyle,
}: PortfolioContactFormProps) {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: 'idle',
    message: 'Typical response window: within a couple of days.',
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setSubmitState({
        status: 'error',
        message: 'Name, email, and message are required.',
      });
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setSubmitState({
        status: 'error',
        message: 'Enter a valid email address.',
      });
      return;
    }

    setSubmitState({
      status: 'submitting',
      message: 'Sending your message...',
    });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          context: form.context.trim(),
          message: form.message.trim(),
          company: form.company.trim(),
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setSubmitState({
          status: 'error',
          message: payload.error ?? 'Something went wrong while sending your message.',
        });
        return;
      }

      setSubmitState({
        status: 'success',
        message: payload.message ?? 'Message sent successfully.',
      });
      setForm(INITIAL_FORM);
    } catch {
      setSubmitState({
        status: 'error',
        message: 'Unable to reach the contact endpoint right now.',
      });
    }
  };

  return (
    <div className="self-start border p-5 sm:p-6 md:p-8" style={surfaceStyle}>
      <div className="mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
            Contact Form
          </p>
          <h3 className="mt-4 font-display text-[2rem] font-semibold leading-none sm:text-[2.35rem]">
            Start the Conversation
          </h3>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          autoComplete="off"
          tabIndex={-1}
          className="hidden"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span
              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={labelStyle ?? mutedTextStyle}
            >
              Name
            </span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full border px-4 py-3.5 text-sm text-inherit outline-none transition"
              style={inputStyle}
            />
          </label>
          <label className="block">
            <span
              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={labelStyle ?? mutedTextStyle}
            >
              Email
            </span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border px-4 py-3.5 text-sm text-inherit outline-none transition"
              style={inputStyle}
            />
          </label>
        </div>

        <label className="block">
          <span
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={labelStyle ?? mutedTextStyle}
          >
            Context
          </span>
          <input
            type="text"
            name="context"
            value={form.context}
            onChange={handleChange}
            placeholder="Internship, full-time role, freelance project, or collaboration"
            className="w-full border px-4 py-3.5 text-sm text-inherit outline-none transition"
            style={inputStyle}
          />
        </label>

        <label className="block">
          <span
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={labelStyle ?? mutedTextStyle}
          >
            Message
          </span>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={6}
            placeholder="Share the role, project, or problem you want to discuss."
            className="w-full resize-none border px-4 py-3.5 text-sm text-inherit outline-none transition"
            style={inputStyle}
          />
        </label>

        <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
          <button
            type="submit"
            disabled={submitState.status === 'submitting'}
            className="inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: accent }}
          >
            {submitState.status === 'submitting' ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {submitState.status === 'submitting' ? 'Sending' : 'Send Message'}
          </button>

          <div
            className={`inline-flex items-start gap-2 text-sm leading-6 ${
              submitState.status === 'error' ? 'text-rose-300' : ''
            }`}
            style={submitState.status === 'error' ? undefined : mutedTextStyle}
          >
            {submitState.status === 'success' ? <CheckCircle2 size={16} style={{ color: accent }} /> : null}
            {submitState.status === 'error' ? <TriangleAlert size={16} /> : null}
            <span>{submitState.message}</span>
          </div>
        </div>
      </form>
    </div>
  );
}
