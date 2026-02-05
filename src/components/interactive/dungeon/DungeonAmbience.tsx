'use client';

import { useEffect, useRef } from 'react';
import { useDungeonInput } from '@/lib/dungeonInput';

export default function DungeonAmbience() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const mouseDown = useDungeonInput((state) => state.mouseDown);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/ambience/166187__drminky__creepy-dungeon-ambience.wav');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.45;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPointerLocked || mouseDown) {
      audio.play().catch(() => {});
    }
  }, [isPointerLocked, mouseDown]);

  return null;
}
