'use client';

import { PositionalAudio } from '@react-three/drei';

export default function DungeonAmbience() {
  return (
    <PositionalAudio
      url="/sounds/ambience/166187__drminky__creepy-dungeon-ambience.wav"
      distance={50}
      loop
      autoplay
    />
  );
}
