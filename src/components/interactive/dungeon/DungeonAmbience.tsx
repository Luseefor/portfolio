'use client';

import { useEffect, useRef } from 'react';
import { useDungeonInput } from '@/lib/dungeonInput';
import { clampVolume, useSettings } from '@/lib/settings';

const AMBIENCE_BASE_VOLUME = 0.35;

function getSafeDuration(audio: HTMLAudioElement) {
  return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
}

export default function DungeonAmbience() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const mouseDown = useDungeonInput((state) => state.mouseDown);
  const masterVolume = useSettings((state) => state.masterVolume);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/ambience/166187__drminky__creepy-dungeon-ambience.wav');
      audioRef.current.loop = true;
      audioRef.current.volume = clampVolume(AMBIENCE_BASE_VOLUME);
    }
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const volumeScale = clampVolume(masterVolume);

    const schedulePulse = () => {
      const delay = 4000 + Math.random() * 5000;
      timeoutRef.current = window.setTimeout(() => {
        const active = isPointerLocked || mouseDown;
        if (!active) {
          schedulePulse();
          return;
        }
        const fadeRoll = Math.random();
        if (fadeRoll < 0.22) {
          audio.volume = clampVolume(0);
          audio.pause();
          const silence = 1500 + Math.random() * 2000;
          timeoutRef.current = window.setTimeout(() => {
            const duration = getSafeDuration(audio);
            const seekMax = duration > 2 ? duration - 2 : 0;
            audio.currentTime = seekMax > 0 ? Math.random() * seekMax : 0;
            audio.volume = clampVolume((0.18 + Math.random() * 0.25) * volumeScale);
            audio.play().catch(() => {});
            schedulePulse();
          }, silence);
          return;
        }
        audio.volume = clampVolume((0.18 + Math.random() * 0.42) * volumeScale);
        schedulePulse();
      }, delay);
    };

    schedulePulse();
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPointerLocked, masterVolume, mouseDown]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const volumeScale = clampVolume(masterVolume);
    audio.volume = clampVolume(AMBIENCE_BASE_VOLUME * volumeScale);
    if (isPointerLocked || mouseDown) {
      audio.play().catch(() => {});
    }
  }, [isPointerLocked, masterVolume, mouseDown]);

  return null;
}
