'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { Debug, Physics } from '@react-three/rapier';

export default function PhysicsWorld({ children }: PropsWithChildren) {
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === 'KeyP') {
        setShowDebug((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <Physics colliders={false} gravity={[0, -0.5, 0]} timeStep="vary">
      {showDebug ? <Debug /> : null}
      {children}
    </Physics>
  );
}
