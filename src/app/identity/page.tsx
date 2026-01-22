'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Folder, Grip, Search, MoreHorizontal, Activity, ShieldCheck, Globe, Cpu, Terminal } from 'lucide-react';

export default function IdentityPage() {
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

                {/* Header Section */}
                <header className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="mb-6 text-6xl font-black tracking-tighter md:text-8xl">IDENTITY</h1>
                        <p className="max-w-xl text-lg text-[#666666] md:text-xl leading-relaxed">
                            A comprehensive archive of technical competencies, project directives, and professional history.
                        </p>
                    </motion.div>
                </header>

                {/* Documentation Grid */}
                <section>
                    <div className="mb-8 flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#999999]">
                            <Folder size={14} />
                            <span>Root / Documents</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="rounded p-1 hover:bg-[#F0F0F0] text-[#999999] hover:text-black transition-colors"><Search size={14} /></button>
                            <button className="rounded p-1 hover:bg-[#F0F0F0] text-[#999999] hover:text-black transition-colors"><Grip size={14} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: 'Neural_Network_Vis', desc: 'Real-time 3D visualization of transformer model weights and biases.', year: '2025', icon: Activity },
                            { title: 'DeFi_Protocol_V2', desc: 'Automated liquidity provision system with MEV protection.', year: '2024', icon: ShieldCheck },
                            { title: 'Global_CDN_Edge', desc: 'Distributed edge caching layer for high-frequency trading data.', year: '2024', icon: Globe },
                            { title: 'Quantum_Sim', desc: 'Browser-based quantum circuit simulator using WebGL compute shaders.', year: '2023', icon: Cpu },
                            { title: 'OS_Interface', desc: 'The very operating system you are currently navigating.', year: '2026', icon: Terminal },
                            { title: 'Cyber_Sec_Audit', desc: 'Automated penetration testing suite for smart contracts.', year: '2025', icon: ShieldCheck },
                        ].map((project, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                                className="group relative flex min-h-[280px] cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-[#E5E5E5] bg-white p-6 transition-all hover:-translate-y-1 hover:border-black/5 hover:shadow-2xl"
                            >
                                <div>
                                    <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAFAFA] text-[#333333] transition-colors group-hover:bg-black group-hover:text-white">
                                        <project.icon size={20} />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold leading-tight">{project.title}</h3>
                                    <p className="leading-relaxed text-sm text-[#666666]">{project.desc}</p>
                                </div>

                                <div className="mt-8 flex items-center justify-between border-t border-[#F5F5F5] pt-4">
                                    <span className="text-[10px] uppercase tracking-widest text-[#999999] transition-colors group-hover:text-black">{project.year}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999] transition-colors group-hover:text-black">View Spec</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section className="mt-20 border-t border-[#E5E5E5] pt-12">
                    <h2 className="mb-8 text-2xl font-bold tracking-tight">Technical_Competencies</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {['TypeScript', 'React.js', 'Next.js', 'WebGL', 'Three.js', 'Node.js', 'PostgreSQL', 'System Architecture', 'Rust', 'Solidity', 'Python', 'AWS'].map((tech, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg border border-[#F0F0F0] bg-white p-4 transition-colors hover:border-[#E5E5E5] hover:shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-black/20" />
                                <span className="text-xs font-medium uppercase tracking-wider text-[#444]">{tech}</span>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}
