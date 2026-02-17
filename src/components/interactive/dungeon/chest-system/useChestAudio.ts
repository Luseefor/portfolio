import { useEffect, useRef } from 'react';
import { clampVolume } from '@/lib/settings';
import { safePauseAudio } from './model';

const OPEN_SOUND_PATH = '/sounds/props/chest_open.mp3';
const CLOSE_SOUND_PATH = '/sounds/ui/ui_close.wav';

export function useChestAudio(isOpen: boolean, masterVolume: number) {
  const openAudioRef = useRef<HTMLAudioElement | null>(null);
  const closeAudioRef = useRef<HTMLAudioElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!openAudioRef.current) {
      openAudioRef.current = new Audio(OPEN_SOUND_PATH);
      openAudioRef.current.preload = 'auto';
    }
    if (!closeAudioRef.current) {
      closeAudioRef.current = new Audio(CLOSE_SOUND_PATH);
      closeAudioRef.current.preload = 'auto';
    }
    return () => {
      if (openAudioRef.current) {
        safePauseAudio(openAudioRef.current);
        openAudioRef.current = null;
      }
      if (closeAudioRef.current) {
        safePauseAudio(closeAudioRef.current);
        closeAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const safeVolume = clampVolume(masterVolume);
    const openAudio = openAudioRef.current;
    const closeAudio = closeAudioRef.current;
    if (openAudio) openAudio.volume = Number.isFinite(safeVolume) ? safeVolume : 0.7;
    if (closeAudio) closeAudio.volume = Number.isFinite(safeVolume) ? safeVolume * 0.75 : 0.5;

    if (isOpen && !wasOpenRef.current && openAudio) {
      openAudio.currentTime = 0;
      openAudio.play().catch(() => { });
    } else if (!isOpen && wasOpenRef.current && closeAudio) {
      closeAudio.currentTime = 0;
      closeAudio.play().catch(() => { });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, masterVolume]);
}
