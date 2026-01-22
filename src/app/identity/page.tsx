'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function IdentityPage() {
    return (
        <div className="min-h-screen w-full bg-[#FAFAFA] text-[#111111] font-mono selection:bg-black selection:text-white cursor-none flex flex-col items-center justify-center">
            {/* Navigation Bar */}
            <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA]/80 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#666666] transition-colors hover:text-black">
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        <span>Return to OS</span>
                    </Link>
                </div>
            </nav>

            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">Welcome</h1>
        </div>
    );
}
