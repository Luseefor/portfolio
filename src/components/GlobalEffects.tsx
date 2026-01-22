'use client';

import dynamic from 'next/dynamic';
import OverscrollPreventer from "@/components/OverscrollPreventer";

const TechCursor = dynamic(() => import('@/components/TechCursor'), { ssr: false });
const AIAgent = dynamic(() => import('@/components/ai-agent/AIAgent'), { ssr: false });

export default function GlobalEffects() {
    return (
        <>
            <OverscrollPreventer />
            <TechCursor />
            <AIAgent />
        </>
    );
}
