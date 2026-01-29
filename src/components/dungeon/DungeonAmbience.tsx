'use client';

import { PositionalAudio } from '@react-three/drei';

export default function DungeonAmbience() {
  return (
    <PositionalAudio
      url="/sounds/ambience/dungeon_loop.mp3"
      distance={50}
      loop
      autoplay
      volume={0.3}
    />
  );
}
