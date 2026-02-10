'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import OverscrollPreventer from './OverscrollPreventer';

const TechCursor = dynamic(() => import('./TechCursor'), { ssr: false });
const AIAgent = dynamic(() => import('@/components/ai-agent/AIAgent'), { ssr: false });
const FloatingAIBlob = dynamic(() => import('./FloatingAIBlob'), { ssr: false });

import { useEffect } from 'react';

export default function GlobalEffects() {
  const pathname = usePathname();
  const showFloatingBlob = pathname !== '/';
  const allowContextMenu = pathname?.startsWith('/interactive');

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (allowContextMenu) return;
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [allowContextMenu]);

  return (
    <>
      <OverscrollPreventer />
      <TechCursor />
      <AIAgent />
      {showFloatingBlob ? <FloatingAIBlob /> : null}
    </>
  );
}
