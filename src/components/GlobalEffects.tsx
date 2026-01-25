'use client';

import dynamic from 'next/dynamic';
import OverscrollPreventer from "@/components/OverscrollPreventer";

const TechCursor = dynamic(() => import('@/components/TechCursor'), { ssr: false });
const AIAgent = dynamic(() => import('@/components/ai-agent/AIAgent'), { ssr: false });

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
        </>
    );
}
