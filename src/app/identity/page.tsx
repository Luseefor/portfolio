'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Folder, Grip, Search, MoreHorizontal, Activity, ShieldCheck, Globe, Cpu, Terminal } from 'lucide-react';

export default function IdentityPage() {
    const [currentPath, setCurrentPath] = React.useState<string[]>(['root']);
    const [animDirection, setAnimDirection] = React.useState(1);

    const fileSystem: any = {
        root: {
            folders: [
                { name: 'commercial', icon: Folder, desc: 'Client work & Production systems' },
                { name: 'experimental', icon: Activity, desc: 'R&D, Shaders & Prototypes' },
                { name: 'system', icon: Cpu, desc: 'Core Competencies & Stack' }
            ],
            files: []
        },
        commercial: {
            folders: [],
            files: [
                { title: 'DeFi_Protocol_V2', desc: 'Automated liquidity provision system with MEV protection.', year: '2024', icon: ShieldCheck, type: 'spec' },
                { title: 'Global_CDN_Edge', desc: 'Distributed edge caching layer for high-frequency trading data.', year: '2024', icon: Globe, type: 'spec' },
                { title: 'Cyber_Sec_Audit', desc: 'Automated penetration testing suite for smart contracts.', year: '2025', icon: ShieldCheck, type: 'report' },
            ]
        },
        experimental: {
            folders: [],
            files: [
                { title: 'Neural_Network_Vis', desc: 'Real-time 3D visualization of transformer model weights and biases.', year: '2025', icon: Activity, type: 'prototype' },
                { title: 'Quantum_Sim', desc: 'Browser-based quantum circuit simulator using WebGL compute shaders.', year: '2023', icon: Cpu, type: 'sim' },
                { title: 'OS_Interface', desc: 'The very operating system you are currently navigating.', year: '2026', icon: Terminal, type: 'live' },
            ]
        },
        system: {
            folders: [],
            files: [
                { title: 'Full_Stack_Core', desc: 'TypeScript, React, Node.js, PostgreSQL, AWS', year: '2025', icon: Terminal, type: 'stack' },
                { title: 'Graphics_Engine', desc: 'WebGL, Three.js, GLSL, Metal', year: '2024', icon: Activity, type: 'stack' },
                { title: 'Smart_Contracts', desc: 'Solidity, Rust, EVM Architecture', year: '2025', icon: ShieldCheck, type: 'stack' },
            ]
        }
    };

    const currentFolder = fileSystem[currentPath[currentPath.length - 1]] || fileSystem['root'];

    const navigateTo = (folderName: string) => {
        setAnimDirection(1);
        setCurrentPath([...currentPath, folderName]);
    };

    const navigateUp = () => {
        if (currentPath.length > 1) {
            setAnimDirection(-1);
            setCurrentPath(currentPath.slice(0, -1));
        }
    };

    const navigateToBreadcrumb = (index: number) => {
        if (index < currentPath.length - 1) {
            setAnimDirection(-1);
            setCurrentPath(currentPath.slice(0, index + 1));
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#FAFAFA] text-[#111111] font-mono selection:bg-black selection:text-white cursor-none">
            {/* Navigation Bar */}
            <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA]/80 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#666666] transition-colors hover:text-black">
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        <span>Return to OS</span>
                    </Link>
                    <div className="h-4 w-[1px] bg-[#E5E5E5]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Identity // Documentation</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-[#999999]">READ_ONLY_MODE</span>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="mx-auto max-w-5xl px-6 pt-32 pb-20">

                {/* Dynamic Header */}
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={currentPath.join('/')}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="mb-2 text-4xl font-black tracking-tighter uppercase md:text-6xl text-[#111]">
                            {currentPath[currentPath.length - 1] === 'root' ? 'ROOT_DIRECTORY' : currentPath[currentPath.length - 1]}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-[#666666]">
                            {currentPath.map((segment, i) => (
                                <React.Fragment key={i}>
                                    <button
                                        onClick={() => navigateToBreadcrumb(i)}
                                        className={`uppercase tracking-widest hover:text-black hover:underline ${i === currentPath.length - 1 ? 'font-bold text-black' : ''}`}
                                    >
                                        {segment}
                                    </button>
                                    {i < currentPath.length - 1 && <span className="text-[#CCC]">/</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                </header>

                {/* Content Grid */}
                <section>
                    <div className="mb-6 flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#999999]">
                            {currentPath.length > 1 && (
                                <button onClick={navigateUp} className="flex items-center gap-1 hover:text-black transition-colors mr-2">
                                    <ArrowLeft size={12} />
                                    <span>BACK</span>
                                </button>
                            )}
                            <Folder size={14} />
                            <span>{currentPath.length} Items</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="rounded p-1 hover:bg-[#F0F0F0] text-[#999999] hover:text-black transition-colors"><Search size={14} /></button>
                            <button className="rounded p-1 hover:bg-[#F0F0F0] text-[#999999] hover:text-black transition-colors"><Grip size={14} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Folders */}
                        {currentFolder.folders.map((folder: any, i: number) => (
                            <motion.div
                                key={`folder-${folder.name}`}
                                initial={{ opacity: 0, x: animDirection * 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -animDirection * 20 }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                onClick={() => navigateTo(folder.name)}
                                className="group flex cursor-pointer items-center justify-between rounded-lg border border-[#E5E5E5] bg-white p-4 transition-all hover:bg-[#F8F8F8] hover:border-[#D4D4D4]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded bg-[#F0F0F0] text-[#444] group-hover:bg-[#E5E5E5] group-hover:text-black transition-colors">
                                        <folder.icon size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wide">{folder.name}</h3>
                                        <p className="text-[10px] text-[#888]">{folder.desc}</p>
                                    </div>
                                </div>
                                <ArrowLeft size={14} className="rotate-180 text-[#CCC] transition-colors group-hover:text-black" />
                            </motion.div>
                        ))}

                        {/* Files */}
                        {currentFolder.files.map((file: any, i: number) => (
                            <motion.div
                                key={`file-${file.title}`}
                                initial={{ opacity: 0, x: animDirection * 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (currentFolder.folders.length * 0.05) + (i * 0.05), duration: 0.3 }}
                                className="group relative flex min-h-[220px] cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-[#E5E5E5] bg-white p-6 transition-all hover:-translate-y-1 hover:border-black/5 hover:shadow-xl"
                            >
                                <div>
                                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAFAFA] text-[#333333] transition-colors group-hover:bg-black group-hover:text-white">
                                        <file.icon size={20} />
                                    </div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="text-base font-bold leading-tight">{file.title}</h3>
                                        <span className="rounded bg-[#F5F5F5] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#888]">{file.type}</span>
                                    </div>
                                    <p className="leading-relaxed text-xs text-[#666666]">{file.desc}</p>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-[#F5F5F5] pt-3">
                                    <span className="text-[10px] uppercase tracking-widest text-[#999999] transition-colors group-hover:text-black">{file.year}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999] transition-colors group-hover:text-black">View</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {currentFolder.folders.length === 0 && currentFolder.files.length === 0 && (
                        <div className="flex h-64 w-full flex-col items-center justify-center text-[#CCC]">
                            <Folder size={48} className="mb-4 opacity-20" />
                            <span className="text-xs font-bold uppercase tracking-widest">Directory Empty</span>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
