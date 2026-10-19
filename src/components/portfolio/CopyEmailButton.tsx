'use client';

import { useRef, useState } from 'react';
import { Copy } from 'lucide-react';

export default function CopyEmailButton({ email }: { email: string }) {
  const [status, setStatus] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const copyTotal = useRef(0);

  async function copyEmail() {
    const hadFallback = showFallback;
    let copied = false;
    try {
      await navigator.clipboard.writeText(email);
      copied = true;
    } catch {
      const selection = document.createElement('textarea');
      selection.value = email;
      selection.setAttribute('readonly', '');
      selection.style.position = 'fixed';
      selection.style.opacity = '0';
      document.body.appendChild(selection);
      selection.select();
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      } finally {
        selection.remove();
        buttonRef.current?.focus();
      }
    }
    setShowFallback(!copied);
    if (copied) {
      copyTotal.current += 1;
      setStatus(copyTotal.current > 1 ? `Email copied (${copyTotal.current})` : 'Email copied');
    } else {
      setStatus('Select the email below and copy it.');
    }
    if (copied && hadFallback) buttonRef.current?.focus();
  }

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={copyEmail}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
      >
        Copy Email <Copy size={16} aria-hidden="true" />
      </button>
      <p role="status" className="text-xs">
        {status}
      </p>
      {showFallback ? (
        <input
          type="text"
          readOnly
          value={email}
          aria-label="Email address to copy"
          className="mt-2 w-full rounded border bg-transparent p-2 text-sm"
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
        />
      ) : null}
    </div>
  );
}
