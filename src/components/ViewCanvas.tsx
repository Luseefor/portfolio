'use client';

import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('@/components/Scene').then((mod) => mod.Scene), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-black flex items-center justify-center text-cyan-500 font-mono">INITIALIZING SYSTEM...</div>
});

export function ViewCanvas() {
    return <Scene />;
}
