'use client';

import dynamic from 'next/dynamic';
import { CircularLoader } from '@/components/CircularLoader';

const Scene = dynamic(() => import('@/components/Scene').then((mod) => mod.Scene), {
    ssr: false,
    loading: () => <CircularLoader />
});

export function ViewCanvas() {
    return <Scene />;
}
