import { useCallback, useEffect, useRef } from 'react';
import { clampVolume } from '@/lib/settings';

const UI_OPEN_SOUND = '/sounds/ui/ui_open.wav';
const UI_CLOSE_SOUND = '/sounds/ui/ui_close.wav';
const BASE_UI_VOLUME = 0.35;

function safePauseAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return;
  try {
    audio.pause();
  } catch {
    // Ignore pause errors in non-browser test environments.
  }
}

function safePlayAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return;
  try {
    const maybePromise = audio.play();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => { });
    }
  } catch {
    // Ignore play errors in restricted/test environments.
  }
}

export function useDungeonUiAudio(masterVolume: number) {
  const uiOpenAudioRef = useRef<HTMLAudioElement | null>(null);
  const uiCloseAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousMasterVolumeRef = useRef(clampVolume(masterVolume) > 0.001 ? clampVolume(masterVolume) : 0.7);

  useEffect(() => {
    uiOpenAudioRef.current = new Audio(UI_OPEN_SOUND);
    uiCloseAudioRef.current = new Audio(UI_CLOSE_SOUND);
    uiOpenAudioRef.current.volume = BASE_UI_VOLUME;
    uiCloseAudioRef.current.volume = BASE_UI_VOLUME;
    return () => {
      if (uiOpenAudioRef.current) {
        safePauseAudio(uiOpenAudioRef.current);
        uiOpenAudioRef.current = null;
      }
      if (uiCloseAudioRef.current) {
        safePauseAudio(uiCloseAudioRef.current);
        uiCloseAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const safeMasterVolume = clampVolume(masterVolume);
    const safeVolume = safeMasterVolume * 0.5;
    if (safeMasterVolume > 0.001) {
      previousMasterVolumeRef.current = safeMasterVolume;
    }
    if (uiOpenAudioRef.current) uiOpenAudioRef.current.volume = safeVolume;
    if (uiCloseAudioRef.current) uiCloseAudioRef.current.volume = safeVolume;
  }, [masterVolume]);

  const playUIOpenSound = useCallback(() => {
    if (!uiOpenAudioRef.current) return;
    uiOpenAudioRef.current.currentTime = 0;
    safePlayAudio(uiOpenAudioRef.current);
  }, []);

  const playUICloseSound = useCallback(() => {
    if (!uiCloseAudioRef.current) return;
    uiCloseAudioRef.current.currentTime = 0;
    safePlayAudio(uiCloseAudioRef.current);
  }, []);

  return { playUIOpenSound, playUICloseSound, previousMasterVolumeRef };
}
