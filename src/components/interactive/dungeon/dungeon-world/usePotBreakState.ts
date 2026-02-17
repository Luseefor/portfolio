import { useEffect, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { clampVolume } from '@/lib/settings';
import { POT_BREAK_BASE_VOLUME, POT_RESPAWN_MS } from './constants';

export function usePotBreakState(masterVolume: number) {
  const [brokenPotIds, setBrokenPotIds] = useState<Set<string>>(() => new Set());
  const potBreakAudioRef = useRef<HTMLAudioElement[]>([]);
  const potBreakAudioIndexRef = useRef(0);
  const potRespawnTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const respawnTimers = potRespawnTimersRef.current;
    if (!potBreakAudioRef.current.length) {
      potBreakAudioRef.current = [new Audio('/sounds/props/pot_break.wav'), new Audio('/sounds/props/pot_break.wav')];
      potBreakAudioRef.current.forEach((audio) => {
        audio.preload = 'auto';
        audio.volume = POT_BREAK_BASE_VOLUME;
      });
    }
    return () => {
      potBreakAudioRef.current.forEach((audio) => audio.pause());
      respawnTimers.forEach((timerId) => window.clearTimeout(timerId));
      respawnTimers.clear();
    };
  }, []);

  useEffect(() => {
    const volumeScale = clampVolume(masterVolume);
    potBreakAudioRef.current.forEach((audio) => {
      audio.volume = POT_BREAK_BASE_VOLUME * volumeScale;
    });
  }, [masterVolume]);

  const handlePotPointerDown = (potId: string, event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (brokenPotIds.has(potId)) return;

    const nextAudio = potBreakAudioRef.current.length ? potBreakAudioRef.current[potBreakAudioIndexRef.current % potBreakAudioRef.current.length] : null;
    potBreakAudioIndexRef.current += 1;
    if (nextAudio) {
      nextAudio.currentTime = 0;
      nextAudio.playbackRate = 0.96 + Math.random() * 0.08;
      nextAudio.play().catch(() => {});
    }

    const existingTimer = potRespawnTimersRef.current.get(potId);
    if (existingTimer !== undefined && typeof window !== 'undefined') window.clearTimeout(existingTimer);

    setBrokenPotIds((previous) => {
      if (previous.has(potId)) return previous;
      const next = new Set(previous);
      next.add(potId);
      return next;
    });

    if (typeof window !== 'undefined') {
      const restoreTimer = window.setTimeout(() => {
        setBrokenPotIds((previous) => {
          if (!previous.has(potId)) return previous;
          const next = new Set(previous);
          next.delete(potId);
          return next;
        });
        potRespawnTimersRef.current.delete(potId);
      }, POT_RESPAWN_MS);
      potRespawnTimersRef.current.set(potId, restoreTimer);
    }
  };

  return { brokenPotIds, handlePotPointerDown };
}
