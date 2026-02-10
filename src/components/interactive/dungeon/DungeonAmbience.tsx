'use client';

import { useEffect, useRef } from 'react';
import { useDungeonInput } from '@/lib/dungeonInput';

export default function DungeonAmbience() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const mouseDown = useDungeonInput((state) => state.mouseDown);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/ambience/166187__drminky__creepy-dungeon-ambience.wav');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
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
          audio.volume = 0;
          audio.pause();
          const silence = 1500 + Math.random() * 2000;
          timeoutRef.current = window.setTimeout(() => {
            audio.currentTime = Math.random() * Math.max(1, audio.duration - 2);
            audio.volume = 0.18 + Math.random() * 0.25;
            audio.play().catch(() => {});
            schedulePulse();
          }, silence);
          return;
        }
        audio.volume = 0.18 + Math.random() * 0.42;
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
  }, [isPointerLocked, mouseDown]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPointerLocked || mouseDown) {
      audio.play().catch(() => {});
    }
  }, [isPointerLocked, mouseDown]);

  return null;
}
