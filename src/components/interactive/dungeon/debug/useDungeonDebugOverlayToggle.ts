'use client';

import { useEffect, useState } from 'react';

const DEBUG_STORAGE_KEY = 'interactiveDungeonDebugOverlayV1';

function loadInitialValue() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DEBUG_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function useDungeonDebugOverlayToggle() {
  const [debugOverlayEnabled, setDebugOverlayEnabled] = useState<boolean>(loadInitialValue);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'F1') return;
      event.preventDefault();
      setDebugOverlayEnabled((value) => !value);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEBUG_STORAGE_KEY, debugOverlayEnabled ? '1' : '0');
    } catch {
      // Ignore persistence errors in privacy-restricted environments.
    }
  }, [debugOverlayEnabled]);

  return debugOverlayEnabled;
}
