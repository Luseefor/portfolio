'use client';

import dynamic from 'next/dynamic';
import OverscrollPreventer from './OverscrollPreventer';

const TechCursor = dynamic(() => import('./TechCursor'), { ssr: false });
const AIAgent = dynamic(() => import('@/components/ai-agent/AIAgent'), { ssr: false });
const FloatingAIBlob = dynamic(() => import('./FloatingAIBlob'), { ssr: false });

import { useEffect } from 'react';

export default function GlobalEffects() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <>
      <OverscrollPreventer />
      <TechCursor />
      <AIAgent />
      <FloatingAIBlob />
    </>
  );
}
