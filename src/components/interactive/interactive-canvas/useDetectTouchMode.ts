import { useEffect } from 'react';

export function useDetectTouchMode(setTouchDevice: (isTouchDevice: boolean) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const computeIsTouchDevice = () => {
      if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return false;
      const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return coarsePointer || touchCapable;
    };
    const updateTouchMode = () => setTouchDevice(computeIsTouchDevice());
    updateTouchMode();
    window.addEventListener('resize', updateTouchMode);
    return () => window.removeEventListener('resize', updateTouchMode);
  }, [setTouchDevice]);
}
