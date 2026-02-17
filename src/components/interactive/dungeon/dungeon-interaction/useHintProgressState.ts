import { useCallback, useEffect, useState } from 'react';
import {
  clearHintProgressStorage,
  getInitialHintProgress,
  persistHintProgress,
  readHintProgressFromStorage,
  type HintProgressState,
} from '@/components/interactive/dungeon/ui/chest-content/hints';

export function useHintProgressState() {
  const [hintProgress, setHintProgress] = useState<HintProgressState>(() => getInitialHintProgress());
  const [hintToast, setHintToast] = useState<string | null>(null);

  useEffect(() => {
    setHintProgress(readHintProgressFromStorage());
  }, []);

  useEffect(() => {
    persistHintProgress(hintProgress);
  }, [hintProgress]);

  useEffect(() => {
    if (!hintToast) return;
    const timeout = window.setTimeout(() => setHintToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [hintToast]);

  const resetHints = useCallback(() => {
    setHintProgress(getInitialHintProgress());
    clearHintProgressStorage();
    setHintToast('Konami clues reset.');
  }, []);

  return {
    hintProgress,
    hintToast,
    setHintProgress,
    setHintToast,
    resetHints,
  };
}
