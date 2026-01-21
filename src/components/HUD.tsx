'use client';

import { Cpu, Wifi, Battery, MapPin } from 'lucide-react';

export function HUD() {
    return (
        <div className="fixed inset-0 pointer-events-none p-6 flex flex-col justify-between z-50 text-cyan-400 font-mono select-none">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                {/* Logo / Status */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Cpu size={24} className="animate-pulse" />
                        <h1 className="text-2xl font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                            SYSTEM_OS
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs opacity-70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-cyan-900 w-fit">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        ONLINE :: v2.5.0
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-900/50">
                        <MapPin size={14} />
                        <span>SEC: 01</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-900/50">
                        <Wifi size={14} />
                        <span>CONN: STABLE</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-900/50">
                        <Battery size={14} />
                        <span>PWR: 98%</span>
                    </div>
                </div>
            </div>

            {/* Center Reticle (Optional Decoration) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-900/20 rounded-full flex items-center justify-center pointer-events-none opacity-50">
                <div className="w-1 h-1 bg-cyan-500 rounded-full" />
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-between items-end">
                {/* Speed / RPM Graphic */}
                <div className="flex items-end gap-2">
                    <div className="w-48 bg-black/40 backdrop-blur-md p-2 rounded-tr-xl border-l-2 border-cyan-500 border-t border-cyan-900/50">
                        <div className="text-[10px] mb-1 text-cyan-600">CPU LOAD</div>
                        <div className="h-6 flex items-end gap-0.5">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-[${Math.random() * 100}%] bg-cyan-500/80`}
                                    style={{ height: `${20 + Math.random() * 80}%`, opacity: i > 15 ? 0.3 : 1 }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation Prompt */}
                <div className="text-right">
                    <div className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-transparent">
                        SCROLL
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] animate-pulse">To Initialize Sequence</p>
                </div>
            </div>
        </div>
    );
}
